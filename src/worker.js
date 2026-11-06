/* Password gate for kotsw.com/wedding.

   wrangler.jsonc sends only /wedding and /wedding/* through this Worker
   (assets.run_worker_first). Every other page is served as before.

   The password is a secret named WEDDING_PASSWORD. Set it in the Cloudflare
   dashboard (Workers & Pages > kotsw > Settings > Variables and Secrets), or
   locally in .dev.vars. It is never in the repo.

   A visitor who enters the right password gets a signed cookie for 30 days.
   The cookie is signed with the password itself, so changing the password
   signs everybody out. The gate covers the photos too, not just the page. */

const COOKIE = "wedding_session";
const MAX_AGE = 60 * 60 * 24 * 30;
const enc = new TextEncoder();

function b64url(buf) {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(key, text) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", k, enc.encode(text)));
}

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function makeToken(password) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return exp + "." + (await hmac(password, "wedding:" + exp));
}

async function tokenOk(password, token) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  return same(sig, await hmac(password, "wedding:" + exp));
}

function getCookie(request, name) {
  for (const part of (request.headers.get("Cookie") || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return "";
}

function safeNext(value) {
  return typeof value === "string" && /^\/wedding(\/|$)/.test(value) && !value.includes("//") ? value : "/wedding/";
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function loginPage(error, next) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Sam and Mel's Wedding</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<style>
:root{--bg:#0b1016;--surface:#111922;--surface2:#1c2833;--line:#26333f;--fg:#e9eef2;--muted:#93a2b0;--copper:#e09a63;--danger:#ee6a56;
  --display:'Big Shoulders Display','Arial Narrow',Impact,sans-serif;--ui:'Figtree',system-ui,-apple-system,'Segoe UI',sans-serif;--mono:'JetBrains Mono',ui-monospace,Menlo,monospace;color-scheme:dark}
@media (prefers-color-scheme: light){:root{--bg:#f5f7f8;--surface:#ffffff;--surface2:#d9e0e6;--line:#cbd5dd;--fg:#0e1319;--muted:#4c5b69;--copper:#a65a26;--danger:#c0392a;color-scheme:light}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;min-height:100dvh;display:grid;place-items:center;background:var(--bg);color:var(--fg);font:16px/1.55 var(--ui);padding:24px max(16px,env(safe-area-inset-left))}
img{max-width:100%;display:block}
.box{width:100%;max-width:420px}
.logo{display:block;line-height:0;margin-bottom:36px}.logo img{height:44px;width:auto}
.eyebrow{font:700 12px/1.3 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0}
h1{font:800 clamp(48px,14vw,72px)/.92 var(--display);text-transform:uppercase;margin:12px 0 14px;text-wrap:balance}
p.lead{color:var(--muted);margin:0 0 24px}
form{border:1px solid var(--line);border-top:3px solid var(--copper);border-radius:12px;background:var(--surface);padding:20px;display:grid;gap:12px}
label{font:700 12px/1.3 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
input{font:500 16px var(--ui);color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:12px;width:100%}
button{font:600 15px/1 var(--ui);color:var(--fg);padding:14px 18px;border-radius:10px;border:1px solid var(--copper);background:color-mix(in srgb,var(--copper) 16%,transparent);cursor:pointer}
button:hover{background:color-mix(in srgb,var(--copper) 26%,transparent)}
:focus-visible{outline:2px solid var(--copper);outline-offset:3px;border-radius:4px}
.err{margin:0;color:var(--danger);font-size:14px}
.back{display:inline-block;margin-top:22px;font:700 12px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);text-decoration:none}
.back:hover{color:var(--fg)}
</style>
</head>
<body>
<main class="box" id="top">
  <a class="logo" href="/"><picture><source srcset="/brand/kotsw-lockup-light.svg" media="(prefers-color-scheme: light)"><img src="/brand/kotsw-lockup-dark.svg" alt="Knights of the Silicon Wafer" height="44"></picture></a>
  <p class="eyebrow">Wedding photos</p>
  <h1>Sam and Mel's Wedding</h1>
  <p class="lead">This gallery is for family and friends. Enter the password we gave you.</p>
  <form method="post" action="/wedding/login">
    <label for="pw">Password</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
    <input type="hidden" name="next" value="${esc(next)}">
    ${error ? '<p class="err" role="alert">That password is not right. Try again.</p>' : ""}
    <button type="submit">Open the photos</button>
  </form>
  <a class="back" href="/#else"><span aria-hidden="true">←</span> Back to kotsw.com</a>
</main>
</body>
</html>`;
}

function html(body, status, extra = {}) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", ...extra },
  });
}

const cookieHeader = (value, maxAge) =>
  `${COOKIE}=${value}; Path=/wedding; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only /wedding is routed here. Anything else is passed straight to the static files.
    if (!/^\/wedding(\/|$)/.test(url.pathname)) return env.ASSETS.fetch(request);

    const password = env.WEDDING_PASSWORD;
    if (!password) return html("The gallery password has not been set yet.", 503);

    if (url.pathname === "/wedding/login" && request.method === "POST") {
      const form = await request.formData();
      const next = safeNext(form.get("next"));
      const given = String(form.get("password") || "");
      // Compare hashes of the two strings so the check does not leak the length.
      const ok = same(await hmac("compare", given), await hmac("compare", password));
      if (!ok) {
        await new Promise((r) => setTimeout(r, 1000)); // slows down guessing
        return html(loginPage(true, next), 401);
      }
      return new Response(null, {
        status: 303,
        headers: { Location: next, "Set-Cookie": cookieHeader(await makeToken(password), MAX_AGE), "Cache-Control": "no-store" },
      });
    }

    if (url.pathname === "/wedding/logout" && request.method === "POST") {
      return new Response(null, { status: 303, headers: { Location: "/wedding/", "Set-Cookie": cookieHeader("", 0), "Cache-Control": "no-store" } });
    }

    if (!(await tokenOk(password, getCookie(request, COOKIE)))) {
      const wantsPage = (request.headers.get("Accept") || "").includes("text/html");
      if (wantsPage) return html(loginPage(false, safeNext(url.pathname + url.search)), 401);
      return new Response("Locked", { status: 401, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
    }

    // Signed in: serve the real file, and keep it out of shared caches and search engines.
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    out.headers.set("X-Robots-Tag", "noindex, nofollow");
    out.headers.set("Cache-Control", /\.(jpe?g|png|webp)$/i.test(url.pathname) ? "private, max-age=86400" : "private, no-cache");
    return out;
  },
};

/* Worker for kotsw.com/wedding: the password gate, the hearts and comments API, and the admin page.

   wrangler.jsonc sends only /wedding and /wedding/* through this Worker
   (assets.run_worker_first). Every other page is served as before.

   Secrets (set in the Cloudflare dashboard, Workers & Pages > kotsw > Settings >
   Variables and Secrets, or locally in .dev.vars). They are never in the repo.
     WEDDING_PASSWORD        the password guests use
     WEDDING_ADMIN_PASSWORD  the password for /wedding/admin (approving comments)

   Database: D1 binding "DB". Tables are in _source/wedding-gallery/schema.sql.

   A visitor who enters the right password gets a signed cookie for 30 days. The
   cookie is signed with the password itself, so changing the password signs
   everybody out. The gate covers the photos and the API too.

   Each browser also gets a random guest id in a cookie. It is how the API knows
   which hearts and comments are yours. It is never sent to other guests. */

const SESSION_COOKIE = "wedding_session";
const GUEST_COOKIE = "wedding_guest";
const ADMIN_COOKIE = "wedding_admin";
const SESSION_AGE = 60 * 60 * 24 * 30;
const GUEST_AGE = 60 * 60 * 24 * 365;
const ADMIN_AGE = 60 * 60 * 24 * 7;
const enc = new TextEncoder();

/* ---------- small helpers ---------- */

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

async function passwordOk(given, secret) {
  // Compare hashes of the two strings so the check does not leak the length.
  return same(await hmac("compare", String(given || "")), await hmac("compare", secret));
}

async function makeToken(secret, scope, age) {
  const exp = Math.floor(Date.now() / 1000) + age;
  return exp + "." + (await hmac(secret, scope + ":" + exp));
}

async function tokenOk(secret, scope, token) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  return same(sig, await hmac(secret, scope + ":" + exp));
}

function getCookie(request, name) {
  for (const part of (request.headers.get("Cookie") || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return "";
}

const cookieHeader = (name, value, maxAge) =>
  `${name}=${value}; Path=/wedding; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

function safeNext(value, fallback = "/wedding/") {
  return typeof value === "string" && /^\/wedding(\/|$)/.test(value) && !value.includes("//") ? value : fallback;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const SECURITY = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

function html(body, status, extra = {}) {
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8", ...SECURITY, ...extra } });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...SECURITY } });
}

/* ---------- login pages ---------- */

const FONTS = "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap";

const BASE_CSS = `
:root{--bg:#0b1016;--surface:#111922;--surface2:#1c2833;--line:#26333f;--fg:#e9eef2;--muted:#93a2b0;--copper:#e09a63;--danger:#ee6a56;--ok:#5fd6a8;
  --display:'Big Shoulders Display','Arial Narrow',Impact,sans-serif;--ui:'Figtree',system-ui,-apple-system,'Segoe UI',sans-serif;--mono:'JetBrains Mono',ui-monospace,Menlo,monospace;color-scheme:dark}
@media (prefers-color-scheme: light){:root{--bg:#f5f7f8;--surface:#ffffff;--surface2:#d9e0e6;--line:#cbd5dd;--fg:#0e1319;--muted:#4c5b69;--copper:#a65a26;--danger:#c0392a;--ok:#13875d;color-scheme:light}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 var(--ui)}
img{max-width:100%;display:block}
button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--copper);outline-offset:3px;border-radius:4px}
.eyebrow{font:700 12px/1.3 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0}
.btn{font:600 15px/1 var(--ui);padding:12px 16px;border-radius:10px;border:1px solid var(--copper);background:color-mix(in srgb,var(--copper) 16%,transparent);cursor:pointer}
.btn:hover{background:color-mix(in srgb,var(--copper) 26%,transparent)}
.btn.plain{border-color:var(--line);background:var(--surface)}
.btn.plain:hover{border-color:var(--copper)}
.btn.bad{border-color:var(--danger);background:color-mix(in srgb,var(--danger) 14%,transparent)}
`;

function loginPage({ eyebrow, title, lead, action, next, button, error }) {
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
<link rel="stylesheet" href="${FONTS}">
<style>${BASE_CSS}
body{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px max(16px,env(safe-area-inset-left))}
.box{width:100%;max-width:420px}
.logo{display:block;line-height:0;margin-bottom:36px}.logo img{height:44px;width:auto}
h1{font:800 clamp(48px,14vw,72px)/.92 var(--display);text-transform:uppercase;margin:12px 0 14px;text-wrap:balance}
p.lead{color:var(--muted);margin:0 0 24px}
form{border:1px solid var(--line);border-top:3px solid var(--copper);border-radius:12px;background:var(--surface);padding:20px;display:grid;gap:12px}
label{font:700 12px/1.3 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
input{font:500 16px var(--ui);color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:12px;width:100%}
.err{margin:0;color:var(--danger);font-size:14px}
.back{display:inline-block;margin-top:22px;font:700 12px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);text-decoration:none}
.back:hover{color:var(--fg)}
</style>
</head>
<body>
<main class="box" id="top">
  <a class="logo" href="/"><picture><source srcset="/brand/kotsw-lockup-light.svg" media="(prefers-color-scheme: light)"><img src="/brand/kotsw-lockup-dark.svg" alt="Knights of the Silicon Wafer" height="44"></picture></a>
  <p class="eyebrow">${esc(eyebrow)}</p>
  <h1>${esc(title)}</h1>
  <p class="lead">${esc(lead)}</p>
  <form method="post" action="${esc(action)}">
    <label for="pw">Password</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
    <input type="hidden" name="next" value="${esc(next)}">
    ${error ? '<p class="err" role="alert">That password is not right. Try again.</p>' : ""}
    <button class="btn" type="submit">${esc(button)}</button>
  </form>
  <a class="back" href="/#else"><span aria-hidden="true">←</span> Back to kotsw.com</a>
</main>
</body>
</html>`;
}

const guestLogin = (error, next) =>
  loginPage({
    eyebrow: "Wedding photos",
    title: "Sam and Mel's Wedding",
    lead: "This gallery is for family and friends. Enter the password we gave you.",
    action: "/wedding/login",
    next,
    button: "Open the photos",
    error,
  });

const adminLogin = (error) =>
  loginPage({
    eyebrow: "Admin",
    title: "Guest comments",
    lead: "Approve or delete what guests write. Enter the admin password.",
    action: "/wedding/admin/login",
    next: "/wedding/admin",
    button: "Sign in",
    error,
  });

/* ---------- guest identity ---------- */

function getGuest(request) {
  const c = getCookie(request, GUEST_COOKIE);
  if (/^[a-f0-9]{32}$/.test(c)) return { id: c, fresh: false };
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return { id: [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(""), fresh: true };
}

function withGuest(res, guest) {
  if (guest.fresh) res.headers.append("Set-Cookie", cookieHeader(GUEST_COOKIE, guest.id, GUEST_AGE));
  return res;
}

/* ---------- input checks ---------- */

const PHOTO_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}$/;

function cleanName(s) {
  return String(s || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);
}

function cleanBody(s) {
  return String(s || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 600);
}

async function readJson(request) {
  if (!(request.headers.get("Content-Type") || "").includes("application/json")) return null;
  try {
    const v = await request.json();
    return v && typeof v === "object" ? v : null;
  } catch (e) {
    return null;
  }
}

const now = () => Math.floor(Date.now() / 1000);

/* ---------- guest API: /wedding/api/... ---------- */

async function guestApi(request, env, path) {
  const guest = getGuest(request);
  const out = (obj, status = 200) => withGuest(json(obj, status), guest);
  if (!env.DB) return out({ error: "nodb" }, 503);
  const route = path.slice("/wedding/api/".length);
  const get = request.method === "GET";
  const post = request.method === "POST";
  const url = new URL(request.url);

  try {
    // Everything the grid needs: counts per photo, and which photos are mine.
    if (route === "state" && get) {
      const [h, c, mine] = await env.DB.batch([
        env.DB.prepare("SELECT photo_id, COUNT(*) AS n FROM favorites GROUP BY photo_id"),
        env.DB.prepare("SELECT photo_id, COUNT(*) AS n FROM comments WHERE status = 'approved' GROUP BY photo_id"),
        env.DB.prepare("SELECT photo_id FROM favorites WHERE guest_id = ?").bind(guest.id),
      ]);
      const counts = {};
      for (const r of h.results) counts[r.photo_id] = { h: r.n, c: 0 };
      for (const r of c.results) (counts[r.photo_id] = counts[r.photo_id] || { h: 0, c: 0 }).c = r.n;
      return out({ counts, mine: mine.results.map((r) => r.photo_id) });
    }

    // One photo: who loved it, and its comments (approved ones, plus my own waiting ones).
    if (route === "photo" && get) {
      const id = url.searchParams.get("id") || "";
      if (!PHOTO_ID.test(id) || id.length > 80) return out({ error: "bad id" }, 400);
      const [n, names, cm] = await env.DB.batch([
        env.DB.prepare("SELECT COUNT(*) AS n FROM favorites WHERE photo_id = ?").bind(id),
        env.DB.prepare("SELECT guest_name FROM favorites WHERE photo_id = ? ORDER BY created_at LIMIT 12").bind(id),
        env.DB.prepare(
          "SELECT id, guest_name, body, status, created_at, (guest_id = ?) AS mine FROM comments " +
            "WHERE photo_id = ? AND (status = 'approved' OR guest_id = ?) ORDER BY created_at LIMIT 200"
        ).bind(guest.id, id, guest.id),
      ]);
      return out({
        heartCount: n.results[0].n,
        hearts: names.results.map((r) => r.guest_name),
        comments: cm.results.map((r) => ({
          id: r.id, name: r.guest_name, body: r.body, at: r.created_at, mine: !!r.mine, pending: r.status !== "approved",
        })),
      });
    }

    if (post && route === "fav") {
      const b = await readJson(request);
      const id = b && String(b.id || "");
      if (!b || !PHOTO_ID.test(id) || id.length > 80) return out({ error: "bad request" }, 400);
      if (b.on) {
        const name = cleanName(b.name);
        if (!name) return out({ error: "name needed" }, 400);
        const total = await env.DB.prepare("SELECT COUNT(*) AS n FROM favorites WHERE guest_id = ?").bind(guest.id).first("n");
        if (total >= 3000) return out({ error: "too many" }, 429);
        await env.DB.prepare(
          "INSERT INTO favorites (photo_id, guest_id, guest_name, created_at) VALUES (?, ?, ?, ?) " +
            "ON CONFLICT (photo_id, guest_id) DO UPDATE SET guest_name = excluded.guest_name"
        ).bind(id, guest.id, name, now()).run();
      } else {
        await env.DB.prepare("DELETE FROM favorites WHERE photo_id = ? AND guest_id = ?").bind(id, guest.id).run();
      }
      const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM favorites WHERE photo_id = ?").bind(id).first("n");
      return out({ count });
    }

    if (post && route === "comment") {
      const b = await readJson(request);
      const id = b && String(b.id || "");
      const name = b && cleanName(b.name);
      const body = b && cleanBody(b.body);
      if (!b || !PHOTO_ID.test(id) || id.length > 80 || !name || !body) return out({ error: "bad request" }, 400);
      const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM comments WHERE guest_id = ? AND created_at > ?").bind(guest.id, now() - 600).first("n");
      const total = await env.DB.prepare("SELECT COUNT(*) AS n FROM comments WHERE guest_id = ?").bind(guest.id).first("n");
      if (recent >= 5 || total >= 200) return out({ error: "slow down" }, 429);
      const t = now();
      const r = await env.DB.prepare(
        "INSERT INTO comments (photo_id, guest_id, guest_name, body, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)"
      ).bind(id, guest.id, name, body, t).run();
      return out({ comment: { id: r.meta.last_row_id, name, body, at: t, mine: true, pending: true } });
    }

    if (post && route === "comment/delete") {
      const b = await readJson(request);
      const cid = b && Number(b.id);
      if (!b || !Number.isInteger(cid)) return out({ error: "bad request" }, 400);
      await env.DB.prepare("DELETE FROM comments WHERE id = ? AND guest_id = ?").bind(cid, guest.id).run();
      return out({ ok: true });
    }

    return out({ error: "not found" }, 404);
  } catch (e) {
    return out({ error: "server" }, 500);
  }
}

/* ---------- admin: /wedding/admin ---------- */

function adminPage() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Guest comments</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${FONTS}">
<style>${BASE_CSS}
.wrap{max-width:820px;margin:0 auto;padding:24px max(16px,env(safe-area-inset-left)) 64px}
h1{font:800 clamp(40px,8vw,64px)/.95 var(--display);text-transform:uppercase;margin:10px 0 6px}
.sub{color:var(--muted);margin:0 0 22px}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 20px}
.bar a{font:700 12px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);text-decoration:none;margin-left:auto}
.tab[aria-pressed="true"]{border-color:var(--copper);background:color-mix(in srgb,var(--copper) 16%,transparent)}
ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}
li{display:grid;grid-template-columns:96px 1fr;gap:14px;border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:12px}
li img{width:96px;height:96px;object-fit:cover;border-radius:8px;background:var(--surface2)}
.vtile{width:96px;height:96px;display:grid;place-items:center;border-radius:8px;background:var(--surface2);color:var(--muted);font:700 11px var(--mono);letter-spacing:.08em;text-transform:uppercase}
.meta{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline;font:700 11px/1.3 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.meta b{color:var(--fg)}
.pill{padding:2px 8px;border-radius:99px;border:1px solid var(--line)}
.pill.pending{border-color:var(--copper);color:var(--copper)}
.pill.approved{border-color:var(--ok);color:var(--ok)}
.txt{margin:8px 0 10px;white-space:pre-wrap;overflow-wrap:anywhere}
.acts{display:flex;gap:8px;flex-wrap:wrap}
.acts .btn{padding:9px 14px;font-size:14px}
.empty{border:1px dashed var(--line);border-radius:12px;padding:24px;color:var(--muted)}
@media (max-width:520px){li{grid-template-columns:72px 1fr}li img,.vtile{width:72px;height:72px}}
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">Admin</p>
  <h1>Guest comments</h1>
  <p class="sub" id="sub">Loading</p>
  <div class="bar">
    <button class="btn plain tab" id="tpend" type="button" aria-pressed="true">Waiting</button>
    <button class="btn plain tab" id="tappr" type="button" aria-pressed="false">Approved</button>
    <a href="/wedding/">Open the gallery →</a>
  </div>
  <ul id="list"></ul>
  <p class="empty" id="empty" hidden></p>
</div>
<script>
(function(){
  var all = [], tab = "pending";
  function $(id){ return document.getElementById(id); }
  function post(path, body){
    return fetch(path, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); });
  }
  function when(t){ return new Date(t * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
  function render(){
    var pend = all.filter(function(c){ return c.status === "pending"; }).length;
    $("sub").textContent = pend ? pend + " waiting for you." : "Nothing is waiting.";
    $("tpend").textContent = "Waiting (" + pend + ")";
    $("tappr").textContent = "Approved (" + (all.length - pend) + ")";
    $("tpend").setAttribute("aria-pressed", tab === "pending");
    $("tappr").setAttribute("aria-pressed", tab === "approved");
    var list = $("list"); list.innerHTML = "";
    var rows = all.filter(function(c){ return c.status === tab; });
    $("empty").hidden = rows.length > 0;
    $("empty").textContent = tab === "pending" ? "No comments are waiting." : "No approved comments yet.";
    rows.forEach(function(c){
      var li = document.createElement("li");
      var isVid = c.photo_id.indexOf("video-") === 0;
      var a = document.createElement("a"); a.href = isVid ? "/wedding/videos/#" + c.photo_id : "/wedding/#" + c.photo_id; a.target = "_blank"; a.rel = "noopener";
      if (isVid) {
        var vt = document.createElement("div"); vt.className = "vtile"; vt.textContent = "Video " + c.photo_id.slice(-4);
        a.appendChild(vt);
      } else {
        var im = document.createElement("img"); im.alt = "Photo " + c.photo_id; im.loading = "lazy";
        im.src = "/wedding/thumbs/" + c.photo_id.slice(0, -5) + "/" + c.photo_id.slice(-4) + ".jpg";
        a.appendChild(im);
      }
      li.appendChild(a);
      var d = document.createElement("div");
      var m = document.createElement("div"); m.className = "meta";
      var b = document.createElement("b"); b.textContent = c.guest_name;
      var t = document.createElement("span"); t.textContent = when(c.created_at);
      var p = document.createElement("span"); p.className = "pill " + c.status; p.textContent = c.status === "pending" ? "Waiting" : "Approved";
      m.appendChild(b); m.appendChild(t); m.appendChild(p);
      var x = document.createElement("p"); x.className = "txt"; x.textContent = c.body;
      var acts = document.createElement("div"); acts.className = "acts";
      if(c.status === "pending"){
        var ok = document.createElement("button"); ok.className = "btn"; ok.type = "button"; ok.textContent = "Approve";
        ok.addEventListener("click", function(){ act(c, "approve", ok); }); acts.appendChild(ok);
      }
      var del = document.createElement("button"); del.className = "btn bad"; del.type = "button"; del.textContent = "Delete";
      del.addEventListener("click", function(){
        if(del.dataset.sure !== "1"){ del.dataset.sure = "1"; del.textContent = "Tap again to delete"; setTimeout(function(){ del.dataset.sure = ""; del.textContent = "Delete"; }, 4000); return; }
        act(c, "delete", del);
      });
      acts.appendChild(del);
      d.appendChild(m); d.appendChild(x); d.appendChild(acts); li.appendChild(d); list.appendChild(li);
    });
  }
  function act(c, action, btn){
    btn.disabled = true;
    post("/wedding/admin/api/comment", { id: c.id, action: action }).then(function(){
      if(action === "delete") all = all.filter(function(x){ return x.id !== c.id; }); else c.status = "approved";
      render();
    }).catch(function(){ btn.disabled = false; alert("That did not work. Try again."); });
  }
  $("tpend").addEventListener("click", function(){ tab = "pending"; render(); });
  $("tappr").addEventListener("click", function(){ tab = "approved"; render(); });
  fetch("/wedding/admin/api/comments", { credentials: "same-origin" }).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(d){ all = d.comments; render(); })
    .catch(function(){ $("sub").textContent = "Could not load comments. Is the database set up?"; });
})();
</script>
</body>
</html>`;
}

async function adminRoutes(request, env, path) {
  const secret = env.WEDDING_ADMIN_PASSWORD;
  if (!secret) return html("Admin is not set up. Add the WEDDING_ADMIN_PASSWORD secret in Cloudflare.", 404);

  if (path === "/wedding/admin/login" && request.method === "POST") {
    const form = await request.formData();
    if (!(await passwordOk(form.get("password"), secret))) {
      await new Promise((r) => setTimeout(r, 1000));
      return html(adminLogin(true), 401);
    }
    return new Response(null, {
      status: 303,
      headers: { Location: "/wedding/admin", "Set-Cookie": cookieHeader(ADMIN_COOKIE, await makeToken(secret, "admin", ADMIN_AGE), ADMIN_AGE), ...SECURITY },
    });
  }

  if (!(await tokenOk(secret, "admin", getCookie(request, ADMIN_COOKIE)))) {
    if (path.startsWith("/wedding/admin/api/")) return json({ error: "locked" }, 401);
    return html(adminLogin(false), 401);
  }

  if (path === "/wedding/admin") return html(adminPage(), 200);
  if (!env.DB) return json({ error: "nodb" }, 503);

  try {
    if (path === "/wedding/admin/api/comments" && request.method === "GET") {
      const r = await env.DB.prepare(
        "SELECT id, photo_id, guest_name, body, status, created_at FROM comments ORDER BY created_at DESC LIMIT 1000"
      ).all();
      return json({ comments: r.results });
    }
    if (path === "/wedding/admin/api/comment" && request.method === "POST") {
      const b = await readJson(request);
      const id = b && Number(b.id);
      if (!b || !Number.isInteger(id) || !["approve", "delete"].includes(b.action)) return json({ error: "bad request" }, 400);
      if (b.action === "approve") await env.DB.prepare("UPDATE comments SET status = 'approved' WHERE id = ?").bind(id).run();
      else await env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }
  } catch (e) {
    return json({ error: "server" }, 500);
  }
  return json({ error: "not found" }, 404);
}

/* ---------- main ---------- */

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
      if (!(await passwordOk(form.get("password"), password))) {
        await new Promise((r) => setTimeout(r, 1000)); // slows down guessing
        return html(guestLogin(true, next), 401);
      }
      return new Response(null, {
        status: 303,
        headers: { Location: next, "Set-Cookie": cookieHeader(SESSION_COOKIE, await makeToken(password, "wedding", SESSION_AGE), SESSION_AGE), ...SECURITY },
      });
    }

    if (url.pathname === "/wedding/logout" && request.method === "POST") {
      return new Response(null, { status: 303, headers: { Location: "/wedding/", "Set-Cookie": cookieHeader(SESSION_COOKIE, "", 0), ...SECURITY } });
    }

    if (!(await tokenOk(password, "wedding", getCookie(request, SESSION_COOKIE)))) {
      const wantsPage = (request.headers.get("Accept") || "").includes("text/html");
      if (wantsPage) return html(guestLogin(false, safeNext(url.pathname + url.search)), 401);
      return new Response("Locked", { status: 401, headers: SECURITY });
    }

    // Signed in from here on.
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
    if (path.startsWith("/wedding/api/")) return guestApi(request, env, path);
    if (path === "/wedding/admin" || path.startsWith("/wedding/admin/")) return adminRoutes(request, env, path);

    // Serve the real file, and keep it out of shared caches and search engines.
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    out.headers.set("X-Robots-Tag", "noindex, nofollow");
    out.headers.set("Cache-Control", /\.(jpe?g|png|webp)$/i.test(url.pathname) ? "private, max-age=86400" : "private, no-cache");
    return out;
  },
};

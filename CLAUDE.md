# kotsw.com

Sam's personal site, hosted on Cloudflare Pages. This folder (`kotsw`) is the **base directory of the website**. Anything inside it is published at `kotsw.com/<path>`.

## Folder layout

The repo root is `kotsw/`. **Only the `public/` folder is published.** Cloudflare's build output directory is set to `public`, so everything inside `public/` is served at `kotsw.com/<path>` and everything outside it stays in GitHub only.

```
kotsw/                         (repo root, GitHub)
├─ public/                     <- the website. Cloudflare publishes only this folder.
│  ├─ index.html               home page: logo header, hero, Latest feed, section cards (WoW, Programming, Pinball, Everything else)
│  ├─ favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png   (favicons: the die-grid K)
│  ├─ brand/                   logo files: lockup and crest, SVG and PNG, light and dark, copper and venom-green accent
│  ├─ venomous_abyss_guides/
│  │  └─ ulatek-heroic-guide.html   Heroic Ula'tek (Boss 8)
│  └─ wedding/                 Sam and Mel's Wedding photo gallery. PASSWORD PROTECTED by src/worker.js.
│     ├─ index.html            the gallery page (grid, viewer, favorites kept in the browser)
│     ├─ photos.json           sections and photos, built by build_photos.py (do not edit by hand)
│     └─ photos/, thumbs/      full photos and grid thumbnails, built by build_photos.py
├─ src/worker.js               small Worker: wedding password gate, hearts and comments API (D1), admin page. Only /wedding and /wedding/* run through it.
├─ wrangler.jsonc              Cloudflare Workers config: static assets from public/, plus the Worker above
├─ _source/ulatek-engine/      source parts, build.py and tests for the Ula'tek guide (reusable engine). Read its README.md before building a new guide.
├─ _source/wedding-gallery/    build_photos.py (photographer's zip into public/wedding, run from the repo root) and schema.sql (D1 tables)
├─ _photos_originals/          the photographer's zip. Local only, ignored by git.
├─ STYLE-GUIDE.md              visual and writing rules for every guide and the main index, plus the logo and favicon rules (section 12). Read it first.
└─ CLAUDE.md                   this file
```

The Ula'tek guide is live at `kotsw.com/venomous_abyss_guides/ulatek-heroic-guide.html`.

On Sam's computer the repo root is `C:\Users\sambo\Desktop\kotsw`, the website is `C:\Users\sambo\Desktop\kotsw\public`, and the guides are in `C:\Users\sambo\Desktop\kotsw\public\venomous_abyss_guides`.

## Rules for working here

1. Read `STYLE-GUIDE.md` first. Follow its colors, fonts, components, diagram language, and writing rules. If a guide needs something new, add it to the style guide too.
2. Each guide is **one self-contained `.html` file**. It must include `<!doctype html>`, `<meta charset="utf-8">`, the viewport meta, and an explicit body background. No build step is needed on the server.
3. Save new boss guides in `public/venomous_abyss_guides/` (or a new raid folder next to it inside `public/`, named like `<raid_name>_guides/`). Never put source files, notes, or drafts inside `public/`. Use lowercase, hyphenated file names: `<boss>-<difficulty>-guide.html`.
4. Use `ulatek-heroic-guide.html` as the model. Copy its structure for a new boss rather than starting from scratch.
5. Odds and Evens are the two raid groups in our calls. Odds is amber, Evens is blue. The calls are ours; mechanics come from Wowhead, Mythic Trap, and Method.
6. Do not delete or overwrite a published guide without asking. Make a new file or ask first.
7. Test before saying a guide is done: step through every diagram (clicking a step must show the same picture as playing to it), check light and dark, and check phone width.
8. Logo and favicon: follow `STYLE-GUIDE.md` section 12. Every page needs the three favicon `<link>` tags in `<head>`. Use the logo files in `public/brand/` as they are. Do not redraw, recolor, or stretch them. Pages in the venom-green look use the venom-green accent in place of copper, as section 12 describes. On those pages use the `kotsw-*-venom-*` files in `public/brand/`. Everywhere else, including the home page, use the copper files (no `venom` in the name).
9. Navigation: every page except the home page has the "Back to kotsw.com" link at the very top and a "Back to top" footer link at the very bottom. Use the exact markup and styling in `STYLE-GUIDE.md` section 5 (components). Back links go to the page's section on the home page, for example `/#wow`.

## Home page (`public/index.html`)

- One self-contained file, same rules as a guide (section 9 of the style guide). Dark first, light for light systems.
- The home page is **not** in the venom-green look. It uses a slate and copper look with the copper logo files (no `venom` in the name). Each section has its own accent: World of Warcraft venom green, Programming copper, Pinball blue, Everything else violet. The guides keep their own look.
- **Latest feed:** the `POSTS` array in the script at the bottom of `index.html`. Add one line per new guide or post (`date`, `section`, `title`, `summary`, `href`). It sorts newest first by itself.
- **Section cards:** each section is hand-written HTML. To add a guide, copy the Ula'tek `<article class="card">`, edit it, and put it before the dashed "Soon" card. Delete a "Soon" card once the section has real content.
- When a new page goes live, add it to both places: a card in its section and a line in `POSTS`.

## Publishing workflow

1. Save the new or changed file inside `public/` (never source files or drafts there).
2. Commit and push to `main` on GitHub (`git@github.com:bluthgg/kotsw.git`).
3. Cloudflare Pages picks up the push and deploys `public/`. No build step. A deploy usually takes a minute or two.
4. Check the live page at `kotsw.com`. Favicons are cached hard, so use a private window.

To preview locally before pushing, run `python -m http.server 8000` inside `public/` and open `http://localhost:8000`. Root paths like `/brand/...` only work through a server, not by double-clicking the file.

## Writing style

Plain, short sentences for raiders mid-pull. Name the group and the side. No em dashes. Details are in the style guide.

## Hosting notes

- The site is a Cloudflare Workers project with static assets (see `wrangler.jsonc`), deployed from GitHub. Only `public/` is served. Workers builds normally deploy with `npx wrangler deploy`, which also ships `src/worker.js`. Confirm in the dashboard under Settings, Build.
- **Wedding password:** the secret `WEDDING_PASSWORD` is set in the Cloudflare dashboard (Workers & Pages, kotsw, Settings, Variables and Secrets). It is never in the repo. For local testing put it in `.dev.vars` (ignored by git) and run `npx wrangler dev`. Changing the password signs every guest out. The gate covers the photos too, not just the page.
- **Hearts and comments:** stored in the Cloudflare D1 database `kotsw-wedding` (binding `DB`, declared in `wrangler.jsonc`). Create the tables once by pasting `_source/wedding-gallery/schema.sql` into the D1 Console. Guests type a name once (kept in the browser) and get a random guest cookie. Hearts are shared (counts show on every photo, plus a "Most loved" view). New comments are hidden until approved.
- **Comment approval:** open `/wedding/admin`, sign in with the secret `WEDDING_ADMIN_PASSWORD` (set it like the wedding password). Waiting comments can be approved or deleted. There are no email alerts, so check that page. The guest cookie is per browser, so favorites do not follow a guest to another device.
- To change the wedding photos: put the new zip in `_photos_originals/`, run `python _source/wedding-gallery/build_photos.py`, then commit `public/wedding`.
- A page named `index.html` opens at the bare folder address. Guide files are not named `index.html`, so link to them by their full path.
- The guides keep each visitor's roster in their own browser. There is no server or database.
- Source code, docs, and the engine live outside `public/`, so they are in GitHub but not on the website. To check what is public, look only inside `public/`.

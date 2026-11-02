# kotsw.com

Sam's personal site, hosted on Cloudflare Pages. This folder (`kotsw`) is the **base directory of the website**. Anything inside it is published at `kotsw.com/<path>`.

## Folder layout

The repo root is `kotsw/`. **Only the `public/` folder is published.** Cloudflare's build output directory is set to `public`, so everything inside `public/` is served at `kotsw.com/<path>` and everything outside it stays in GitHub only.

```
kotsw/                         (repo root, GitHub)
├─ public/                     <- the website. Cloudflare publishes only this folder.
│  ├─ index.html               (main page, not built yet)
│  └─ venomous_abyss_guides/
│     └─ ulatek-heroic-guide.html   Heroic Ula'tek (Boss 8)
├─ _source/ulatek-engine/      source parts, build.py and tests for the Ula'tek guide (reusable engine). Read its README.md before building a new guide.
├─ STYLE-GUIDE.md              visual and writing rules for every guide and the main index. Read it first.
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

## Writing style

Plain, short sentences for raiders mid-pull. Name the group and the side. No em dashes. Details are in the style guide.

## Hosting notes

- Cloudflare Pages deploys from GitHub. Build output directory: `public`. No build command.
- A page named `index.html` opens at the bare folder address. Guide files are not named `index.html`, so link to them by their full path.
- The guides keep each visitor's roster in their own browser. There is no server or database.
- Source code, docs, and the engine live outside `public/`, so they are in GitHub but not on the website. To check what is public, look only inside `public/`.

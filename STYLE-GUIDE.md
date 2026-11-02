# kotsw.com Style Guide

Visual and writing rules for the WoW raid guides (and a starting point for the main `index.html`). It is taken from the finished Heroic Ula'tek guide, `public/venomous_abyss_guides/ulatek-heroic-guide.html`. When in doubt, open that file and copy what it does.

Goal of every guide: a guildmate opens one link, picks their group, and can see where to stand and what to do, step by step, without reading a wall of text.

---

## 1. Look and feel

- **Dark first.** The default is a deep teal-black page. A light theme exists for people whose system is set to light. Design both. Never hard-code a color in a component; always use a token.
- **Venom green is the brand accent.** Use it for links on hover, focus rings, eyebrows, the active step, and bullets.
- **Flat and calm.** Thin 1px borders, 8 to 14px rounded corners, no shadows, no gradients. Motion is limited to the diagram steps, a gentle pulse on hazards, and a 0.35s fade on overlays.
- Respect `prefers-reduced-motion`: the diagrams jump between steps instead of animating and autoplay is off.

## 2. Color tokens

Define every token on `:root` (dark). Redefine in `@media (prefers-color-scheme: light)` guarded with `:root:not([data-theme="dark"])`, and again in `:root[data-theme="light"]`.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0c1416` | `#f1f4ee` | page background (always set on `body`) |
| `--surface` | `#141f22` | `#ffffff` | cards, diagram stage, table header |
| `--surface2` | `#1a292d` | `#e4ebe5` | platforms, chips, subtle fills |
| `--line` | `#2a3b3f` | `#c9d6cd` | borders and dividers |
| `--fg` | `#e6ebe4` | `#14211f` | main text |
| `--muted` | `#9aaba6` | `#4f625e` | secondary text, labels |
| `--venom` | `#86cf74` | `#3b7f2c` | brand accent, venom pools |
| `--danger` | `#ee6a56` | `#c0392a` | hazards, tethers, "do not stand here" |
| `--odds` | `#f2ac40` | `#a85f00` | Odds group (amber) |
| `--evens` | `#62b6ea` | `#1a72ad` | Evens group (blue) |
| `--tank` | `#f4f4ef` | `#14211f` | tank marker |
| `--melee` | `#b99af2` | `#7a52d6` | melee role (violet) |
| `--healer` | `#5fd6a8` | `#13875d` | healers (mint) |
| `--ranged` | `#f291c2` | `#c0397f` | ranged (pink) |
| `--egg` | `#d8cca0` | `#8c7c47` | eggs |
| `--gate` | `#b58be8` | `#7a46b8` | gateway and tip boxes (purple) |
| `--venom-soft` | `rgba(134,207,116,.14)` | `rgba(59,127,44,.13)` | venom fill |
| `--danger-soft` | `rgba(238,106,86,.18)` | `rgba(192,57,42,.14)` | hazard fill |

Rules:
- **Group and role colors keep one meaning across every guide.** Odds is always amber, Evens always blue. Tank white, healer mint, melee violet, ranged pink. Do not reuse these colors for anything else.
- Tinted backgrounds are made with `color-mix(in srgb, var(--token) 16%, transparent)`.
- Red (`--danger`) only means "bad": hazards, tethers, wipe warnings.

## 3. Typography

Google Fonts only:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
```

| Role | Font | Style |
|---|---|---|
| Display (boss name, phase titles, step captions) | Big Shoulders Display | 800, uppercase. Boss name is `clamp(64px,16vw,148px)` with line-height .86. Phase titles `clamp(36px,6vw,60px)`. Step title 20px. |
| UI and body | Figtree | 16px / 1.55. Buttons 14px 600. |
| Labels and eyebrows | JetBrains Mono | 12px, 700, uppercase, letter-spacing .12 to .14em. Used for eyebrows, chips, legend headings, table headers, diagram labels. |

Fallback stacks: `'Arial Narrow',Impact,sans-serif` for display, `system-ui,...` for UI, `ui-monospace,Menlo,monospace` for mono.

Headings use `text-wrap:balance`. Body lines stay near 60ch (`max-width:52ch` to `60ch` on intro text).

## 4. Page structure of a boss guide

0. **Top bar.** The very first thing on the page, above the hero: the venom lockup on the left and a "Back to kotsw.com" pill on the right. See components.
1. **Hero.** Mono eyebrow ("The Venomous Abyss · Boss 8 · Heroic"), giant boss name, one or two sentence intro, and a "My group" picker (Both / Odds / Evens) on the right.
2. **Raid roster panel.** Counts (healers, melee, ranged, extras), name boxes by role, an Odds or Evens button per player, summary line. Names appear in the diagrams.
3. **Before the pull.** Short bullet list with a small green dash.
4. **Important box** (only when one mistake wipes the raid). See components.
5. **At a glance.** One card per phase, two sentences each.
6. **Sticky nav.** Pill links to each phase and to "By role".
7. **One section per phase.** Phase eyebrow, display title, one-line job. Diagram on the left, calls and mechanics on the right (stacks on mobile).
8. **By role table.** Rows are tanks, healers, melee, ranged. Columns are phases.
9. **Footer.** Sources list. Credit the Odds and Evens calls as ours. The footer ends with the venom crest, the copyright line and a "Back to top" link, like the home page. See components.

Max content width is 1080px. Side gutter is at least 16px using `max(16px, env(safe-area-inset-left))` on both sides.

## 5. Components

- **Chip** (`.chip`): 72px wide mono label that starts each call. Variants: `c-odds`, `c-evens`, `c-all`, `c-tank`, `c-heal`, `c-melee`, `c-range`. Tinted background, role-colored text.
- **Call list** (`.calls li`): chip on the left, one or two sentences on the right. Bold the single most important phrase. Rows for the other group dim to 36% opacity when someone picks their group.
- **Mechanics list** (`.mech`): ability name as a link to Wowhead (`https://www.wowhead.com/spell=ID`), with the 20px ability icon in front, then a muted one-line explanation.
- **Tip box** (`.tip`): purple left border (4px), mono "TIP" label. For handy extras, like the Warlock gateway. Stack tips with 12px between them.
- **Important box** (`.important`): red border with a 5px left edge, tinted red fill, mono red heading ("Important: Phase 3"). Use sparingly, only for wipe mechanics. Leave about 30px of space above and below.
- **Egg button** (`.ebtn`): 34px square outline button with an egg-shaped icon in each roster row (not for tanks). Tapping it marks that player as their group's Phase 2 big egg carrier. Selected state is filled with `--egg`. One per group.
- **Roster buttons** (`.rshare button`): Copy share link, Import link or code, and Reset roster. Reset puts back the default raid (5 healers, 6 melee, 7 ranged, 2 extra, Odds 11 and Evens 9) and clears names, groups and egg carriers. It asks twice: the first tap turns the button red and says "Tap again to confirm" for 4 seconds. Never use `confirm()`.
- **Diagram stage** (`.stage`): rounded surface card holding the SVG, then legend, then step caption (title in display font, text in muted body), then controls (Prev, Play or Pause, Next) and numbered step pips.
- **Top bar, back link and footer** (**required on every page except the home page**). These match the home page.
  - **Top bar** (`.topbar`): first thing on the page. The lockup on the left, linking to `/`, and the back link on the right, with a 1px `--line` line under the bar. Guides are venom-green pages, so use the `kotsw-lockup-venom-*` files, 44px tall (section 12 has the `<picture>` markup).
  - **Back link** (`.back`): a pill, mono 12px 700 uppercase with .12em spacing, `--surface` fill, 1px `--line` border. Text "Back to kotsw.com" with an `aria-hidden` "←". Hover and focus turn the text and border `--venom`. It links to the page's section on the home page (`/#wow` for WoW guides, `/#code`, `/#pinball`, `/#else` elsewhere). Give the page wrapper `id="top"`.
  - **Footer** (`.foot`): the credit line and sources first, then a row (`.frow`) with a line above it: the venom crest at 32px with "© 2026 Knights of the Silicon Wafer" on the left, and on the right the plain "Back to top ↑" link (`a.up`: mono 12px 700 uppercase, `--muted`, `--fg` on hover). This is the same footer as the home page, with the venom crest in place of the copper one. The link scrolls up smoothly, or jumps instantly when the visitor prefers reduced motion. `href="#top"` is the fallback without script.
  - In a Claude artifact copy the logo images cannot load, so leave out both logos and point the back link at the full `https://kotsw.com/#wow` address. In the source parts the logos are wrapped in `<!--LOGO-->` and `<!--/LOGO-->` so a build can strip them.
- **Table** (`.tbl`): bordered, scrolls sideways on phones, first column bold.

## 6. Diagram language

Diagrams are one SVG per phase (viewBox 640 x 400), drawn on a flat surface with no perspective. Everything moves between steps. Keep them simple.

- **Players:** circles with one letter (M melee, H healer, R ranged), colored by role. **Tanks are rounded squares**, white. A small group tag in the player's group color appears on a ring or outline when it matters. Names from the roster replace the letters when typed.
- **Group outline:** Odds amber, Evens blue.
- **Boss and big enemies:** large circle with a venom-green stroke and the name inside. Adds are small and red-stroked.
- **Platforms:** `--surface2` fill with a `--line` stroke. Edges of a platform sit in a venom pool (`--venom-soft`) so players can see the edge is deadly.
- **Hazards:** red dashed circles (`--danger-soft` fill) for falling debris and "do not stand here" zones. Half-circle zones for frontals.
- **Soaks:** group-colored filled circles with a thicker stroke.
- **Eggs:** egg-shaped ellipses in `--egg`. Carried eggs sit on the top-right of the carrier.
- **Tethers:** red solid line. Slack tethers are grey and dashed.
- **Arrows:** dashed grey lines for movement.
- **Labels:** mono 12 to 13px, uppercase, short ("WAVE FROM THE LEFT"). Labels must not overlap players or edges. Put the word "VENOM" in the corners outside a platform so it is clear what is lethal.
- **Layers:** overlays fade in and out per step (`data-on="3 4 5"` lists the steps they show on).
- Positions come from the roster, so group sizes can change without redrawing.
- One idea per step. Step titles are short verbs ("Melee runs right, ranged kills the rest").

Motion: 1 second ease between positions, 0.35s fade for overlays, 5 to 6 seconds hold per step. Autoplay only while the diagram is on screen. Pressing Play advances right away.

## 7. Writing rules

- **Plain words and short sentences.** Write for a raider mid-pull. No filler.
- Say who does what: "Melee jumps to the platform on the left", not "The platform on the left is jumped to".
- **Name the group and the side.** Odds soaks first, on the right. Evens second, on the left.
- Bold only the one thing someone must not miss.
- Spell the mechanics the way the game and Wowhead do. Link each named ability once in the mechanics list.
- Say when something is our call ("The Odds and Evens calls are ours") versus official game behavior.
- Flag guesses. If an exact position or count is illustrative, say so in the step text.
- No em dashes. Use periods or commas.
- Roles: "Tanks", "Healers", "Melee", "Ranged". "DPS" only when both melee and ranged are meant.

## 8. Ability icons

Icons come from Wowhead. The page cannot load images from other sites, so they are embedded:
- Each icon is 16 x 16 pixels stored as a 16-color palette (96 hex characters) followed by 256 hex digits, one per pixel.
- A small script draws them to `<canvas class="sico">` next to each `dt a[href*="wowhead.com/spell="]`.
- CSS: 20px, `image-rendering:pixelated`, 4px radius, 1px `--line` border, black background, 7px right margin.
- To add a new boss: look up each spell's icon name through Wowhead's tooltip data, fetch the image in a browser, quantize to 16 colors, and add it to the icon table keyed by spell ID.

## 9. Publishing rules (important)

A finished guide for kotsw.com is **one standalone `.html` file** with:

- `<!doctype html>`, `<html lang="en">`, `<meta charset="utf-8">`, and the viewport meta in the `<head>`. Without the charset tag, characters like the middle dot show up as "Â·".
- A `<title>` of two to four words ("Ula'tek Heroic Guide").
- `body{background:var(--bg);color:var(--fg)}` set explicitly.
- `[hidden]{display:none!important}` and `img{max-width:100%}`.
- All CSS and JS inline. Only Google Fonts is loaded from outside.
- Must work at about 400px wide with no sideways page scroll.
- The three favicon `<link>` tags from section 12 in the `<head>`.
- The top bar (venom lockup and back link) and the footer with "Back to top" (section 5, components).

Publish folder: guides go in `public/venomous_abyss_guides/` (the website root is `public/`).

File names: lowercase, hyphens, boss name first, difficulty second: `ulatek-heroic-guide.html`.

The roster is saved in the visitor's own browser. The "Copy share link" button puts the roster in the web address after `#r=`, and "Import link or code" reads it back.

## 10. Before shipping a guide

- Click every step number and compare with playing in order. The picture must be the same.
- Check light and dark.
- Check at phone width.
- Make sure no text overlaps in any step, and no player is drawn outside a platform.
- Make sure Play keeps going after clicking a step.
- Spell-check names and Wowhead links.

## 11. Main index.html

The home page shares the guides' structure rules (dark first, flat, thin borders, same fonts, same tokens approach) but has its own look so it does not read as a raid guide.

- **Palette:** slate and copper, taken from the logo. Dark: `--bg #0b1016`, `--surface #111922`, `--surface2 #1c2833`, `--line #26333f`, `--fg #e9eef2`, `--muted #93a2b0`. Light: `--bg #f5f7f8`, `--surface #fff`, `--line #cbd5dd`, `--fg #0e1319`, `--muted #4c5b69`. Light copper text is darkened to `#a65a26` so it stays readable.
- **Section accents:** World of Warcraft `--venom`, Programming `--copper`, Pinball `--blue`, Everything else `--violet`. A card's top border, number, chip and link arrow use its section accent. These colors do not carry the Odds, Evens, or role meanings from section 2.
- **Fonts:** same three Google fonts as the guides. The hero headline is the display font, one word per line.
- **Logo:** copper files from `public/brand/`. Lockup (48px, 40px on phones) in the header. Crest in the hero (hidden on phones, the header already has the logo) and small in the footer.
- **Structure:** header with section links, hero, Latest feed, one block per section with cards, footer.
- **Latest feed:** driven by the `POSTS` array at the bottom of `index.html`. One line per post.
- **Cards:** mono eyebrow, display title, one-line summary, chip, and an "Open" link. The whole card is clickable. A dashed card with a "Soon" chip holds the place of content that does not exist yet.
- **Adding content:** see "Home page" in `CLAUDE.md`.

## 12. Logo and favicon

The mark is a heater shield holding a silicon wafer (a circle with one flat edge, cut into square dies), with a sword down the middle. The lockup puts the shield on the left of two lines of text: "KNIGHTS OF THE" in small mono caps over "SILICON WAFER" in heavy condensed caps. The top of the shield lines up with the top of the K. The point of the shield sits on the baseline of SILICON WAFER. Keep that alignment if the lockup is ever rebuilt.

### Files

All of these are published.

| File | Folder | Use |
|---|---|---|
| `kotsw-lockup-dark.svg` and `.png` | `public/brand/` | Full logo, for dark backgrounds |
| `kotsw-lockup-light.svg` and `.png` | `public/brand/` | Full logo, for light backgrounds |
| `kotsw-crest-dark.svg` and `.png` | `public/brand/` | Shield only, for dark backgrounds |
| `kotsw-crest-light.svg` and `.png` | `public/brand/` | Shield only, for light backgrounds |
| `kotsw-lockup-venom-dark.svg` and `.png` | `public/brand/` | Full logo with the venom-green accent, for dark venom-green pages |
| `kotsw-lockup-venom-light.svg` and `.png` | `public/brand/` | Full logo with the venom-green accent, for light venom-green pages |
| `kotsw-crest-venom-dark.svg` and `.png` | `public/brand/` | Shield only with the venom-green accent, for dark venom-green pages |
| `kotsw-crest-venom-light.svg` and `.png` | `public/brand/` | Shield only with the venom-green accent, for light venom-green pages |
| `favicon.svg`, `favicon.ico` | `public/` | Browser tab icon (the die-grid K) |
| `apple-touch-icon.png` | `public/` | iPhone and iPad home screen icon (180px) |
| `icon-192.png`, `icon-512.png` | `public/` | Saved for a web app manifest. Not linked yet. |

"Dark" and "light" name the background the file is made for. The dark file has light lines and text. The light file has dark lines and text. Files without `venom` in the name have the copper accent. Files with `venom` in the name have the venom-green accent.

### Using the logo

- Use the SVG on web pages. Use the PNG only where SVG is not accepted (social previews, email, documents). Lockup PNGs are about 2100px wide. Crest PNGs are about 420px wide.
- The page theme picks the file. The site is dark first, so the dark file is the default and the light file shows for light systems:

```html
<a href="/">
  <picture>
    <source srcset="/brand/kotsw-lockup-light.svg" media="(prefers-color-scheme: light)">
    <img src="/brand/kotsw-lockup-dark.svg" alt="Knights of the Silicon Wafer" height="48">
  </picture>
</a>
```

  If a manual theme switch is added, swap the file with the same switch.
- Set the height, never stretch. The header lockup is about 48px tall.
- Minimum sizes: lockup 40px tall, crest 24px tall. Smaller than that, use the favicon K.
- Clear space: at least a quarter of the logo's height on every side.
- Do not recolor, outline, rotate, add shadows or gradients, or place it over busy images. This matches the flat look in section 1.
- The text in the logo is already converted to shapes. Do not load Barlow Condensed or IBM Plex Mono for it.

### Logo colors

These belong to the logo only. They are not page tokens.

| Part | On dark | On light |
|---|---|---|
| Ink (outline, sword blade, text) | `#E9EEF2` | `#0E1319` |
| Wafer fill | `#1C2833` | `#D9E0E6` |
| Shield fill | `#0E1319` | `#F5F7F8` |
| Copper (sword guard and pommel) | `#E09A63` | `#C2733A` |

Copper is for the logo only. Do not use it in the page UI. Page colors still come from the tokens in section 2.

### Logo accent on venom-green pages

Pages in the venom-green and teal-black look (the raid guides) swap the logo's copper for the page's venom green. Everything else in the logo stays the same. Pages that do not use venom green keep copper.

| Part | On dark | On light |
|---|---|---|
| Accent (sword guard and pommel), venom-green pages | `#86cf74` | `#3b7f2c` |

These are the `--venom` values from section 2. The shield fill on dark (`#0E1319`) is close enough to the page `--bg` (`#0c1416`) that it needs no change.

On these pages use the files with `venom` in the name:

```html
<a href="/">
  <picture>
    <source srcset="/brand/kotsw-lockup-venom-light.svg" media="(prefers-color-scheme: light)">
    <img src="/brand/kotsw-lockup-venom-dark.svg" alt="Knights of the Silicon Wafer" height="48">
  </picture>
</a>
```

The favicon stays copper everywhere, because it is one fixed file.

### Favicon

The K is built from 13 square dies in light ink plus one copper die at the joint. It sits on a rounded dark tile so it reads on both light and dark browser tabs. Every page needs these three tags in `<head>`. The paths start at the site root, so they work from any folder:

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

Browsers cache favicons hard. Check a change in a private window.

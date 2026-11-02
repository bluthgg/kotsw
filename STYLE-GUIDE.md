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

1. **Hero.** Mono eyebrow ("The Venomous Abyss · Boss 8 · Heroic"), giant boss name, one or two sentence intro, and a "My group" picker (Both / Odds / Evens) on the right.
2. **Raid roster panel.** Counts (healers, melee, ranged, extras), name boxes by role, an Odds or Evens button per player, summary line. Names appear in the diagrams.
3. **Before the pull.** Short bullet list with a small green dash.
4. **Important box** (only when one mistake wipes the raid). See components.
5. **At a glance.** One card per phase, two sentences each.
6. **Sticky nav.** Pill links to each phase and to "By role".
7. **One section per phase.** Phase eyebrow, display title, one-line job. Diagram on the left, calls and mechanics on the right (stacks on mobile).
8. **By role table.** Rows are tanks, healers, melee, ranged. Columns are phases.
9. **Footer.** Sources list. Credit the Odds and Evens calls as ours.

Max content width is 1080px. Side gutter is at least 16px using `max(16px, env(safe-area-inset-left))` on both sides.

## 5. Components

- **Chip** (`.chip`): 72px wide mono label that starts each call. Variants: `c-odds`, `c-evens`, `c-all`, `c-tank`, `c-heal`, `c-melee`, `c-range`. Tinted background, role-colored text.
- **Call list** (`.calls li`): chip on the left, one or two sentences on the right. Bold the single most important phrase. Rows for the other group dim to 36% opacity when someone picks their group.
- **Mechanics list** (`.mech`): ability name as a link to Wowhead (`https://www.wowhead.com/spell=ID`), with the 20px ability icon in front, then a muted one-line explanation.
- **Tip box** (`.tip`): purple left border (4px), mono "TIP" label. For handy extras, like the Warlock gateway. Stack tips with 12px between them.
- **Important box** (`.important`): red border with a 5px left edge, tinted red fill, mono red heading ("Important: Phase 3"). Use sparingly, only for wipe mechanics. Leave about 30px of space above and below.
- **Egg button** (`.ebtn`): 34px square outline button with an egg-shaped icon in each roster row (not for tanks). Tapping it marks that player as their group's Phase 2 big egg carrier. Selected state is filled with `--egg`. One per group.
- **Diagram stage** (`.stage`): rounded surface card holding the SVG, then legend, then step caption (title in display font, text in muted body), then controls (Prev, Play or Pause, Next) and numbered step pips.
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

## 11. Main index.html (starting point)

The home page should use the same look, but simpler:
- Same tokens, fonts, and dark-first theme.
- Hero: site name in the display font, short intro.
- A list or grid of guide cards. Each card: mono eyebrow (raid and boss number), display title, one-line summary, difficulty chip, "Open guide" link.
- Group by raid (for example "The Venomous Abyss"). Add new bosses as new cards.
- Keep the footer and sources pattern.

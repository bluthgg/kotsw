# Ula'tek guide: source and engine (reference copy)

Everything needed to rebuild `ulatek-heroic-guide.html`, and to start the next boss from the same engine.

## Rebuild

```
python build.py
```

Writes `ulatek-heroic-guide.html` next to `build.py`. The output is byte-for-byte the published guide.

## What is in `parts/`

| File | What it is |
|---|---|
| `p1-head.html` | `<title>`, font link, main CSS. All color tokens and the SVG part classes live here. |
| `p2-css.html` | Second style block: roster panel, tips, important box, ability icon style, share box. |
| `p3-top.html` | Hero, roster panel, "Before the pull", "At a glance", phase nav. |
| `p4a-phase1.html` | Phase 1 section: SVG overlays, call list, mechanics list. |
| `p4b-phase2.html` | Phase 2 section. |
| `p5-int-p3.html` | Intermission section, Phase 3 section, By role table, footer sources. |
| `j1-core.js` | Scene engine: entity tweening, overlays, step pips, autoplay, roster helpers (`roster()`, `members()`, `cluster()`, `spread()`). |
| `j2-scenes.js` | Per-phase step data: `cfgP1`, `cfgP2`, `cfgInt`, `cfgP3`. This is the part you rewrite for a new boss. |
| `j3-ui.js` | Roster UI, saving to the browser, group picker, share link and import, scene start. |
| `j4-icons.js` | Ability icons (16 x 16, 16-color) keyed by Wowhead spell ID. |

## How a scene works

- Each phase has `<figure class="scene" data-scene="p1">` holding one SVG (viewBox 640 x 400).
- SVG groups with `class="ov" data-on="3 4 5"` fade in on those step numbers (0-based).
- `j2-scenes.js` returns `{ents, steps}` per scene. Each step has `t` (title), `p` (caption), `pos` (where each player or enemy goes), optional `lines` (tethers), `flag` (rings on players) and `who` (role lines).
- `pos` values accumulate from step 0, so a step only lists what moves. `null` hides an entity. `'at:ID'` attaches an egg to a carrier.
- Positions are computed from the roster, so group sizes can change.

## Starting a new boss

1. Copy this folder. Change the title, hero text, and the phase sections in `p3` to `p5`.
2. Draw the SVG overlays for each phase.
3. Rewrite the step data in `j2-scenes.js`.
4. Replace the ability icons in `j4-icons.js` (see STYLE-GUIDE.md section 8).
5. Run `python build.py`, then the tests.

## Tests (`tests/`)

Headless Chrome with puppeteer-core (`npm i puppeteer-core`, and set the Chrome path inside each script). Each script takes the guide's path, and optional step numbers for screenshots.

- `s.js` ... `s5.js`: step through a phase, save screenshots, and compare playing in order with jumping to a step. The line `mismatches 0` means the pictures match.
- `pl.js`: clicking a step then Play keeps playing.
- `sh.js`: share link and import round trip.
- `ic.js`: ability icons are drawn.
- `st.js`: standalone page loads as UTF-8 with a background.

Test scripts were run from a scratch folder, so adjust the Chrome path (`/usr/bin/google-chrome`) for Windows.

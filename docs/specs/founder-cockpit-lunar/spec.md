# Founder Cockpit landing: Lunar skin + game shell (only these two)

Template: spec-handoff. Hark, 2026-11-09 21:40 MST. Supersedes the earlier five-layer redesign in this file (#321, rejected by Sasha: "We already had a great page. Only 1) apply Lunar 2) add the game shell"). Source commit: main after a2d934d (landing polished in 9fdcfa6).

## 1. Task
Keep `/build/cockpit` (CockpitLanding) exactly as it is in content, structure, layout, images and copy. Change only (1) its colours to the Lunar "Moonlight" skin and (2) render it inside the persistent GameShellV2.

## 2. Job it serves
Founder Cockpit landing lives inside the game, in the game's Lunar look.

## 3. Context
- `src/pages/CockpitLanding.tsx`, `src/pages/CockpitLanding.css` (self-contained, vars `--fc-bg/--fc-ink/--fc-mute/--fc-dim/--fc-line` + a few raw rgba/hex).
- `src/index.css` `[data-skin="lunar"]` block (~line 2606): night #090d13 → #0e141c → #121b26, silver ink #e6ebf2, line rgb(200,210,222), moonlight accent #d9d1b4, bright #e9e4cf, deep #cfc29a, glow rgb(236,230,208), CTA = dark glass + moonlight outline + glow (`--skin-cta-*`).
- `src/lib/shellRoutes.ts` (line ~105 comment excludes `/build/cockpit` from the shell), `src/components/game/GameShellV2.tsx` (line ~739 already maps the path to section "build").

## 4. Scope
**In:** remap the `--fc-*` variables and the raw colour values in CockpitLanding.css to Lunar values (prefer `var(--moonlight-*)` / skin vars with the hex as fallback); accent touches only where the page already has an accent (buttons, links, focus, rules): moonlight outline + soft glow. Add `/build/cockpit` to the in-shell list in shellRoutes.ts. Inside the shell: drop `min-height:100vh`/full-bleed so it sits in pane 3; hide or keep the local `.fc-nav` only if it collides with the shell header (prefer keep; remove the 78px language-pill padding only if the shell already handles it).
**Out (do not touch):** any text/copy, section order, layout grid, sizes, spacing, fonts, image files, `<img>` elements. **No filters, tints, overlays or blend modes on the screenshots** (`.fc-shot img` stays as is). No changes to `src/index.css`, theme-tokens.css, other pages, the dashboard, intro/start screen, reveal, auth, supabase, migrations, deps.

## 5. Definition of Done
| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | Diff touches only CockpitLanding.css, shellRoutes.ts (and CockpitLanding.tsx only if needed for the shell fit) | `git diff --stat` | ⬜ |
| 2 | No copy, order or layout change | diff shows only colour values / shell-fit rules | ⬜ |
| 3 | Screenshots untouched: no filter/overlay on `.fc-shot` | diff | ⬜ |
| 4 | Colours are Lunar (night bg, silver ink, moonlight accent on CTA/links) | before/after screenshot 1440px | ⬜ |
| 5 | Page renders inside GameShellV2 with the rail, on `/build/cockpit` | screenshot | ⬜ |
| 6 | No double header / overlap with shell or language pill | screenshot | ⬜ |
| 7 | Mobile 390px OK, no horizontal scroll | screenshot | ⬜ |
| 8 | Text contrast ≥ 4.5:1 for body and small text | values listed | ⬜ |
| 9 | lint, `tsc --noEmit`, build pass | output | ⬜ |

## 6. Verification
`npm run lint && npx tsc --noEmit && npm run build`; screenshots from `npm run preview`.

## 7. Merge
Hark merges when green (Sasha asked for exactly this change, 2026-11-09 21:33 MST). If anything beyond §4 In seems necessary, stop and ask on the issue.
Exit line: "Done — Cockpit landing in Lunar, inside the game shell."

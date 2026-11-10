# Founder Cockpit in the game shell, Lunar skin, five layers

Template: spec-handoff (docs/templates/spec-handoff.md). Written by Hark, 2026-11-09, on Sasha's request. Source commit: a2d934d8338c97388f149f4a4186d8f90bb2e803.

## 1. Task
Rebuild `/build/cockpit/dashboard` as a native game-shell screen in the Lunar skin, organised by five layers (Identity, Flow, Delivery, Return, Operations), with the duplicate panels removed and an empty-state Delivery layer added.

## 2. Job it serves
Founder Cockpit = the interface of the Business Automation OS ("the source of project self-awareness"). The concept architecture (2026-11-08) names one loop, Identity → Flow → Delivery → Return → Operations, read from one source (private ledger + canvas; Pulse writes, panels read).

## 3. Roadmap status
Net-new wave on an existing route.

## 4. Product chain
- **Master Result:** the founder sees the whole business as one living system and knows the one next move.
- **Sub-results:** (1) I see what came back (cash, strictly received, apart from invoiced) · (2) I see where people stop on one ladder · (3) I see who I am serving now · (4) I see what waits on me · (5) I can open my Unique Business.
- **Before-screen:** the shell rail item "Enter the Cockpit" (existing). **After-screen:** the dashboard itself; each layer card states its question and its answer.

## 5. Decisions (Hark, technical, locked)
- D1. **Dedupe first, Delivery as a slot in the same wave.** One structure: a summary strip + five layer cards. The Delivery card ships with an honest empty state; wiring real engagements comes later from the ledger. Reason: the duplicates are what makes the page read as four products; a new layer on top of duplicates adds a fifth.
- D2. **Skin tokens only.** Replace the hardcoded Aurum palette (`#d6a84d`, `#fff7e8`, `#07090d`, `#0d1117`, `#cfc4b5`, `#f6efe3` …) with the semantic tokens in `src/styles/theme-tokens.css` (`--surface-*`, `--text-*`, `--accent-*`, `--cta-*`) and, where the Lunar look needs it, `--moonlight-*` from `src/index.css`. Under `[data-skin="lunar"]` it must look like `mockup.html`; other skins follow their own tokens. **No edits to skin/theme definitions** (index.css skin blocks, theme-tokens.css values): this PR only consumes tokens.
- D3. **The page lives in pane 3 of the persistent GameShellV2** (route is already in `src/lib/shellRoutes.ts`). Remove the page's own full-bleed `min-h-screen` background so the shell's sky shows; content max-width fits pane 3.
- D4. **No invented numbers.** Every figure comes from existing data (`src/generated/crm-snapshot.ts`, `project-pulse-snapshot.json`, `useRuntimeOffers`). Missing value → "—" plus a small "not yet wired" note. Show the data's as-of date. Cash card = `cashReceivedUsd` labelled "Cash received (strict)"; an invoiced/unconfirmed amount only if the data has a field for it, otherwise omit that card.
- D5. **No person names in source.** Hardcoded names in `CockpitDashboard.tsx` copy (relationship lines in the founder brief) are replaced with role words ("warm individual calls", "community pilot partners"). Names may only render from gated data.
- D6. Self-Organize has one entry point (Operations). Past-due queue items are shown as a count with an "Archive past-due" action only if the data exposes due dates; otherwise skip the action.

## 6. Context (read first)
- `docs/specs/founder-cockpit-lunar/mockup.html`: the target look and structure (sample values).
- `src/pages/CockpitDashboard.tsx`: current page (1,142 lines); reuse its data hooks and founder gating, do not respec them.
- `src/components/game/GameShellV2.tsx`, `src/lib/shellRoutes.ts`, `src/components/game/SectionsPanel.tsx` (rail items `founder-cockpit*`).
- `src/index.css` Lunar block (`[data-skin="lunar"]`, ~line 2606) and `src/styles/theme-tokens.css`.

## 7. Scope
**In:** CockpitDashboard layout, styling via tokens, layer cards, layer filter pills (client-side filter, no new route), copy de-naming, empty states.
**Out:** `/build/cockpit` landing (`CockpitLanding.tsx`), `/build/cockpit/offers`, skin/theme definitions, start screen/intro, talent reveal, player entry/auth, Supabase functions, migrations, `supabase/functions/mcp/index.ts`, generated data files, Lovable, new dependencies, the Home panel.

## 8. Definition of Done
| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | Page renders inside GameShellV2 pane 3, no own full-bleed background | screenshot desktop 1440 | ⬜ |
| 2 | Summary strip: cash received (strict), offers paid "X of Y", waiting-on-you count; values from data | file:line of each binding | ⬜ |
| 3 | Five layer cards in order Identity, Flow, Delivery, Return, Operations, each with its question line | screenshot | ⬜ |
| 4 | Layer pills filter cards; "All layers" default | short screen recording or 2 screenshots | ⬜ |
| 5 | Flow = one ladder Accepted → Messaged → Replied → Call → Offers → Paid; "—" for unwired | screenshot + file:line | ⬜ |
| 6 | Return: stepped received line + dashed projection only if projection data exists, else fact only | screenshot | ⬜ |
| 7 | Delivery card with empty state "No active engagements recorded yet" when no data | screenshot | ⬜ |
| 8 | Duplicate mini Offers/Funnel and second Self-Organize removed | diff | ⬜ |
| 9 | Zero hardcoded hex colours left in CockpitDashboard.tsx | `grep -nE "#[0-9a-fA-F]{3,6}" src/pages/CockpitDashboard.tsx` → empty | ⬜ |
| 10 | Lunar skin matches mockup (moonlight accent, opal card edge, night background) | side-by-side screenshot | ⬜ |
| 11 | Another skin (Aurum) still readable | screenshot | ⬜ |
| 12 | No person names in source copy | grep output for the names listed in D5 → empty | ⬜ |
| 13 | Non-founder signed-in user sees no founder data (gating unchanged) | screenshot or code path file:line | ⬜ |
| 14 | Mobile 390px: cards stack, no horizontal scroll | screenshot | ⬜ |
| 15 | No files touched outside §7 In | `git diff --stat` | ⬜ |
| 16 | lint, typecheck, build pass | command output | ⬜ |

## 9. Files
Change: `src/pages/CockpitDashboard.tsx`. Optional new: `src/components/cockpit/*` (layer card, ladder) if it keeps the page under ~600 lines.

## 10. Constraints
Smallest diff that meets the DoD; no new deps; no skin/theme edits; English UI with explicit labels; no force push. Avoid: gold/Aurum hardcodes, gradients on text, emoji, more than one glowing element per card.

## 11. Verification
`npm run lint && npx tsc --noEmit && npm run build`; screenshots from `npm run preview` with `data-skin="lunar"`.

## 12. Merge
Hark reviews against §8 and merges when green. This PR does not touch the reveal, intro, themes or player entry; if the worker finds it must, stop and ask on the issue.

Exit line: "Done — Founder Cockpit in the shell, Lunar, five layers. [1–2 lines]".

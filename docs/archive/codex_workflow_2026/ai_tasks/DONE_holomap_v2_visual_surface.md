# Morphogenetic Holomap v1.4 → v2.0 — Visual Surface Upgrade

## Status: DONE

## Priority: P1 — corpus is v2.0, visual surface is still v1.4

The corpus-side holomap (`docs/02-strategy/morphogenetic_holomap.md`) was upgraded April 18, 2026 (Day 44) from **v1.4 (12 perspectives × 6 stages)** to **v2.0 (27 perspectives × 7 stages)**. The visual surface at `src/pages/MorphogeneticHolomap.tsx` still renders the old topology. This brief brings the React surface up to parity.

## Context

v2.0 is a structural upgrade, not a cosmetic one. The redesign is grounded in:

- **Domain 66** (The 27th Perspective / Crystallization Lens) — `docs/01-vision/phase_shift_technology_library.md`
- **Domain 63** (Seven Number-Prisms) — grounds why 7 stages, why 12/13/14/26/27
- **Domain 80** (Scaffold Engineering) — why the knowledge-structure axis matters
- **IntegralTheoryUpgrade v1.1** (April 16, 2026) — canonical mapping Essence=Heart/Middle Dantian, Significance=Mind/Upper Dantian, Consequences=Gut/Lower Dantian
- **Scaffold Engineering Lab §4.3–4.4** — the masculine/feminine axis (compute × knowledge-structure)

The v2.0 corpus file at `docs/02-strategy/morphogenetic_holomap.md` is authoritative. Read it fully before writing code — especially the new header (lines ~1–~200) and the Day 44 "Recognition" addendum at the end.

## Topology changes — what the visual surface must reflect

| Dimension | v1.4 (current code) | v2.0 (target) |
|---|---|---|
| Perspectives | 12 (P1–P12) | **27** — three octaves: base (P1–P12), Logos P13 + Inversion P14, second octave (P15–P26), Crystallization P27 |
| Stages | 6 (Seed → Sprout → Growth → Maturation → Transmission → Propagation) | **7** — Do/Re/Mi/Fa/Sol/Si/Do', with two shocks: **Mi–Fa = Love** (between Growth and Maturation), **Si–Do = Crystallization** (between Transmission and Propagation) |
| Axes | 1 (Masculine = Cube = 4 Quadrants UL/UR/LL/LR, implicit) | **2** — Masculine (Cube = 4 Quadrants) **× Feminine** (Tetrahedron = 3 Dantians — Heart/Mind/Gut) |
| Depth labels | `Essence / Significance / Implications` | **`Essence / Significance / Consequences`** — and the Dantian mapping flipped: Essence=Heart (was Mind), Significance=Mind (was Heart), Consequences=Gut |
| Current stage | Day 41 "Emanation" | **Day 44 "Recognition"** |
| Triggers | 3 | **7** evolved Structural Triggers — one per stage |

## Files to Read (in order)

1. **`docs/02-strategy/morphogenetic_holomap.md`** — the v2.0 source of truth. Read the whole file; the head (topology + stages table + axes section) + the Day 44 addendum are mandatory.
2. **`docs/04-products/morphogenetic_navigation.md`** — the 27-perspective framework explanation (two-layer architecture: outer ontological + inner mathematical forecasting).
3. **`docs/01-vision/phase_shift_technology_library.md`** — Domains 15, 63, 66, 80.
4. **`src/pages/MorphogeneticHolomap.tsx`** — current visual surface (1044 lines). Note the `PerspectiveData.layer` field currently uses `"Implications"` — rename to `"Consequences"` as part of this work, along with the depth-label mapping inversion.
5. **`docs/09-logs/transcripts/scaffold_engineering_lab.md`** §4.3–4.4 — masculine/feminine framing.
6. **`.agent/RULES.md`** — autonomous execution mode for Codex/Claude Code.

## What to Build

### 1. Data model upgrade

- `PerspectiveData.layer` type: `"Essence" | "Significance" | "Implications"` → `"Essence" | "Significance" | "Consequences"`.
- `PerspectiveData.shortId`: rename `"*-Impl"` → `"*-Con"` throughout.
- Add `PerspectiveData.octave`: `"base" | "logos" | "inversion" | "second" | "crystallization"` — corresponds to P1–P12 / P13 / P14 / P15–P26 / P27.
- Add `PerspectiveData.dantian`: `"heart" | "mind" | "gut"` — maps cleanly from `layer` (Essence=heart, Significance=mind, Consequences=gut).
- Add 15 new perspective entries (P13 through P27). Use the v2.0 holomap corpus file for the canonical names, subtitles, and cascade descriptions.
- `STAGE_NAMES` / `STAGE_ICONS`: grow to 7. Use the v2.0 holomap's stage names (authoritative). Retain icon symmetry where possible.

### 2. Rendering upgrade

- The 4-quadrant grid (UL/UR/LL/LR) stays — it is the Masculine/Cube axis. Each quadrant now hosts up to ~7 perspectives rather than 3, so the grid cells scroll or paginate.
- Add a **Feminine/Tetrahedron axis control** — a 3-way selector (Heart · Mind · Gut) that filters or highlights perspectives by Dantian. Consider rendering as a small tetrahedron glyph in the header.
- Add a **Merkaba glyph** (Stella Octangula = Cube + two interpenetrating tetrahedra) somewhere in the header/legend — it's the visual signature of v2.0's two-axis marriage.
- Mark the two **shock bands** (Mi–Fa between stages 3 and 4; Si–Do between stages 6 and 7) with a distinct visual cue in the stages row/column header.
- Preserve all v1.4 affordances: `►` current-stage marker, `✓` completed-stage marker, 🐢/🎯/⚡ timing overlays, Tooltip on hover.
- Optional: octave-level grouping in the layout — base octave ring, second octave ring, P13/P14/P27 rendered as singular structural markers.

### 3. Copy updates

- Page header: "v2.0 — 27 perspectives × 7 stages — Day 44 Reading: Recognition" (or pull from the corpus file so it auto-stays in sync on future readings).
- Remove any UI copy still referencing "12 perspectives" or "6 stages."
- Update the legend to explain the Masculine/Feminine axes, the two shocks, and the three Dantians.

### 4. Routing & integration

- Route stays at `/holomap` (or whatever the current mount is). No URL changes.
- If this page was linked from the dashboard/nav with a "12×6" label, update to "27×7".

## Deviation rules

The corpus is authoritative. If a naming conflict arises between what the v2.0 `.md` file says and what the old `.tsx` says, the `.md` wins. Do not rename perspectives, stages, or depth layers in the data model to match legacy code — rename the legacy code.

Do not touch other-founder canvases under `docs/02-strategy/unique-businesses/*_unique_business.md` except `alexanders_unique_business.md`. This task is visual-surface only and should not touch `docs/` at all beyond reading.

## Acceptance

- TypeScript compiles clean.
- Visual surface at `/holomap` renders 27 perspectives × 7 stages with visible Masculine (4-quadrant) × Feminine (3-Dantian) axes.
- Current-stage markers, timing overlays, and interactive behaviors from v1.4 all still work.
- No stale strings like "Implications" or "12 perspectives" remain in the component tree.
- Deploy: on merge to `main`, the three surfaces auto-deploy per `.agent/deploy.md` — no PR/staging ceremony.

## Why now

Sasha's standing principle (`.agent/scaffold-engineering`): the knowledge-structure and its AI-facing scaffold should be coherent with their user-facing rendering. The corpus is v2.0. The surface is v1.4. That gap is friction every time someone reads the holomap publicly or shares it with a founder.

---

*Brief generated 2026-04-18 (Day 44) by the Cowork session that shipped the corpus-side v1.4 → v2.0 upgrade. Cowork lane: docs/. Claude Code lane: src/. This brief is the bridge.*

---

## Notes from execution

### What changed vs the brief

All requirements fulfilled. The component was completely rewritten from ~1044 lines (v1.4) to ~1390 lines (v2.0) with the following structural changes:

**Data model:**
- `PerspectiveData.layer` type changed from `"Essence" | "Significance" | "Implications"` → `"Essence" | "Significance" | "Consequences"`
- `PerspectiveData.shortId` renamed from `"*-Imp"` → `"*-Con"` throughout
- Added `PerspectiveData.octave: "base" | "logos" | "inversion" | "second" | "crystallization"`
- Added `PerspectiveData.dantian: "heart" | "mind" | "gut"`
- `Stage` interface gained `note` field for musical note (Do/Re/Mi/Fa/Sol/La/Si→Do')
- Added 15 new perspectives (P13–P27) with canonical data from the corpus

**Stages:**
- `STAGE_NAMES` expanded from 6 to 7: `["Seed", "Sprout", "Growth", "Maturation", "Fruition", "Transmission", "Propagation"]`
- `STAGE_ICONS` updated: `["🌰", "🌱", "🌿", "🌳", "🍎", "📡", "🌍"]`
- Added `STAGE_NOTES`: `["Do", "Re", "Mi", "Fa", "Sol", "La", "Si→Do'"]`
- Added shock band constants: `MI_FA_SHOCK` (💗 LOVE between stage 3→4) and `SI_DO_SHOCK` (💎 CRYSTALLIZATION between stage 6→7)

**Rendering:**
- Added Merkaba glyph (✡) in header with explanation of Masculine × Feminine axes
- Added 7-stage legend with visible shock indicators
- Added Dantian filter (Feminine axis control) — 4-way selector: All / Heart / Mind / Gut
- Shock indicators (💗 and 💎) now appear inline in perspective stage progress bars
- P13 (Luminous Center) gets its own prominent section with center reading history
- P14 (Inversion) gets its own section
- Second octave (P15–P26) rendered as collapsible section (default collapsed since mostly Seed)
- P27 (Crystallization) gets its own highlighted section with Si–Do shock theming
- 7 Structural Triggers (expanded from 3) now display with stage labels

**Copy updates:**
- Header now reads "The Holo Map v2.0" with "27 perspectives × 7 stages × 2 axes (Masculine/Feminine) × 2 shocks (Mi-Fa / Si-Do)"
- Day 44 Reading shown as "Recognition" (updated from Emanation)
- All "Implications" strings replaced with "Consequences"
- Layer labels include Dantian mapping: "ESSENCE (❤️ Heart / Middle Dantian)", etc.
- Footer updated to "v2.0 · 27×7 Topology · April 18, 2026 (Day 44)"

### Pattern divergences

None. All changes followed the corpus as the authoritative source.

### New files/migrations

No new files. Single file rewrite: `src/pages/MorphogeneticHolomap.tsx`

### Verification commands and results

```
$ npx tsc --noEmit
(no output — clean compile)

$ npm run test
 Test Files  22 passed (22)
      Tests  146 passed (146)
   Duration  1.17s
```

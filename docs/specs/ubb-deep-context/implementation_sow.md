# UBB Deep Context — Implementation SoW + DoD

*Day 78, 2026-05-21. Status: blocked on Planning SoW DoD closure.*

## TLDR

Phased shipping of the deep-context refactor. Each phase ships independently and lifts a different artifact subset. Phase 0 is a free lift (data already loaded, just forward it). Phase 2 is the heaviest lift but unlocks the distribution artifacts that today operate blind.

## Prerequisites

Planning SoW DoD items 1-8 closed (architecture, relevance matrix, degradation policy, phasing, staleness absorption, token budget, input-version hash, decisions-are-actionable).

## Phase 0 — Wire up Deep ZoG passthrough

*~1 hour. Free lift. Data is already loaded into UBB context; just forward it.*

### Scope

- Forward `zog_snapshot.appleseed_data` JSON to edge functions inside `root_context`.
- Add a `deepZogSummary` helper that flattens Vibrational Key + threeLenses + appreciated_for + masteryAction into readable lines.
- Insert into `rootSummary` block in both generate-artifact and improve-artifact.

### Files

- `src/modules/unique-business-builder/UniqueBusinessContext.tsx` (rootContext memo: already loads appleseed_data; forward it as `zog_snapshot.appleseed_data`).
- `supabase/functions/_shared/ubb-prompts.ts` (add `deepZogSummary(appleseed: AppleseedData): string`).
- `supabase/functions/generate-artifact/index.ts` (rootSummary build, around line 95).
- `supabase/functions/improve-artifact/index.ts` (rootSummary build, around line 123).

### DoD

| # | Done state | Evidence | Status |
|---|---|---|---|
| 1 | rootSummary block in both edge functions includes flattened appleseed lines when present | code diff + edge-function log on one test call | pending |
| 2 | Smoke test: regenerate `uniqueness` and `myth` v1 from scratch on a profile with full appleseed; compare specificity vs pre-Phase-0 v1 | manual side-by-side; ≥ +0.5 specificity lift expected | pending |
| 3 | Type-check clean (`npx tsc --noEmit --skipLibCheck` on the two edge fn files plus the context file) | pass | pending |
| 4 | Graceful when appleseed is null (older profiles): rootSummary falls back to headline ZoG only, no crash | manual test on a synthetic null-appleseed profile | pending |

## Phase 1 — Mission integration

*~2 hours. Adds one new data load.*

### Scope

- UBB context loads `mission_statement` + `mission_discovered_at` from `game_profiles` on mount.
- Forwards in `root_context.mission`.
- Edge functions add a `missionSummary` block to rootSummary for relevant artifacts.
- Apply per the relevance matrix (12 artifacts read Mission).

### Files

- `src/modules/unique-business-builder/UniqueBusinessContext.tsx` (new state + load + forward).
- `supabase/functions/_shared/ubb-prompts.ts` (`missionSummary` helper).
- both edge functions (rootSummary block).

### DoD

| # | Done state | Evidence | Status |
|---|---|---|---|
| 1 | UBB context loads `mission_statement` on mount; non-null observable in dev console | log fires | pending |
| 2 | `root_context.mission` reaches the edge function | edge fn log | pending |
| 3 | rootSummary includes a Mission line when present; falls back to "no mission saved yet" pointer when null | log | pending |
| 4 | Smoke test: regenerate `myth`, `tribe`, `promise` on a profile with a sharp mission; verify model output reasoning trace cites or aligns with the mission | manual eyeball | pending |
| 5 | Type-check clean | tsc | pending |

## Phase 2 — Assets integration

*~4 hours. Heaviest lift. Unlocks distribution artifacts.*

### Scope

- UBB context loads `user_assets` table on mount.
- Forwards as `root_context.assets: SavedAsset[]`.
- Edge functions add an `assetsSummary` helper that filters by asset type and applies per the relevance matrix (14 artifacts).
- Asset filtering granularity: audience-only for reach, payment-only for frictionless_purchase, etc. Encoded in Phase 3's inputsNeeded.

### Files

- `src/modules/unique-business-builder/UniqueBusinessContext.tsx` (load + forward).
- `supabase/functions/_shared/ubb-prompts.ts` (`assetsSummary(assets, filter)` helper).
- both edge functions (rootSummary build, asset filtering).

### DoD

| # | Done state | Evidence | Status |
|---|---|---|---|
| 1 | UBB context loads `user_assets` on mount; non-empty array observable when present | log fires | pending |
| 2 | `root_context.assets` reaches the edge function | edge fn log | pending |
| 3 | rootSummary includes filtered asset slice per artifact (verified for reach, frictionless_purchase, surface_inventory) | log | pending |
| 4 | Smoke test: regenerate `reach`, `frictionless_purchase`, `surface_inventory` on a profile with real assets; verify model output references actual asset titles | manual eyeball | pending |
| 5 | Graceful when assets array is empty: rootSummary notes "no assets saved yet" | manual test | pending |
| 6 | Type-check clean | tsc | pending |

## Phase 3 — Per-artifact `inputsNeeded` map

*~2 hours. Signal:noise discipline.*

### Scope

- Add `inputsNeeded: string[]` to each entry in `ARTIFACT_CONFIGS` (per relevance matrix v1).
- Edge functions read `config.inputsNeeded`, filter `root_context` accordingly before summarizing.
- Removes "shove everything in" behavior. The `uniqueness` prompt should NOT see the asset inventory.

### Files

- `supabase/functions/_shared/ubb-prompts.ts` (add `inputsNeeded` per artifact).
- both edge functions (use `config.inputsNeeded` to filter).

### DoD

| # | Done state | Evidence | Status |
|---|---|---|---|
| 1 | All 19 artifacts have `inputsNeeded` array matching relevance matrix v1 | grep + spot check | pending |
| 2 | Edge function respects `inputsNeeded`: `uniqueness` prompt does NOT include asset inventory; `reach` prompt does | side-by-side log inspection | pending |
| 3 | Smoke test: regenerate `uniqueness` and `reach` on the same profile; verify per-artifact context differs as expected | manual eyeball | pending |
| 4 | Per-call cost in production for Phase 3 builds stays under $0.005 average | telemetry | pending |

## Phase 4 — Input-staleness axis

*~3 hours. Depends on the hybrid-staleness chip absorbing this.*

### Scope

- New DB column: `user_business_artifacts.input_version_at_lock TEXT NULL` (hash of the FounderContext used at lock time).
- generate-artifact and improve-artifact compute the hash and write it on insert.
- UniqueBusinessContext computes input-staleness alongside sibling + prompt staleness.
- Banner copy differentiates: "Your mission/assets changed since you locked these. Re-Improve to incorporate."

### Files

- `supabase/migrations/<timestamp>_input_version_at_lock.sql` (new column).
- both edge functions (compute and write).
- `src/modules/unique-business-builder/UniqueBusinessContext.tsx` (staleness compute).
- `src/modules/unique-business-builder/screens/CanvasOverviewScreen.tsx` (banner copy variants).

### DoD

| # | Done state | Evidence | Status |
|---|---|---|---|
| 1 | Migration applied to production | supabase confirms | pending |
| 2 | New locks write `input_version_at_lock` | DB row inspection | pending |
| 3 | Banner distinguishes input-staleness from sibling-staleness and prompt-staleness | UI screenshot, three banner variants visible | pending |
| 4 | Legacy rows with NULL `input_version_at_lock` treated as "unknown version", do NOT cause false-positive input-stale flags | sniff test on a pre-migration locked artifact | pending |

## Overall Implementation SoW DoD

| # | Done state | Evidence | Status |
|---|---|---|---|
| 1 | Phases 0-4 all merged to main | git log | pending |
| 2 | Per-phase smoke tests pass | each phase's DoD closed | pending |
| 3 | New session log entry written documenting the implementation across the days it took | docs/09-logs/session_log.md | pending |
| 4 | Average per-call cost stays under $0.005 | telemetry rollup | pending |
| 5 | Sasha runs his own /ubb end-to-end on the new pipeline and confirms the lift is real | qualitative sign-off | pending |

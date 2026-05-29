# UBB Deep Context — Planning SoW + DoD

*Day 78, 2026-05-21. Author: Sasha + AI lane. Status: decisions resolved per leans (2026-05-21, Sasha sign-off).*

## TLDR

`/ubb` artifact prompts today see only ~4 ZoG headline fields (top_three_talents, archetype_title, core_pattern, plus optional excalibur_data). The rich `appleseed_data` JSON is already loaded into the UBB context and dropped on the floor before the edge-function call. Mission and assets are not loaded at all. This planning SoW captures every design decision that must land BEFORE any code change ships. Output of this SoW is decisions, not files.

## What this SoW covers

Strategic and architectural decisions. Not code. Closing the DoD below unblocks the Implementation SoW.

## Decisions made (resolved 2026-05-21 per Sasha sign-off)

| # | Decision | Resolution | Status |
|---|---|---|---|
| 1 | Architecture: per-artifact filtering location | **A** — Pass full FounderContext from client, edge function filters per artifact_key. Simpler client; edge owns the prompt logic that already owns the filtering. | decided |
| 2 | Per-artifact relevance map | **Appendix A approved as v1 baseline.** Subject to revision after Phase 2 user-felt validation feedback. | decided |
| 3 | Graceful degradation policy | **b — generate thin v1 with "input-thin" flag.** Mirrors today's "thin ZoG → thin v1, that is correct" pattern. No refusal-to-generate. No hard gate on /ubb. | decided |
| 4 | Order-of-operations gate | **Optional with banner.** /ubb stays accessible without Mission + Assets; UI surfaces an input-thin notice when generating without them. | decided |
| 5 | Phasing | **Five phases** (0 = Deep ZoG passthrough, 1 = Mission, 2 = Assets, 3 = inputsNeeded map, 4 = input-staleness banner). Each independently shippable. | decided |
| 6 | Staleness chip absorption | **Absorb.** Phase 4 input-staleness rolls into the same banner code path as the hybrid-staleness chip (sibling-staleness, prompt-staleness, input-staleness become three reasons sharing one UI). | decided |
| 7 | Token budget per call | **Soft cap with warning log at $0.005.** Triggers an investigation, not a hard truncation. | decided |
| 8 | Input-version hash strategy | **Stable hash** of FounderContext at lock time. Auto-tracks any input change. No manual semver bumps. | decided |

## Roast amendments (added 2026-05-21 post-decisions)

After all 8 decisions were resolved, a self-roast surfaced six weaknesses the SoWs did not fully address. They are NOT decisions; they are constraints on how the work proceeds:

1. **"Manual eyeball" was over-used as DoD evidence.** Replaced in the Debugging SoW with snapshot-the-rootSummary-text-into-a-log discipline; each phase ships a `phaseN_rootsummary_sample.txt` artifact for review.
2. **Specificity scores are model-self-reported.** Lift gates require regenerating each test artifact 3 times and averaging, plus a human read on at least 2 artifacts per phase. Encoded in Debugging SoW.
3. **The relevance matrix lives in a parallel doc.** Migration target: Phase 3 moves the matrix into `ARTIFACT_CONFIGS.inputsNeeded` arrays in `supabase/functions/_shared/ubb-prompts.ts`. Until Phase 3 lands, the doc and code are two sources; commit messages must reference Appendix A explicitly.
4. **Phase 0 is not truly "free."** Token-budget exposure is real because `appleseed_data` is rich (nested JSON, several hundred tokens flattened). `deepZogSummary` helper must be size-disciplined (target ≤ 600 chars flattened).
5. **Input-thin signaling gap in Phases 1-3.** A basic toast lands in Phase 1 (when Mission is null) and Phase 2 (when Assets are null). Phase 4 replaces it with the full banner system.
6. **Phantom field bug already exists.** `(zog as any).how_genius_shows_up` referenced in both edge functions but absent from `zog_snapshots` schema. Phase 0 also removes this dead line.

## Out of scope (for this SoW)

- Code changes (live in Implementation SoW + Phase commits)
- DB migrations
- Prompt edits to `ubb-prompts.ts`
- Decisions about QoL / LinkedIn integration (deferred to a v2 deep-context expansion)

## Definition of Done

| # | Done state | Evidence | Status |
|---|---|---|---|
| 1 | Architecture decision (A or B) recorded with reasoning | This doc, row 1 marked decided | done |
| 2 | Per-artifact relevance matrix locked as v1 | Appendix A signed off as baseline | done |
| 3 | Graceful degradation policy chosen, encoded | Row 3 marked decided | done |
| 4 | Phasing approved | Implementation SoW phase headers reflect choice | done |
| 5 | Staleness absorption decision (yes/no) | Row 6 marked decided (yes, absorb) | done |
| 6 | Token budget policy decided | Row 7 marked decided | done |
| 7 | Input-version hash strategy decided | Row 8 marked decided | done |
| 8 | All decisions captured in this doc so an implementer can act on them cold | Doc reads as actionable spec | done |

## Appendix A — Per-artifact relevance matrix v1

*Legend: blank = not relevant; ✓ = read; ✓✓ = significant input; ✓✓✓ = primary input.*

| Artifact | ZoG headline | ZoG depth (appleseed) | Mission | Assets | QoL (v2) |
|---|---|---|---|---|---|
| uniqueness | ✓ | ✓✓ | | | |
| myth | ✓ | ✓ | ✓✓ | | |
| tribe | ✓ | ✓ | ✓✓ | | |
| pain | ✓ | ✓✓ | ✓ | | ✓ |
| promise | ✓ | ✓ | ✓✓ | | |
| lead_magnet | ✓ | ✓ | ✓ | ✓✓ | |
| value_ladder | | ✓ | ✓ | ✓✓ | |
| specificity_matrix | ✓ | ✓✓ | ✓ | | |
| session_bridge | ✓ | ✓ | ✓✓ | ✓ | |
| core_belief | ✓ | ✓ | ✓✓ | | |
| packaging | | ✓ | ✓ | ✓✓ | |
| frictionless_purchase | | | | ✓✓✓ | |
| reach | | | ✓ | ✓✓✓ | |
| delivery | | | | ✓✓✓ | |
| spread | | | ✓ | ✓✓ | |
| surface_inventory | | | | ✓✓✓ | |
| tuning_fork | ✓ | ✓ | ✓✓ | ✓ | |
| golden_dm | ✓ | ✓ | ✓ | ✓✓ | |
| landing_page | ✓ | ✓ | ✓ | ✓✓ | |

**Rollup**: 19 / 19 artifacts benefit from ZoG depth (Phase 0). 12 / 19 benefit from Mission (Phase 1). 14 / 19 benefit from Assets (Phase 2). Distribution artifacts (reach, delivery, spread, surface_inventory, frictionless_purchase) are currently hallucinating; they have nothing concrete to ground in until Phase 2.

## Appendix B — Strategic concerns already named

These do not need decisions; they inform the work and live here for reference.

1. **Token + cost asymmetry.** Adding richer context lifts cost from ~$0.0003 to ~$0.001-$0.0025 per call. Trivial individually; at 1,000 founders × 57 calls each, on the order of $60-140 per full canvas. Worth it for the signal lift.
2. **Distribution artifacts have the biggest user-felt lift.** Phase 2 (Assets) is where users will go "oh, now this is real."
3. **Order-of-operations already implies this.** JOURNEY today is Top Talent → Mission → Assets → QoL → Build. The flow already implies "by the time you hit Build, all this context is real." This refactor finally makes that implicit promise true.
4. **The funnel argument strengthens.** After this lands, completing Mission + Assets before /ubb is no longer an optional adornment to the ME pane; it is a literal input to the AVB. The match-flow CTAs become more weight-bearing.

# UBB Deep Context — Planning SoW + DoD

*Day 78, 2026-05-21. Author: Sasha + AI lane. Status: draft, decisions pending.*

## TLDR

`/ubb` artifact prompts today see only ~4 ZoG headline fields (top_three_talents, archetype_title, core_pattern, plus optional excalibur_data). The rich `appleseed_data` JSON is already loaded into the UBB context and dropped on the floor before the edge-function call. Mission and assets are not loaded at all. This planning SoW captures every design decision that must land BEFORE any code change ships. Output of this SoW is decisions, not files.

## What this SoW covers

Strategic and architectural decisions. Not code. Closing the DoD below unblocks the Implementation SoW.

## Decisions to make

| # | Decision | Options | Default lean | Status |
|---|---|---|---|---|
| 1 | Architecture: per-artifact filtering location | A) Pass full FounderContext, edge function filters per artifact_key. B) Client filters before send. | **A** (simpler client, edge owns the logic that already owns the prompt) | pending |
| 2 | Per-artifact relevance map | The 19×5 matrix in Appendix A | Approve as v1 baseline | pending |
| 3 | Graceful degradation policy | a) refuse to generate when mission/assets null. b) generate thin v1, flag artifact as "input-thin." c) soft-gate /ubb behind mission + assets. | **b** (mirrors today's "thin ZoG → thin v1, that is correct" pattern) | pending |
| 4 | Order-of-operations gate | Soft-gate /ubb behind Mission + Assets, or keep optional | **Optional, with banner** when missing (b above) | pending |
| 5 | Phasing | Five phases (0=Deep ZoG passthrough, 1=Mission, 2=Assets, 3=inputsNeeded map, 4=input-staleness banner) vs compressed | **Five phases** (each is independently shippable, each yields measurable lift) | pending |
| 6 | Staleness chip absorption | Roll input-staleness into the spawned hybrid-staleness chip, or ship orthogonally | **Absorb** (same banner code path, three reasons) | pending |
| 7 | Token budget per call | Hard cap (e.g. $0.005), soft cap, or no cap | **Soft cap with warning log** ($0.005 trigger) | pending |
| 8 | Input-version hash strategy | Stable hash of FounderContext at lock time, OR semver bump per data source | **Stable hash** (auto-tracks any input change, no manual bumps) | pending |

## Out of scope (for this SoW)

- Code changes
- DB migrations
- Prompt edits to `ubb-prompts.ts`
- Decisions about QoL / LinkedIn integration (deferred to a v2 deep-context expansion)

## Definition of Done

| # | Done state | Evidence | Status |
|---|---|---|---|
| 1 | Architecture decision (A or B) recorded with reasoning | This doc, Section "Decisions to make," row 1 marked decided | pending |
| 2 | Per-artifact relevance matrix locked as v1 | Appendix A signed off | pending |
| 3 | Graceful degradation policy chosen, encoded | Decision row 3 marked decided | pending |
| 4 | Phasing approved | Implementation SoW phase headers reflect choice | pending |
| 5 | Staleness absorption decision (yes/no) | Decision row 6 marked decided; if yes, the spawned hybrid-staleness chip prompt gets expanded | pending |
| 6 | Token budget policy decided | Decision row 7 marked decided | pending |
| 7 | Input-version hash strategy decided | Decision row 8 marked decided | pending |
| 8 | All decisions captured in this doc so an implementer can act on them cold | doc reads as actionable spec, not analysis | pending |

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

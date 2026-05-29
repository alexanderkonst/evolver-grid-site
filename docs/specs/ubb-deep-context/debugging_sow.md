# UBB Deep Context — Debugging + Validation SoW + DoD

*Day 78, 2026-05-21. Status: runs alongside the Implementation SoW.*

## TLDR

How we know it works, what to measure, what to do when it breaks. Forward-looking checks for each shipping phase plus a rollback plan that respects the monotonic invariant.

## Per-phase smoke test protocol

Run this BEFORE each phase ships to production.

1. **Snapshot the baseline.** On a fresh test profile that has full ZoG + Mission + Assets, lock one artifact each from: cheap (uniqueness), mid (myth), distribution (reach), value (value_ladder). Record the AI-returned specificity scores.
2. **Apply the phase under test** (merge to a preview branch).
3. **Regenerate the same four artifacts** v1 from scratch (not Improve, fresh Generate). Record new specificity scores.
4. **Compare**: new v1 specificity vs old v1 specificity, per artifact.
5. **Decision**: if new v1 specificity is ≥ +0.5 on at least 2 of 4 test artifacts, phase shows lift and ships. If flat or down, do not merge; investigate root cause first.

## Expected lift map per phase

| Phase | Strongest expected lift in | Why |
|---|---|---|
| 0 (Deep ZoG passthrough) | uniqueness, myth, tuning_fork | Richer voice signal already exists; just unlocking it. |
| 1 (Mission) | myth, tribe, promise, core_belief | Mission encodes worldview and A→B; these artifacts are derived from worldview. |
| 2 (Assets) | reach, frictionless_purchase, surface_inventory, value_ladder, delivery | Distribution artifacts were operating blind; now grounded in actual inventory. |
| 3 (inputsNeeded map) | Every artifact noise drops; signal:noise rises; specificity stable or up | Prevents prompt pollution. |
| 4 (Input-staleness banner) | UX precision: stale banner finally names the right reason | Three banner copies (sibling / prompt / input). |

## Production telemetry

| Metric | Trigger | Action |
|---|---|---|
| Per-call cost > $0.005 | log warning with `artifact_key + rootSummary token count` | check if rootSummary needs filtering tightened (Phase 3 inputsNeeded) |
| Per-call latency > 30s | log warning | check Lovable AI Gateway status; may be upstream Gemini issue |
| New v1 specificity drops by >0.5 on any artifact, sustained over 3 consecutive generations | regression alert | rollback last shipped phase |
| Mission load fails (DB timeout, RLS) | non-fatal warning | UBB falls back to ZoG + Assets only; banner shows "mission unavailable, retry later" |
| Assets load fails | non-fatal warning | UBB falls back to ZoG + Mission only; banner shows "assets unavailable, retry later" |

## Rollback plan

Phases 0-3 are pure code, zero DB changes. Rollback equals `git revert <phase-commit>`. Instant.

Phase 4 introduces one DB column (`input_version_at_lock TEXT NULL`). Rollback equals revert the code; leave the column in place. The column stays NULL on new rows with no consumer reading it; harmless legacy.

The monotonic invariant on `user_business_artifacts` (append-only locked versions) means a rollback never destroys user data. Worst case after rollback: a few new VersionRows exist that referenced the new pipeline; they remain readable, just not regeneratable from the same context.

## User-felt validation (qualitative)

After Phase 2 ships and before declaring the whole rollout done:

1. Sasha runs his own /ubb end-to-end on the new pipeline (fresh canvas, with Mission + Assets already saved).
2. Sasha re-Improves a previously locked artifact (e.g., reach) and compares the new draft against the old locked version.
3. Sasha names the artifact where the lift was MOST felt and the artifact where it was LEAST felt. Both become signal for tuning the relevance matrix v2.

## Definition of Done (Debugging SoW)

| # | Done state | Evidence | Status |
|---|---|---|---|
| 1 | Per-phase smoke test protocol used before each ship | comment in each phase's merge commit citing test results | pending |
| 2 | Production telemetry visible to Sasha (cost, latency, specificity floor) | Sasha confirms he can see these in Lovable AI Gateway logs or equivalent | pending |
| 3 | Rollback tested at least once (Phase 0 commit → revert → smoke test confirms no breakage) | git log + smoke test pass post-revert | pending |
| 4 | Specificity regression check passes for all 19 artifacts at end of Phase 3 | a small CSV or markdown table comparing pre-Phase-0 v1 specificity vs post-Phase-3 v1 specificity per artifact | pending |
| 5 | User-felt validation: Sasha runs end-to-end on the new pipeline and signs off in writing (Day X session log entry) | docs/09-logs/session_log.md entry | pending |
| 6 | Two artifacts where lift was felt most / least are named, fed back into a relevance matrix v2 candidate notes file | docs/specs/ubb-deep-context/relevance-matrix-v2-notes.md (created at Phase 2 close) | pending |

## Failure modes we should be ready for

1. **Token bloat on Phase 2.** Asset inventory can be large (10-50 assets per user). Without Phase 3 filtering shipping CLOSE behind, costs can spike. Mitigation: ship Phase 3 in the same PR or immediately after Phase 2.
2. **Hallucinated asset references.** Model could invent assets that look plausible but were not in the inventory. Mitigation: spot-check that the model's reasoning trace cites only assets present in the input.
3. **Mission as overpowered signal.** A sharp mission can dominate the model's reasoning and crowd out ZoG. Mitigation: in the relevance matrix, treat Mission as ✓✓ not ✓✓✓ for early-derivation artifacts; let ZoG anchor the voice.
4. **Specificity inflation.** Model may score itself higher because it has more to chew on, not because output is genuinely sharper. Mitigation: cross-check specificity score against a human eyeball on at least 3 artifacts per phase.
5. **Staleness banner over-fires.** If every Mission edit re-stales all 12 mission-using artifacts, users may get nudge fatigue. Mitigation (Phase 4): a debounce on input-staleness flags so the banner appears once per editing session, not on every keystroke.

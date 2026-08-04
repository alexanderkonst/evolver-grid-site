# Result Experience EXT — Change Map

*Phase 1 deliverable (audit and preservation) per `docs/specs/quiz/ext_implementation_brief.md` §2, §27. Companion to `docs/specs/quiz/result_experience_v1.md`, which freezes the current implementation. This document plans Phase 2+ without touching code. All key paths below are proposed, not yet created.*

---

## 1. Reusable v1 keys for EXT

### Directly reusable (infra, not content)
- **Locale infra** — the `quiz.*` namespace pattern itself, all three locale files (`src/locales/{en,ru,es}/common.json`), the `t()` / `returnObjects: true` conventions used throughout `TransitionQuizPage.tsx`.
- **`quiz.stageNames.{1-7}`** — stage names are structural (Q1 arc labels), not v1-specific content. EXT's chapter header (brief §7.1) uses the same 7-stage names.
- **`quiz.back`, `quiz.progressLabel`, `quiz.loading`** — shared chrome copy, quiz-question-agnostic.
- **Q1/Q2/Q3 prompts and options** (`quiz.q1.*`, `quiz.q2.*`, `quiz.q3.*`) — the brief is explicit (§3, §27 Phase 1) that the 3-question core quiz is unchanged. EXT reuses these verbatim; no new diagnostic screen.
- **`quiz.notYet.*`** (all not-yet content) — brief §20 explicitly preserves "stages 1-3 no-pressure branches." EXT does not touch this branch at all.
- **`quiz.result.crossedPeer.*`** and the `isCrossedPeer` routing — brief §20 explicitly preserves crossed-peer behavior "should continue receiving a distinct relationship." EXT prototype gate (§24) does not include crossed-peer results.
- **`quiz.saveRead.*`, `quiz.claimRead.*`** — the permalink/claim infrastructure is generic continuity plumbing; EXT's save-and-return (brief §12) is a superset of this behavior, likely extending rather than replacing it. Reuse the `resultId`/`SaveMyRead` pattern as the technical basis for the new save block.
- **`engine.ts` types and functions almost entirely**: `Stage`, `UniquenessCategory`, `EmergingWorkStage`, `CoreAnswers`, `isNotYetStage`, `notYetVariant`, `isCrossedPeer`, `meetsDirectionCallGate` (as an input signal, see §5 below), `encodeShareState`/`decodeShareState`/`QuizShareState` (extend, don't replace — see §3).

### V1-only — must NOT be reused in EXT
- **`quiz.result.chapter.{4-7}`** — v1's chapter copy is generic stage description; EXT's chapter header needs a stage-specific "bullseye" (brief §7.1) that counters specific misreadings, which v1's chapter key does not attempt. New key required (see §2).
- **`quiz.result.beats.*`** (18 keys, per-uniqueness heading/body/nextMove) — this is v1's entire 3-beat synthesis logic keyed by `UniquenessCategory` alone. EXT's synthesis (brief §7.4) is keyed by **synthesis family** (coherence/form/release/contact, brief §4/§16) derived from the *combination* of all three answers, not uniqueness alone. Do not reuse; author new synthesis-family copy.
- **`quiz.result.workStageClause.*`** — folded into v1's synthesis instead of EXT's separate evidence-block structure (brief §7.3: "You said… / You also said… / And… / Taken together…"). Superseded by the new evidence primitives.
- **`quiz.buyingFrame.*`, `quiz.directionCall.*`, `quiz.means.*`** — brief §10 explicitly: "Replace the existing buying-frame threshold screen in Result Experience EXT... Preserve the former logic as v1 history." Do not reuse the qualifier copy or the "will you pay me" framing. EXT's preparation selector (§2 below) replaces this entirely.
- **`quiz.result.believability.intro`, `TESTIMONIALS` usage in the quiz** — brief §18: "Do not show testimonials in the first EXT prototype." `TESTIMONIALS` array itself and `BelievabilityQuote` component stay in v1's code path only; do not call from the EXT result component.
- **`quiz.recognitionDelta.*`** — already dead in v1 (widget removed Day 142); not a candidate for EXT reuse; stays retained-for-history only.
- **`quiz.result.continueCta`, `quiz.result.selectionNote`, `quiz.result.honestEnding`, `quiz.buyingFrame.closedEnding`** — CTA/ending copy tied to the old qualifier flow; EXT's Act III has its own CTA and completion-boundary copy (brief §9, §14.11).

---

## 2. New key namespace plan — `quiz.ext.*`

Proposed tree for the EXT prototype (Phase 2/3 scope, representative pattern only — brief §24). Grouped by macro-act per brief §6.

```
quiz.ext.chapter.bullseye.<stage>              # §7.1 — one per stage (prototype: stage 5 only)
quiz.ext.chapter.arcNote                       # §7.2 — shared quiet copy ("People may move back and forth...")

quiz.ext.evidence.youSaid.<synthesisFamily>     # §7.3 — stage-supported statement
quiz.ext.evidence.youAlsoSaid.<synthesisFamily> # emerging-work-supported statement
quiz.ext.evidence.and.<synthesisFamily>         # uniqueness-supported statement
quiz.ext.evidence.takenTogether.<synthesisFamily> # combination-supported synthesis lead-in
quiz.ext.evidence.heading                       # "What your answers revealed"

quiz.ext.synthesis.<synthesisFamily>            # §7.4 — coherence | form | release | contact
quiz.ext.upgradedQuestion.<synthesisFamily>.<stage>  # §7.5 — mapped by family AND stage per brief §16 item 8

quiz.ext.completionMarker.<stage>               # §7.6 — mapped by stage per brief §16 item 9

quiz.ext.detour.<detourId>.move                 # §8.2 — detourId from the approved library (§8.3), e.g. workingDownstream, prematureCommitment, mistakingFocusForAmputation, preservingOldIdentity, buildingBeforeNaming, misreadingInvitation, choosingDownstreamHelper, mistakingReliefForDirection, romanticizingComplexity, waitingUpstreamForever
quiz.ext.detour.<detourId>.whyAttractive
quiz.ext.detour.<detourId>.whatItMisses
quiz.ext.detour.<detourId>.likelyCost
quiz.ext.detour.<detourId>.correction
quiz.ext.detour.headingVariant.<n>              # "A MOVE TO WATCH" / "WHERE PEOPLE OFTEN LOSE TIME HERE" / "A COMMON DETOUR" — §8.1

quiz.ext.fork.<forkId>.optionA                  # §8.5 — forkId: visibleLayer | commitment | evidence | identity
quiz.ext.fork.<forkId>.optionB

quiz.ext.experiment.<synthesisFamily>.<workStageGroup>  # §8.6 — e.g. coherence, relationship, form, release, realityContact, downstreamPause — mapped by synthesis family + emergingWorkStage per brief §16 item 11
quiz.ext.experiment.doorACta                    # "I'll test this first" — §11 Door A

quiz.ext.resultComplete.line                    # §9.1 — "Your result is complete."
quiz.ext.resultComplete.divider                 # "A next step, only if useful."

quiz.ext.offer.name                             # "The Next Chapter Map" — §9.2 (kept name)
quiz.ext.offer.masterResult                     # §9.3
quiz.ext.offer.explanation.intro                # §9.4
quiz.ext.offer.explanation.examineList.<n>       # 5 bullet items
quiz.ext.offer.explanation.leaveWithList.<n>     # 4 bullet items
quiz.ext.offer.collaborativeStance               # §9.5
quiz.ext.offer.methodAuthority                   # §9.6 — one sentence
quiz.ext.offer.transparency                      # §9.7
quiz.ext.offer.ctaPrimary                        # "Map my next chapter" — §9.8
quiz.ext.offer.ctaMicrocopy                      # "Free · 45 minutes · One focused conversation"
quiz.ext.offer.doorBCta                          # "Map this with someone" — §11 Door B

quiz.ext.preparation.heading                     # "So I can prepare for the conversation…" — §10
quiz.ext.preparation.options.explainFit          # option 1
quiz.ext.preparation.options.knowDecision         # option 2
quiz.ext.preparation.options.haveTest             # option 3
quiz.ext.preparation.options.wantPerspective      # option 4
quiz.ext.preparation.options.somethingElse        # option 5 label
quiz.ext.preparation.somethingElsePlaceholder     # free-text placeholder

quiz.ext.save.secondaryLabel                      # "Keep this result" / "Save this map for later" — §12.1
quiz.ext.save.heading                             # "Keep your result" — §12.2
quiz.ext.save.body                                 # "You do not have to decide today..."
quiz.ext.save.sendCta                              # "Send my return link"
quiz.ext.save.microcopy                            # "One result link. No newsletter required."
quiz.ext.save.confirmation                         # "Saved. This result—and the door back..."

quiz.ext.disagreement.prompt                       # "Something feels off in this read?" — §13
quiz.ext.disagreement.options.chapterRightProblemNot
quiz.ext.disagreement.options.workFurtherAlong
quiz.ext.disagreement.options.projectsDontBelong
quiz.ext.disagreement.options.somethingMissing
quiz.ext.disagreement.options.cannotTellYet

quiz.ext.savedReturn.savedOnLine                    # "You saved this result on [date]" — §12.3
quiz.ext.savedReturn.readFromNowLine                # "Read it from where you are now."
quiz.ext.savedReturn.options.stillAccurate
quiz.ext.savedReturn.options.somethingShifted
quiz.ext.savedReturn.options.readyToTalk

quiz.ext.utility.saveLabel / shareLabel / retakeLabel   # §12.4 quiet utility row
quiz.ext.utility.retakeExplainer                        # explains retake creates vs replaces
```

Note on scale: brief §16 recommends ~40-55 total copy modules for the *full* system across all synthesis families/stages. The tree above is the full namespace shape; Phase 2 (prototype copy) only needs to fill it for **one** synthesis family and **one** stage (the representative pattern in §5 below) — most of the `<synthesisFamily>`/`<stage>` variants stay empty until Phase 6 (copy-system expansion).

---

## 3. Result-version identifier plan

Proposed value domain: `"v1" | "ext-a" | "ext-b"` (per brief §25 — EXT-A reflection-led, EXT-B experiment-led; v1 is the existing 3-beat architecture).

| Surface | Approach | Schema change? |
|---|---|---|
| **Rendered result (DOM)** | Add `data-result-version="v1"\|"ext-a"\|"ext-b"` on the top-level `<section className="tq-card tq-result-card">` in `ResultScreen` (and its EXT equivalent). Cheap, inspectable, no persistence implication. | None |
| **`localStorage` persisted quiz state** (`STORAGE_KEY = "evolver_transition_quiz_v2"`, `PersistedState` interface) | Add an optional `resultVersion?: "v1" \| "ext-a" \| "ext-b"` field to `PersistedState`. Existing stored JSON without the field simply spreads over `initialState`'s default (`loadInitial` already does `{ ...initialState, ...JSON.parse(raw) }`), so old sessions keep working unmodified. | None (additive optional field, client-side only) |
| **Share token / `QuizShareState`** (`engine.ts`) | Add `resultVersion?: "v1" \| "ext-a" \| "ext-b"` as an optional field on `QuizShareState`. `decodeShareState` already does a loose `parsed as QuizShareState` cast after checking only `stage` — an old token decoded by new code, or a new token decoded by old code (if v1 code somehow reads an EXT token), degrades gracefully: the field is simply `undefined`, and absence should be *treated as* `"v1"` by convention (v1 tokens predate the field). | None (additive optional field, client-side encoding only — no DB) |
| **`save-quiz-result` / `save-quiz-email` edge function payload** | Recommend passing `result_version: "v1" \| "ext-a" \| "ext-b"` as an additional optional key in the POST body, mirroring the existing pattern already used for `uniqueness_category`, `buying_frame`, etc. (all optional, all tolerated-absent). The edge function already has a **proven graceful-degradation path**: `save-quiz-result/index.ts` line ~250-256 catches a Postgres "column does not exist" error and retries the insert with only `baseRow` (no vNext columns) — the same pattern should be used for `result_version` if the column doesn't exist yet in a given environment. | **One column addition needed**: `transition_quiz_results.result_version` (text, nullable, default `NULL` meaning "v1" historically). This is the one genuinely new field — everything else above is client-side/stateless. Treat `NULL` as "v1" at the query layer rather than backfilling. |
| **Analytics** | Pass `result_version` as part of the existing `source` string convention already used for `trackPageView("quiz_result", "quiz_result_${resultTemplate}")` — e.g. `trackPageView("quiz_result", "quiz_result_ext-a_${synthesisFamily}")`, OR add it as a new discrete field if `trackFunnelEvent`'s payload shape supports arbitrary metadata (needs verification against `funnelAnalytics.ts`'s `FunnelEvent` interface in Phase 3, not inspected in full during Phase 1). No schema change to `funnel_events` needed if threaded through the existing `source` string. | None if threaded via `source` string |

**Summary — unavoidable vs avoidable:**
- **Unavoidable**: one nullable `result_version` text column on `transition_quiz_results`, because dataset-level filtering/analysis by version (the whole point of A/B testing EXT-A vs EXT-B vs v1) needs a queryable column, not a string embedded in `result_template`. This is a minimal, additive, backward-compatible migration — old rows simply have `NULL` (interpreted as v1).
- **Avoidable**: everything else. DOM attribute, localStorage field, share-token field, and analytics `source` string are all additive/optional and require zero schema changes elsewhere.

---

## 4. Analytics events plan (brief §21)

Proposed `FunnelStep` additions (append to the union in `src/lib/funnelAnalytics.ts`, following the existing `quiz_*` naming convention already used: `quiz_entry`, `quiz_q1`, `quiz_result`, `quiz_cta_click`, `quiz_permalink_saved`):

| Brief §21 item | Proposed event name | Fired via |
|---|---|---|
| result version viewed | `quiz_result_version_viewed` | `trackPageView`, `source` = `result_version` value, on EXT result mount |
| synthesis family | (carried as `source` suffix on the above, not a separate event) `quiz_result_version_viewed` with `source="ext-a_coherence"` etc. | same call |
| confidence category exposure | `quiz_confidence_exposure` | `trackPageView` or `trackCTAClick`-style call, `source` = `direct`/`likely`/`inquiry`, fired once per category rendered (or once per result if all three always render together — decide in Phase 3) |
| detours displayed | `quiz_detours_displayed` | `trackPageView`, `source` = comma-joined detour ids, on Act II mount |
| experiment displayed | `quiz_experiment_displayed` | `trackPageView`, `source` = experiment id |
| experiment selected | `quiz_experiment_selected` | `trackCTAClick`, on Door A "I'll test this first" click |
| conversation outcome selected | `quiz_prep_outcome_selected` | `trackCTAClick`, `source` = selected preparation option |
| booking clicked | `quiz_cta_click` (reuse existing event, new `source` value e.g. `ext_map_book`) | existing pattern |
| save opened | `quiz_save_opened` | `trackCTAClick`, on "Keep this result" click (before email entered) |
| return link requested | `quiz_return_link_requested` | `trackCTAClick`, on save-form submit (parallels existing `quiz_permalink_saved`, but EXT's save block is a superset — reuse `quiz_permalink_saved` if the mechanism is literally the same widget, or introduce this if EXT's save is a distinct flow) |
| saved result revisited | `quiz_saved_result_revisited` | `trackPageView`, on `/quiz/r/:id` mount when the row already has a save date |
| result still accurate | `quiz_saved_still_accurate` | `trackCTAClick`, saved-return state option |
| something shifted | `quiz_saved_something_shifted` | `trackCTAClick`, saved-return state option |
| disagreement reason | `quiz_disagreement_reason` | `trackCTAClick`, `source` = selected disagreement option |
| retake | `quiz_retake` | `trackCTAClick`, on retake button (not currently tracked in v1 — new) |
| share | `quiz_share` | `trackCTAClick`, if a distinct share action exists in EXT beyond save (clarify in Phase 3 — v1 has no explicit "share" button separate from permalink save) |
| booking from live result | `quiz_cta_click` with `source="ext_map_book_live"` | existing pattern, differentiated `source` |
| booking from saved result | `quiz_cta_click` with `source="ext_map_book_saved"` | existing pattern, differentiated `source` — parallels v1's `TransitionQuizResultPage.tsx` `onContinue` opening the booking link directly |

All of the above are additive `FunnelStep` union members plus `source` string conventions — no `funnel_events` table schema change needed (existing table already carries a free-text `source`/label field per `trackCTAClick`'s existing usage).

---

## 5. Routing plan — representative-pattern gate

Brief §24 representative pattern: stage 5 (or central liminality) AND uniqueness in `{integration, vehicle}` AND emergingWorkStage in `{named, built}`.

Proposed gate function, `engine.ts` (new, additive, alongside existing `computeRouting`):

```ts
export function isExtEligible(answers: CoreAnswers): boolean {
  if (isCrossedPeer(answers)) return false; // crossed-peer stays untouched by EXT — brief §20
  const stageEligible = answers.stage === 5; // or a wider "central liminality" band, TBD Phase 2
  const uniquenessEligible = answers.uniqueness === "integration" || answers.uniqueness === "vehicle";
  const workStageEligible = answers.emergingWorkStage === "named" || answers.emergingWorkStage === "built";
  return stageEligible && uniquenessEligible && workStageEligible;
}
```

Call site: in `TransitionQuizResultPage.tsx`'s `ReconstructedResult` and in `TransitionQuizPage.tsx`'s `screen === "result"` render branch, **before** choosing which result component to render — mirroring where `routing = computeRouting(coreAnswers)` is already called (`TransitionQuizPage.tsx:228`, `TransitionQuizResultPage.tsx:293`). Concretely:

```ts
const routing = computeRouting(coreAnswers);
const extEligible = routing.route !== "crossedPeer" && isExtEligible(coreAnswers);
// extEligible === true  → render <ExtResultScreen ... />
// extEligible === false → render existing <ResultScreen ... /> (v1, unmodified)
```

This keeps `computeRouting`, `isCrossedPeer`, `meetsDirectionCallGate`, `routeAfterBuyingFrame` **completely untouched** — EXT is an orthogonal selector layered on top of the existing routing decision, not a replacement of it. All other stage/uniqueness/emergingWorkStage combinations fall through to the existing `ResultScreen` unmodified. Crossed-peer and not-yet branches are explicitly excluded from `isExtEligible` and never reach the EXT selector at all (not-yet already short-circuits before `coreAnswers` even exists, per `TransitionQuizPage.tsx:503-511`).

The `result_version` field (see §3) is set to `"ext-a"`/`"ext-b"` only when `extEligible` is true and a variant has been chosen (Phase 2/3 decides whether variant selection is random, hash-based on `resultId`, or config-driven); otherwise it stays `"v1"` (or `null`, treated as v1).

---

## 6. Data changes needed vs avoidable

**Needed (unavoidable):**
1. `transition_quiz_results.result_version` — nullable text column, additive, NULL = v1 historically. Required for dataset-level filtering across v1/ext-a/ext-b (the entire point of brief §25's two-variant test). No backfill needed; existing rows stay NULL and are interpreted as v1 at the query layer.

**Avoidable (explicitly planned to avoid):**
1. No new table — EXT results are the same `transition_quiz_results` row shape with additional optional columns, not a parallel table. Preserves "one person's passage = one row" (existing v1 data-hygiene principle, TransitionQuizPage.tsx comment lines 322-327).
2. No new columns for preparation-selector answer, disagreement reason, experiment selection, or saved-return shift signal *if* they can be captured via the existing free-text/JSON-tolerant pattern already used for `pattern`, `route_shown`, `result_template` (text columns) — reuse or extend one of these, or add a single JSONB `ext_metadata` column instead of one column per new signal, to keep future EXT iteration (more preparation options, more disagreement options) schema-change-free. Recommend deciding the exact shape in Phase 2 once the prototype's actual field list is locked, per brief §27 Phase 1 instruction to "avoid schema changes unless necessary" — a single `ext_metadata jsonb` column is the single addition that absorbs all future EXT-specific fields without repeated migrations.
3. No changes to `save-quiz-email`, `get-quiz-result`, `claim-quiz-result`, or `quiz-results-export` edge functions' existing contracts — all additions are optional fields on existing payloads, following the exact graceful-degradation pattern already proven in `save-quiz-result/index.ts` (retry-without-column on Postgres "column does not exist" error).
4. No locale schema change beyond adding the new `quiz.ext.*` key tree (§2) — existing `quiz.*` keys are untouched, per brief §2.5 ("do not permanently delete... old locale keys").

**Revised recommendation given #2**: rather than the flat `result_version` column plus scattered new optional payload fields, the cleanest single migration is:
- `transition_quiz_results.result_version` (text, nullable) — for fast/indexed filtering.
- `transition_quiz_results.ext_metadata` (jsonb, nullable) — absorbs preparation-selector answer, disagreement reason, experiment id, synthesis family, and any other EXT-specific signal without further migrations. Phase 2 should lock the exact JSON shape once the prototype's field list is final.

This keeps the "avoid schema changes unless necessary" directive intact: two additive nullable columns total, both backward-compatible with every existing client and every existing row.

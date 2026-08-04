# EXT Phase 5 — Architecture Review (before copy-system expansion)

*Per brief §27 Phase 5. Written August 3, 2026 (Day 142), after the prototype shipped in 628c829d. Phases 6-7 are gated on Sasha's read of this report and real-user contact with the prototype.*

## What the prototype proves

1. **The three-macro-act architecture holds.** The page reads as three movements (Read → Consequence → Door), not ten modules. The evidence block's quote-back grammar ("You said… / You also said… / And… / Taken together…") successfully makes the result traceable to the person's own selections — the core claim-integrity idea works in practice.
2. **The gate pattern is clean.** EXT as an orthogonal selector on top of the untouched v1 engine means zero risk to the other 290+ answer combinations. Rollback is deleting one render branch.
3. **The copy budget is achievable.** The authored EN result lands at ~563 words desktop against the 450-650 budget, and it reads as one voice, not stitched modules.
4. **Confidence grammar renders.** Direct signal (firm), pattern inference (editorial), open inquiry (question treatment) are visually distinct without a legend.

## What remains weak

1. **Page length.** ~4,200px on desktop (v1 was ~1,850px). Within brief §17's word budget but physically long because Act III carries offer + prep selector + save + disagreement + utilities. Watch drop-off between the completion boundary and the CTA; EXT-B (experiment-led, shorter) exists partly as the answer.
2. **The saved-return date line is dormant** until `get-quiz-result` returns `created_at` (one-line select addition, deliberately deferred to keep this ship free of edge-function changes). Degrades gracefully today.
3. **EXT metadata (prep outcome, disagreement, result_version) is sent but dropped** by the current save-quiz-result whitelist. Needs the two additive columns from ext_change_map.md §6 (`result_version` text, `ext_metadata` jsonb) + edge whitelist extension — one future Lovable deploy, batched with anything else.
4. **RU/ES are faithful but unreviewed by a native read-through** in the brief §22 sense (warmth/authority/shame-sensitivity per language). Recommend Sasha skims RU before driving traffic.

## Where copy may feel overconfident

The "Taken together…" synthesis line asserts the coherence frame firmly; the §5 grammar softens it ("This combination often points to…"), but a person with genuinely unrelated projects may still feel over-read. The disagreement control ("These projects or interests do not belong together") is the pressure valve — watch its rate.

## EXT-A or EXT-B to lead?

Ship decision: EXT-A leads (forced). EXT-B is implemented as a render subset and switchable via `extVariantFor`. Recommendation: keep EXT-A until ~30-50 real results, then read the delta between "I'll test this first" clicks and booking clicks; if test-first dominates, EXT-B likely leads.

## Does the call still have a clear job?

Yes — sharper than v1: the result now explicitly does NOT attempt the full relationship map among projects (§28 pushes that into the call), and the prep selector hands the call its opening question. The call contract (§19) still needs its own doc — that is Phase 7, not blocking.

## Does the saved result preserve continuity?

Yes: permalink renders the full EXT decision environment (never jumps to booking), with the three re-entry options. Experiment/prep persistence completes when the backend columns land (see weak #3).

## Gate to Phase 6

Do not multiply the copy matrix until: (a) Sasha approves this report, (b) the prototype has met real users (the brief's own condition), (c) the two backend columns ship so decision data actually lands.

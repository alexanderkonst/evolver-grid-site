# Lovable redeploy prompt — pending code changes awaiting deploy

Sasha has no direct Supabase dashboard access; all deploys go through Lovable,
where he gets two prompts a day. This file holds the standing, copy-paste-ready
redeploy request so pending fixes can be batched into a single prompt instead
of burning a slot per function.

**How to use:** copy the numbered prompt below verbatim into Lovable. After a
batch deploys, delete its entry from this file (or move it to a "done" note in
the session log) so the file only ever holds what's still pending.

---

## Pending as of 2026-07-28

1. Redeploy the edge function `suggest-asset-matches` (and its shared
   dependency `supabase/functions/_shared/matchScoring.ts`, which it imports).
   Reason: anonymized a real client's name and business details that were
   hardcoded as a calibration example in the match-rationale prompt.
2. Redeploy the edge function `proactive-match-proposal`. Reason: anonymized
   a real person's name used as a subject-line style example in the prompt.
3. Redeploy the edge function `generate-excalibur`. Reason: anonymized three
   real clients' names, one real Instagram handle, and their business/pricing
   details that were hardcoded as calibration examples in the prompt.

No schema, migration, or config changes are involved — code-only edge
function updates.

## Pending as of 2026-07-28 (quiz rebuild pass)

4. Run migration `supabase/migrations/20260728180000_transition_quiz_results_add_divergence.sql`
   and redeploy the edge function `save-quiz-result`. Reason: the rebuilt
   Transition Quiz engine (`src/modules/transition-quiz/engine.ts`) now
   cross-checks the self-reported stage (S2) against the stage implied by
   the mean of the nine aspect-question answers, and surfaces the gap to
   the user when the two disagree by more than 2 stages (the "Worth
   noticing" block on the Spread screen, S5) — this is the fix for
   "confidently wrong read on contradictory answers." This adds two
   nullable columns to `transition_quiz_results` (`aspect_derived_stage`,
   `has_stage_gap`) so the same signal reaches the Ripeness Vector dataset,
   and updates `save-quiz-result` to accept and store them. No existing
   columns change; this is additive only, nothing breaks if it isn't run
   immediately — the quiz still works and shows the user-facing gap note
   either way, it just won't be logged to the dataset until deployed.

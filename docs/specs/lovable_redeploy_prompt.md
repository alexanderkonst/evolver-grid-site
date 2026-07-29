# Lovable redeploy prompt — pending code changes awaiting deploy

Sasha has no direct Supabase dashboard access; all deploys go through Lovable,
where he gets two prompts a day. This file holds the standing, copy-paste-ready
redeploy request so pending fixes can be batched into a single prompt instead
of burning a slot per function.

**How to use:** copy the numbered prompt below verbatim into Lovable. After a
batch deploys, delete its entry from this file (or move it to a "done" note in
the session log) so the file only ever holds what's still pending.

---

## Pending

1. **Quiz vNext data layer (Day 139, 2026-07-29).** Run migration
   `supabase/migrations/20260729120000_transition_quiz_vnext_columns.sql`
   (adds nullable columns `uniqueness_category`, `emerging_work_stage`,
   `clarity_unlock`, `buying_frame`, `direction_call_shown`,
   `result_template` to `transition_quiz_results` — additive only, no
   existing column touched) and redeploy the updated `save-quiz-result`
   edge function (`supabase/functions/save-quiz-result/index.ts`), which now
   writes those columns and gracefully falls back to the old row shape if
   the migration hasn't landed yet. The rebuilt `/quiz` (lean 4-question
   vNext) works and logs completions either way — this redeploy just turns
   on the new fields in the dataset.

---

*Previously pending, now deployed (2026-07-28): the three anonymization
redeploys and the prior quiz-rebuild pass (transition_quiz_results table +
divergence columns + `save-quiz-result`).*

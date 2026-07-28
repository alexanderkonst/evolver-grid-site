-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  TRANSITION QUIZ RESULTS — add self-report vs. aspect-score        ║
-- ║  divergence columns. The rebuilt engine (engine.ts, diagnose())    ║
-- ║  now cross-checks the S2 self-reported stage against the stage     ║
-- ║  implied by the mean of the nine aspect-question answers, and      ║
-- ║  surfaces the gap to the user when it's large (see the "Worth      ║
-- ║  noticing" block on S5). This adds the same signal to the dataset  ║
-- ║  so the Ripeness Vector (Phase Shift Technology 123) can see how    ║
-- ║  often self-report and aspect scores diverge. Created: July 28,    ║
-- ║  2026 (Day 138), quiz rebuild pass.                                 ║
-- ╚═══════════════════════════════════════════════════════════════════╝

alter table public.transition_quiz_results
  add column if not exists aspect_derived_stage integer
    check (aspect_derived_stage is null or (aspect_derived_stage >= 1 and aspect_derived_stage <= 7)),
  add column if not exists has_stage_gap boolean;

comment on column public.transition_quiz_results.aspect_derived_stage is
  'Stage implied by round(mean(identity_score, economy_score, fit_score)). Null for not-yet (stage 1-3) completions, which have no aspect scores. Independent of `stage`, which always stays the self-reported S2 answer.';

comment on column public.transition_quiz_results.has_stage_gap is
  'True when abs(aspect_derived_stage - stage) > 2 — the self-report and the aspect-question read disagree enough to be shown to the user as a "worth noticing" note rather than silently resolved either way.';

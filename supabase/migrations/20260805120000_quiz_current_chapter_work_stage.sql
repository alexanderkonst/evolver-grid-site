-- Fix: the emerging_work_stage CHECK constraint does not know the new Q3
-- option "current_chapter" (added alongside the Q1/Q2/Q3 copy revision,
-- Day 145). Without this migration every completion carrying it would
-- fail to insert (500) and be silently lost, same failure class already
-- fixed once for 'suspected'/'delivering' in 20260803120000.
--
-- "current_chapter" mirrors the stage-1 no-ask branch: the person is
-- explicitly not oriented to a next chapter (engine.ts isNotSeeking). It
-- still needs to be a legal value in this column so its completion rows
-- persist for the dataset, even though the client routes it to the
-- honest not-seeking ending instead of a next-chapter read.

ALTER TABLE public.transition_quiz_results
  DROP CONSTRAINT IF EXISTS transition_quiz_results_emerging_work_stage_check;

ALTER TABLE public.transition_quiz_results
  ADD CONSTRAINT transition_quiz_results_emerging_work_stage_check
  CHECK (
    emerging_work_stage IS NULL OR emerging_work_stage IN (
      'not_visible', 'suspected', 'felt', 'named', 'built', 'working', 'delivering', 'fragments', 'current_chapter'
    )
  );

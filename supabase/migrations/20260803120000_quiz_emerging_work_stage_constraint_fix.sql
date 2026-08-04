-- Fix: the emerging_work_stage CHECK constraint was never updated to the
-- live enum. The original vNext migration (20260729120000) allowed
-- ('not_visible','fragments','felt','named','built','working'), but the
-- shipped quiz (engine.ts EmergingWorkStage) uses
-- ('not_visible','suspected','felt','named','built','working','delivering').
--
-- 'suspected' (Q3 option 2) and 'delivering' (Q3 option 7) are live, common
-- answers. Every full-read completion carrying one of them violated the old
-- constraint, so the insert 500'd and the completion row was silently lost
-- (the client is fire-and-forget). This is the same class of fix already
-- applied to uniqueness_category in 20260730004708 (which added 'scaling').
--
-- 'fragments' is kept in the allowed set as a legacy value so the ADD
-- CONSTRAINT never fails on any historical row that might carry it; the
-- current client never sends it.

ALTER TABLE public.transition_quiz_results
  DROP CONSTRAINT IF EXISTS transition_quiz_results_emerging_work_stage_check;

ALTER TABLE public.transition_quiz_results
  ADD CONSTRAINT transition_quiz_results_emerging_work_stage_check
  CHECK (
    emerging_work_stage IS NULL OR emerging_work_stage IN (
      'not_visible', 'suspected', 'felt', 'named', 'built', 'working', 'delivering', 'fragments'
    )
  );

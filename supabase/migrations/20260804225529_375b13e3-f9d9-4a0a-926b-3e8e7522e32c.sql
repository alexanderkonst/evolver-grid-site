ALTER TABLE public.transition_quiz_results
  DROP CONSTRAINT IF EXISTS transition_quiz_results_emerging_work_stage_check;

ALTER TABLE public.transition_quiz_results
  ADD CONSTRAINT transition_quiz_results_emerging_work_stage_check
  CHECK (
    emerging_work_stage IS NULL OR emerging_work_stage IN (
      'not_visible', 'suspected', 'felt', 'named', 'built', 'working', 'delivering', 'fragments'
    )
  );

ALTER TABLE public.transition_quiz_results
  ADD COLUMN IF NOT EXISTS result_version text,
  ADD COLUMN IF NOT EXISTS ext_metadata jsonb;

COMMENT ON COLUMN public.transition_quiz_results.result_version IS
  'Which result architecture the visitor saw: v1 | ext-a | ext-b. NULL = v1 (historical rows).';

COMMENT ON COLUMN public.transition_quiz_results.ext_metadata IS
  'EXT-specific signals as jsonb: synthesis_family, prep_outcome, prep_outcome_other, experiment_selected, disagreement_reason.';
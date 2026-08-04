-- Result Experience EXT — dataset columns.
--
-- The EXT result (docs/specs/quiz/ext_implementation_brief.md) sends two
-- things the current schema cannot store, so the client's decision data is
-- silently dropped today:
--
--   result_version  which result architecture the person actually saw
--                   ('v1' | 'ext-a' | 'ext-b'). NULL on historical rows,
--                   which are interpreted as v1 at the query layer.
--   ext_metadata    the EXT-specific signals: synthesis_family,
--                   prep_outcome (+ prep_outcome_other), experiment_selected,
--                   disagreement_reason. One jsonb column instead of one
--                   column per signal, so future EXT iterations (more
--                   preparation options, more disagreement reasons) need no
--                   further migrations.
--
-- Both additive and nullable: every existing client and every existing row
-- stays valid. See docs/specs/quiz/ext_change_map.md §6.

ALTER TABLE public.transition_quiz_results
  ADD COLUMN IF NOT EXISTS result_version text,
  ADD COLUMN IF NOT EXISTS ext_metadata jsonb;

COMMENT ON COLUMN public.transition_quiz_results.result_version IS
  'Which result architecture the visitor saw: v1 | ext-a | ext-b. NULL = v1 (historical rows).';

COMMENT ON COLUMN public.transition_quiz_results.ext_metadata IS
  'EXT-specific signals as jsonb: synthesis_family, prep_outcome, prep_outcome_other, experiment_selected, disagreement_reason.';

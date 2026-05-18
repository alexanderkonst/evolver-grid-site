-- 2026-05-17: alignment scoring for equilibrium_strategies
--
-- WHY: Sasha wants to compare strategies on alignment with his "highest
-- expression" (Lifelong Dedication + Role) so he can see the scores and
-- prioritize. The score-equilibrium-strategies edge function rates each
-- strategy 0-100 against the user's identity context, plus a one-sentence
-- reasoning. These columns cache the result so we don't re-run the LLM
-- on every page load.
--
-- The user explicitly triggers re-scoring via a button — scores stale
-- after the user edits a strategy or changes their dedication / role.

ALTER TABLE public.equilibrium_strategies
  ADD COLUMN IF NOT EXISTS alignment_score SMALLINT,
  ADD COLUMN IF NOT EXISTS alignment_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS alignment_scored_at TIMESTAMPTZ;

COMMENT ON COLUMN public.equilibrium_strategies.alignment_score IS
  '0-100 alignment with the user''s Lifelong Dedication + Role. Cached from score-equilibrium-strategies edge function. User triggers re-scoring explicitly.';

COMMENT ON COLUMN public.equilibrium_strategies.alignment_reasoning IS
  'One-sentence plain-language reasoning for the alignment_score. Shown on hover/tap of the score badge in the UI.';

COMMENT ON COLUMN public.equilibrium_strategies.alignment_scored_at IS
  'When this strategy was last scored. Used to detect stale scores (e.g., after the user edits the strategy text or their dedication/role).';

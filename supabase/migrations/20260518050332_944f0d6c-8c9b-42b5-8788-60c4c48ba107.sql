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
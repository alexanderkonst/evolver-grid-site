-- 2026-05-29 (Sasha): Strategies become completable + appear in Harvest.
--
-- Problem: equilibrium_strategies has PRIMARY KEY (user_id, position)
-- with position constrained 1-3. There are only ever 3 strategy slots
-- per user. We can't keep "completed" strategies in the same table
-- without breaking the primary key — they'd block new active strategies
-- from taking their slot.
--
-- Solution: a separate archive table. On completion:
--   (1) the live strategy row is copied into equilibrium_strategy_completions
--       (preserving text, set_at, alignment scoring, original position)
--   (2) the live row is DELETED from equilibrium_strategies, freeing the
--       slot for a new direction
-- Harvest unions completed tasks + completed strategies on done_at.
--
-- This matches the conceptual model: a strategy you completed IS a
-- harvest — the direction your action took for some stretch — and the
-- slot opens for the next direction. The completion record is the
-- celebration artifact.

CREATE TABLE public.equilibrium_strategy_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  -- The 1/2/3 slot the strategy occupied when it was completed.
  -- Kept for display ("completed strategy #2") and for the Harvest
  -- restore flow if we ever add one. Not constrained — completions are
  -- immutable historical records.
  original_position SMALLINT,
  -- When the strategy was first set (carried over from
  -- equilibrium_strategies.set_at). Lets Harvest compute "duration in
  -- play" = done_at - set_at, analogous to a task's focus duration.
  set_at TIMESTAMPTZ NOT NULL,
  done_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  alignment_score SMALLINT,
  alignment_reasoning TEXT
);

CREATE INDEX idx_eq_strategy_completions_user_done
  ON public.equilibrium_strategy_completions (user_id, done_at DESC);

ALTER TABLE public.equilibrium_strategy_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eq_strat_comp_select"
  ON public.equilibrium_strategy_completions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "eq_strat_comp_insert"
  ON public.equilibrium_strategy_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "eq_strat_comp_delete"
  ON public.equilibrium_strategy_completions
  FOR DELETE USING (user_id = auth.uid());

COMMENT ON TABLE public.equilibrium_strategy_completions IS
  'Archived/completed strategies. When a strategy is marked complete, its row is copied here and deleted from equilibrium_strategies, freeing the position slot. Harvest unions this with completed tasks for the cross-stream celebration feed.';

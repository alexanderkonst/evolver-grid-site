-- 2026-08-29: Equilibrium "Parked" section (issue #66).
--
-- Important items (strategies, workstreams, tasks, ideas) that are set aside
-- but must stay visible to the user and readable by AI agents. Parking a
-- strategy copies it here and frees its slot in equilibrium_strategies
-- (same copy-then-delete shape as equilibrium_strategy_completions).
-- Writes from agents go through the equilibrium-agent-write edge function
-- (service role); the UI reads through the owner-only RLS below.

CREATE TABLE public.equilibrium_parked (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('strategy', 'workstream', 'task', 'idea')),
  title TEXT NOT NULL,
  body TEXT,
  -- The 1/2/3 strategy slot the item held when parked (strategies only).
  -- Default target for unpark_strategy. Not constrained: historical record.
  source_position INT,
  alignment_score INT,
  parked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Who parked it: an agent name, or 'user'.
  parked_by TEXT
);

CREATE INDEX idx_eq_parked_user_parked_at
  ON public.equilibrium_parked (user_id, parked_at DESC);

ALTER TABLE public.equilibrium_parked ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eq_parked_select" ON public.equilibrium_parked FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "eq_parked_insert" ON public.equilibrium_parked FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "eq_parked_update" ON public.equilibrium_parked FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "eq_parked_delete" ON public.equilibrium_parked FOR DELETE USING (user_id = auth.uid());

COMMENT ON TABLE public.equilibrium_parked IS
  'Items set aside but kept visible: parked strategies, workstreams, tasks, ideas. Shown at the end of the ACT section and returned by equilibrium-agent-write read_state.';

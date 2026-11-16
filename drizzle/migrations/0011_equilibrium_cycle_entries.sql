-- 2026-11-16: Equilibrium Cycle Journal (issue #331).
--
-- One row per thing the user writes during a lunar cycle: what is clearing,
-- the resources that arrive, what ripened, plus a snapshot row each time
-- Moon Focus / a strategy / a workstream title is saved (so Past cycles has
-- real history without touching the existing tables).
--
-- Additive only: one new table, nothing dropped or rewritten.
--
-- Deploy order: this migration first, then the equilibrium-agent-write
-- function. The UI degrades gracefully while the table is missing (the new
-- inputs stay hidden); the function's add_cycle_entry needs it.
--
-- Column notes:
--   cycle_start  start of the cycle's Planning phase (position 1), snapped to
--                the minute, from cycleStartMs() in
--                src/modules/equilibrium/phasePlan.ts. All entries of one
--                cycle share the same value.
--   phase        the semantic phase (1-8) the user was in when writing.
--   tag          kind = 'resource': money|people|calls|offers|info|help.
--                Snapshot kinds: the slot key, so "latest snapshot per
--                cycle" can be taken per slot ('1'|'2'|'3' for a strategy
--                position, the workstream id for a workstream; none for
--                focus). Null otherwise.

CREATE TABLE public.equilibrium_cycle_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_start TIMESTAMPTZ NOT NULL,
  phase       SMALLINT NOT NULL CHECK (phase BETWEEN 1 AND 8),
  kind        TEXT NOT NULL CHECK (kind IN (
                'clearing', 'resource', 'celebration',
                'focus_snapshot', 'strategy_snapshot', 'workstream_snapshot'
              )),
  text        TEXT NOT NULL CHECK (char_length(text) BETWEEN 1 AND 2000),
  tag         TEXT,
  created_by  TEXT NOT NULL DEFAULT 'human',  -- 'human' or the agent_name
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eq_cycle_entries_user_cycle_kind
  ON public.equilibrium_cycle_entries (user_id, cycle_start, kind);

ALTER TABLE public.equilibrium_cycle_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eq_cycle_entries_select" ON public.equilibrium_cycle_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "eq_cycle_entries_insert" ON public.equilibrium_cycle_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "eq_cycle_entries_update" ON public.equilibrium_cycle_entries FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "eq_cycle_entries_delete" ON public.equilibrium_cycle_entries FOR DELETE USING (user_id = auth.uid());
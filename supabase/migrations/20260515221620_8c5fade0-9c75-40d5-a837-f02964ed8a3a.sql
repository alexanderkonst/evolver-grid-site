-- TABLE 1: equilibrium_state
CREATE TABLE public.equilibrium_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_override_text TEXT,
  role_override_text TEXT,
  moon_focus_text TEXT,
  last_synthesis_text TEXT,
  last_synthesis_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equilibrium_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eq_state_select" ON public.equilibrium_state FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "eq_state_insert" ON public.equilibrium_state FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "eq_state_update" ON public.equilibrium_state FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "eq_state_delete" ON public.equilibrium_state FOR DELETE USING (user_id = auth.uid());

-- TABLE 2: equilibrium_strategies
CREATE TABLE public.equilibrium_strategies (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 3),
  text TEXT NOT NULL,
  set_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, position)
);
ALTER TABLE public.equilibrium_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eq_strat_select" ON public.equilibrium_strategies FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "eq_strat_insert" ON public.equilibrium_strategies FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "eq_strat_update" ON public.equilibrium_strategies FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "eq_strat_delete" ON public.equilibrium_strategies FOR DELETE USING (user_id = auth.uid());

-- TABLE 3: equilibrium_workstreams
CREATE TABLE public.equilibrium_workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);
CREATE INDEX idx_eq_workstreams_user ON public.equilibrium_workstreams (user_id, position) WHERE archived_at IS NULL;
ALTER TABLE public.equilibrium_workstreams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eq_ws_select" ON public.equilibrium_workstreams FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "eq_ws_insert" ON public.equilibrium_workstreams FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "eq_ws_update" ON public.equilibrium_workstreams FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "eq_ws_delete" ON public.equilibrium_workstreams FOR DELETE USING (user_id = auth.uid());

-- TABLE 4: equilibrium_tasks
CREATE TABLE public.equilibrium_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workstream_id UUID NOT NULL REFERENCES public.equilibrium_workstreams(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  done_at TIMESTAMPTZ,
  do_now_at TIMESTAMPTZ
);
CREATE INDEX idx_eq_tasks_ws ON public.equilibrium_tasks (workstream_id, status, position);
ALTER TABLE public.equilibrium_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eq_tasks_select" ON public.equilibrium_tasks FOR SELECT
  USING (workstream_id IN (SELECT id FROM public.equilibrium_workstreams WHERE user_id = auth.uid()));
CREATE POLICY "eq_tasks_insert" ON public.equilibrium_tasks FOR INSERT
  WITH CHECK (workstream_id IN (SELECT id FROM public.equilibrium_workstreams WHERE user_id = auth.uid()));
CREATE POLICY "eq_tasks_update" ON public.equilibrium_tasks FOR UPDATE
  USING (workstream_id IN (SELECT id FROM public.equilibrium_workstreams WHERE user_id = auth.uid()));
CREATE POLICY "eq_tasks_delete" ON public.equilibrium_tasks FOR DELETE
  USING (workstream_id IN (SELECT id FROM public.equilibrium_workstreams WHERE user_id = auth.uid()));

-- TABLE 5: equilibrium_focus
CREATE TABLE public.equilibrium_focus (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 3),
  task_id UUID NOT NULL REFERENCES public.equilibrium_tasks(id) ON DELETE CASCADE,
  promoted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, position)
);
ALTER TABLE public.equilibrium_focus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eq_focus_select" ON public.equilibrium_focus FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "eq_focus_insert" ON public.equilibrium_focus FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "eq_focus_update" ON public.equilibrium_focus FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "eq_focus_delete" ON public.equilibrium_focus FOR DELETE USING (user_id = auth.uid());

-- TABLE 6: equilibrium_synthesis_log
CREATE TABLE public.equilibrium_synthesis_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_text TEXT NOT NULL,
  cycle_snapshot_json JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_eq_synth_user_time ON public.equilibrium_synthesis_log (user_id, generated_at DESC);
ALTER TABLE public.equilibrium_synthesis_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eq_synth_select" ON public.equilibrium_synthesis_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "eq_synth_insert" ON public.equilibrium_synthesis_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "eq_synth_update" ON public.equilibrium_synthesis_log FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "eq_synth_delete" ON public.equilibrium_synthesis_log FOR DELETE USING (user_id = auth.uid());

-- RPC: eq_complete_task
CREATE OR REPLACE FUNCTION public.eq_complete_task(p_task_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.equilibrium_tasks t
    JOIN public.equilibrium_workstreams w ON w.id = t.workstream_id
    WHERE t.id = p_task_id AND w.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Task not found or not owned by current user';
  END IF;

  UPDATE public.equilibrium_tasks
    SET status = 'done', done_at = now()
    WHERE id = p_task_id;

  DELETE FROM public.equilibrium_focus
    WHERE task_id = p_task_id;
END;
$$;
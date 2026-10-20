-- 2026-10-17: Equilibrium Task Flow, Phase 1 (issue #71).
-- Spec: docs/04-products/equilibrium_task_flow_spec.md §4.
--
-- Adds the Subtask level, the owner split on tasks, and the owner-split
-- DO NOW (HUMAN = exactly one, AI = unlimited). Additive only: nothing is
-- dropped or rewritten. equilibrium_focus is left untouched (D9); the only
-- data movement is the position-1 backfill into equilibrium_do_now below.
--
-- Deploy order: this migration first, then the equilibrium-agent-write
-- function. The new read_state selects equilibrium_tasks.owner and reads the
-- two new tables, so it fails if it ships before this file is applied.

-- 4.1 equilibrium_tasks: owner. Existing rows become 'human'.
ALTER TABLE public.equilibrium_tasks
  ADD COLUMN owner TEXT NOT NULL DEFAULT 'human' CHECK (owner IN ('human','ai'));

-- 4.2 equilibrium_subtasks. No cap on subtasks per task.
CREATE TABLE public.equilibrium_subtasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id      UUID NOT NULL REFERENCES public.equilibrium_tasks(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL DEFAULT 0,
  text         TEXT NOT NULL CHECK (char_length(text) BETWEEN 1 AND 4000),
  owner        TEXT NOT NULL DEFAULT 'ai' CHECK (owner IN ('human','ai')),
  status       TEXT NOT NULL DEFAULT 'todo'
               CHECK (status IN ('todo','in_progress','waiting','done','dropped')),
  waiting_on   TEXT,          -- who it waits on: 'sasha', 'claude', 'codex', 'lovable', a person's name; null unless status = 'waiting'
  priority     SMALLINT CHECK (priority BETWEEN 1 AND 3),  -- P1..P3, the panel's ranking; null = unranked
  external_ref TEXT,          -- PR / issue / doc URL
  note         TEXT,          -- one-line state, e.g. "Codex PR, check 17:30"
  created_by   TEXT NOT NULL DEFAULT 'human',  -- 'human' or the agent_name
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  done_at      TIMESTAMPTZ
);
CREATE INDEX idx_eq_subtasks_task ON public.equilibrium_subtasks (task_id, status, position);
CREATE INDEX idx_eq_subtasks_user_status ON public.equilibrium_subtasks (user_id, status);

ALTER TABLE public.equilibrium_subtasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eq_subtasks_select" ON public.equilibrium_subtasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "eq_subtasks_insert" ON public.equilibrium_subtasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "eq_subtasks_update" ON public.equilibrium_subtasks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "eq_subtasks_delete" ON public.equilibrium_subtasks FOR DELETE USING (user_id = auth.uid());

-- 4.3 equilibrium_do_now (replaces the 3-slot equilibrium_focus for reads and writes).
CREATE TABLE public.equilibrium_do_now (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner       TEXT NOT NULL CHECK (owner IN ('human','ai')),
  task_id     UUID REFERENCES public.equilibrium_tasks(id) ON DELETE CASCADE,
  subtask_id  UUID REFERENCES public.equilibrium_subtasks(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,          -- order inside AI Do Now; always 0 for human
  promoted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  promoted_by TEXT NOT NULL DEFAULT 'human',
  CHECK ((task_id IS NULL) <> (subtask_id IS NULL))  -- exactly one target
);
-- HUMAN Do Now = exactly one item at a time, enforced by the database.
CREATE UNIQUE INDEX uq_eq_do_now_one_human ON public.equilibrium_do_now (user_id) WHERE owner = 'human';
-- An item can be in Do Now once.
CREATE UNIQUE INDEX uq_eq_do_now_task    ON public.equilibrium_do_now (user_id, task_id)    WHERE task_id IS NOT NULL;
CREATE UNIQUE INDEX uq_eq_do_now_subtask ON public.equilibrium_do_now (user_id, subtask_id) WHERE subtask_id IS NOT NULL;

ALTER TABLE public.equilibrium_do_now ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eq_do_now_select" ON public.equilibrium_do_now FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "eq_do_now_insert" ON public.equilibrium_do_now FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "eq_do_now_update" ON public.equilibrium_do_now FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "eq_do_now_delete" ON public.equilibrium_do_now FOR DELETE USING (user_id = auth.uid());

-- Backfill: the equilibrium_focus row at position 1 becomes the HUMAN row.
-- Positions 2-3 are not carried over; their tasks stay active in their
-- workstream. equilibrium_focus itself is not modified. Safe to re-run.
INSERT INTO public.equilibrium_do_now (user_id, owner, task_id, position, promoted_at, promoted_by)
SELECT f.user_id, 'human', f.task_id, 0, f.promoted_at, 'human'
FROM public.equilibrium_focus f
JOIN public.equilibrium_tasks t ON t.id = f.task_id
WHERE f.position = 1 AND t.status = 'active'
ON CONFLICT DO NOTHING;

-- RPC: eq_promote_do_now
-- Used by the app (Phase 2). Promotes a task or subtask to Do Now in one
-- transaction. Human: replaces the current human item (exactly one at a time)
-- and returns what left in `replaced`. AI: appended at the end, no cap.
-- Re-promoting an item to the owner it already has is a no-op; an item in the
-- other owner's list moves. Agent-write runs as service role (auth.uid() is
-- null there) and does the same delete-then-insert itself.
CREATE OR REPLACE FUNCTION public.eq_promote_do_now(
  p_item_type TEXT,
  p_item_id UUID,
  p_owner TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_task_id UUID;
  v_subtask_id UUID;
  v_status TEXT;
  v_existing public.equilibrium_do_now%ROWTYPE;
  v_human public.equilibrium_do_now%ROWTYPE;
  v_replaced JSONB := NULL;
  v_position INTEGER := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_owner IS NULL OR p_owner NOT IN ('human', 'ai') THEN
    RAISE EXCEPTION 'p_owner must be human or ai';
  END IF;

  -- Ownership goes through the chain: (subtask ->) task -> workstream -> user.
  IF p_item_type = 'task' THEN
    SELECT t.status INTO v_status
    FROM public.equilibrium_tasks t
    JOIN public.equilibrium_workstreams w ON w.id = t.workstream_id
    WHERE t.id = p_item_id AND w.user_id = v_uid;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Item not found or not owned by current user';
    END IF;
    v_task_id := p_item_id;
  ELSIF p_item_type = 'subtask' THEN
    SELECT s.status INTO v_status
    FROM public.equilibrium_subtasks s
    JOIN public.equilibrium_tasks t ON t.id = s.task_id
    JOIN public.equilibrium_workstreams w ON w.id = t.workstream_id
    WHERE s.id = p_item_id AND s.user_id = v_uid AND w.user_id = v_uid;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Item not found or not owned by current user';
    END IF;
    v_subtask_id := p_item_id;
  ELSE
    RAISE EXCEPTION 'p_item_type must be task or subtask';
  END IF;

  IF v_status IN ('done', 'dropped') THEN
    RAISE EXCEPTION 'Cannot promote a % item', v_status;
  END IF;

  SELECT * INTO v_existing
  FROM public.equilibrium_do_now
  WHERE user_id = v_uid
    AND task_id IS NOT DISTINCT FROM v_task_id
    AND subtask_id IS NOT DISTINCT FROM v_subtask_id;

  IF FOUND THEN
    IF v_existing.owner = p_owner THEN
      RETURN jsonb_build_object(
        'promoted', false, 'unchanged', true, 'owner', p_owner,
        'item', jsonb_build_object('type', p_item_type, 'id', p_item_id),
        'replaced', NULL
      );
    END IF;
    -- Moving between owners: drop the old row first.
    DELETE FROM public.equilibrium_do_now WHERE id = v_existing.id;
  END IF;

  IF p_owner = 'human' THEN
    SELECT * INTO v_human
    FROM public.equilibrium_do_now
    WHERE user_id = v_uid AND owner = 'human';
    IF FOUND THEN
      IF v_human.task_id IS NOT NULL THEN
        SELECT jsonb_build_object('type', 'task', 'id', t.id, 'text', t.text) INTO v_replaced
        FROM public.equilibrium_tasks t WHERE t.id = v_human.task_id;
      ELSE
        SELECT jsonb_build_object('type', 'subtask', 'id', s.id, 'text', s.text) INTO v_replaced
        FROM public.equilibrium_subtasks s WHERE s.id = v_human.subtask_id;
      END IF;
      DELETE FROM public.equilibrium_do_now WHERE id = v_human.id;
    END IF;
  ELSE
    SELECT COALESCE(MAX(position), -1) + 1 INTO v_position
    FROM public.equilibrium_do_now
    WHERE user_id = v_uid AND owner = 'ai';
  END IF;

  INSERT INTO public.equilibrium_do_now (user_id, owner, task_id, subtask_id, position, promoted_by)
  VALUES (v_uid, p_owner, v_task_id, v_subtask_id, v_position, 'human');

  IF v_task_id IS NOT NULL THEN
    UPDATE public.equilibrium_tasks SET do_now_at = now() WHERE id = v_task_id;
  END IF;

  RETURN jsonb_build_object(
    'promoted', true, 'unchanged', false, 'owner', p_owner,
    'item', jsonb_build_object('type', p_item_type, 'id', p_item_id),
    'replaced', v_replaced
  );
END;
$$;

REVOKE ALL ON FUNCTION public.eq_promote_do_now(TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.eq_promote_do_now(TEXT, UUID, TEXT) TO authenticated;

COMMENT ON TABLE public.equilibrium_subtasks IS
  'Subtask level under equilibrium_tasks (Task Flow, issue #71). Unlimited per task; owner human or ai; waiting_on names who it waits on.';
COMMENT ON TABLE public.equilibrium_do_now IS
  'Owner-split DO NOW: exactly one human row per user (uq_eq_do_now_one_human), unlimited ai rows. Targets a task or a subtask. Replaces equilibrium_focus for reads and writes.';

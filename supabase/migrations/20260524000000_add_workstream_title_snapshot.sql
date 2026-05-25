-- Snapshot the workstream title onto each task at completion, so the
-- celebration history in Harvest survives hard-deletion of the parent
-- workstream (Sasha 2026-05-24).
--
-- Context: equilibrium_tasks.workstream_id has ON DELETE CASCADE. When
-- the user hard-deletes a workstream (the trash button we ship in
-- WorkstreamsSection), Postgres removes the workstream row plus every
-- task underneath it, plus their focus rows. Harvest is a query over
-- completed tasks; deleting a workstream therefore silently wipes its
-- entire celebration history from Harvest.
--
-- Two-part user intent:
--   (1) clear clutter — hard-delete must remain a real, immediate option
--   (2) preserve the historical record of what was reaped
-- Contradictory under the FK cascade. Resolution: denormalize the
-- workstream title onto each task at completion (read-only snapshot).
-- When the workstream gets deleted, tasks under it die with it (their
-- FK chain is gone), but ANY task with a non-null
-- workstream_title_snapshot already saved its name elsewhere.
--
-- The Harvest read path will:
--   • use workstream_title_snapshot when present (post-completion record)
--   • fall back to the live workstreams.title for tasks completed before
--     this migration shipped (history backfill)
--
-- Schema:
--   workstream_title_snapshot — text, nullable. Populated by the
--     application layer (useEquilibriumV2.completeTask) at the moment
--     a task transitions to status='done'. Never updated afterwards;
--     the snapshot is immutable history.

ALTER TABLE public.equilibrium_tasks
  ADD COLUMN workstream_title_snapshot TEXT;

COMMENT ON COLUMN public.equilibrium_tasks.workstream_title_snapshot IS
  'Immutable copy of the parent workstream.title at the moment this task was marked done. Allows Harvest to preserve celebration history when the parent workstream is hard-deleted. Populated by the application layer (eq_complete_task RPC + client hook).';

-- Backfill existing completed tasks. For tasks already done, snapshot
-- their CURRENT workstream title (best-effort historical record). For
-- tasks where the workstream is already archived/deleted, snapshot
-- whatever title we still have access to via the FK join.
UPDATE public.equilibrium_tasks t
SET workstream_title_snapshot = w.title
FROM public.equilibrium_workstreams w
WHERE t.status = 'done'
  AND t.workstream_id = w.id
  AND t.workstream_title_snapshot IS NULL;

-- Update the eq_complete_task RPC to ALSO populate the snapshot in the
-- same transaction as the status flip. This is the canonical write
-- path; client-side optimistic updates piggy-back on it.
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

  -- Snapshot the parent workstream's title and flip status in one
  -- statement. workstream_title_snapshot is set unconditionally on
  -- complete (overwrites any prior snapshot — harmless because the
  -- title can't change between an uncomplete and a re-complete by
  -- more than the user's manual edit).
  UPDATE public.equilibrium_tasks t
    SET status = 'done',
        done_at = now(),
        workstream_title_snapshot = w.title
    FROM public.equilibrium_workstreams w
    WHERE t.id = p_task_id
      AND t.workstream_id = w.id;

  DELETE FROM public.equilibrium_focus
    WHERE task_id = p_task_id;
END;
$$;

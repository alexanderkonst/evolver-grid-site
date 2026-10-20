-- 2026-10-20: effort + kind tags on equilibrium_subtasks (issue #91).
-- Borrowed from Polsia: a task shows its type and cost before Run.
--
-- Additive and nullable; existing rows stay untagged. Not deployed.
-- Deploy order: this migration first, then the equilibrium-agent-write
-- function (its read_state selects the two new columns).
-- Requires 20261017000000_equilibrium_task_flow.sql (creates the table).

ALTER TABLE public.equilibrium_subtasks
  ADD COLUMN effort TEXT CHECK (effort IS NULL OR char_length(effort) BETWEEN 1 AND 40),
  ADD COLUMN kind   TEXT CHECK (kind IS NULL OR kind IN ('research','build','outreach','ops'));

COMMENT ON COLUMN public.equilibrium_subtasks.effort IS
  'Free-text cost estimate shown before promotion, e.g. ''15m'' or ''1 credit''. Null = not estimated.';
COMMENT ON COLUMN public.equilibrium_subtasks.kind IS
  'Task type shown before promotion: research | build | outreach | ops. Null = untyped.';

-- Collective WP1 · migration 2 of 3: `collective_members` (the core's short profile) + RLS.
-- Spec: docs/specs/collective/build_spec.md (v0.2) → "Data model".
-- Requires migration 1 (20261125210000_collective_member_role.sql) to be committed first.
--
-- Access, per the issue:
--   * a member reads all member rows
--   * a user updates only their own row
--   * an admin (has_role(auth.uid(),'admin')) inserts and deletes
-- Additions, flagged in the PR: admins can also SELECT (Postgres applies SELECT policies
-- to DELETE ... WHERE, so an admin could not revoke without it, and the admin panel lists
-- members), and a member's own UPDATE is limited to the four profile columns.

CREATE TABLE IF NOT EXISTS public.collective_members (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  invited_by      uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  uniqueness_line text,
  offers          text,
  seeks           text,
  site_url        text
);

ALTER TABLE public.collective_members ENABLE ROW LEVEL SECURITY;

-- Grants: nothing for anon; authenticated is narrowed to what the policies allow.
REVOKE ALL ON public.collective_members FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.collective_members TO authenticated;
GRANT UPDATE (uniqueness_line, offers, seeks, site_url) ON public.collective_members TO authenticated;
GRANT ALL ON public.collective_members TO service_role;

-- Read: members see every member row; admins see them too (admin panel + revoke).
-- has_role() is security definer, so this does not recurse into this table.
DROP POLICY IF EXISTS "Members read all collective members" ON public.collective_members;
CREATE POLICY "Members read all collective members"
  ON public.collective_members
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'collective_member'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Update: only your own row (column list is limited by the GRANT above).
DROP POLICY IF EXISTS "Members update own collective row" ON public.collective_members;
CREATE POLICY "Members update own collective row"
  ON public.collective_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert / delete: admin only.
DROP POLICY IF EXISTS "Admins insert collective members" ON public.collective_members;
CREATE POLICY "Admins insert collective members"
  ON public.collective_members
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins delete collective members" ON public.collective_members;
CREATE POLICY "Admins delete collective members"
  ON public.collective_members
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

COMMENT ON TABLE public.collective_members IS
  'Collective core membership (WP1, 2026-11-25). One row per member; the role lives in user_roles (collective_member). Admin grants and revokes; a member edits only their own short profile.';

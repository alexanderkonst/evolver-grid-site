-- Collective WP2 · migration 1 of 2: `collective_invites` (single-use invite links) + RLS.
-- Spec: docs/specs/collective/build_spec.md (v0.2) → "Data model", "Wave 1" (WP2).
-- Builds on WP1 (20261125210000 … 20261125210200); those files are not touched.
--
-- Access, per the issue:
--   * an admin creates, lists and deletes invites
--   * nobody else reads the table directly (no anon grant, no authenticated policy for
--     non-admins); the invite page goes through the two functions in migration 2
--   * no UPDATE grant at all: used_by / used_at are written only by redeem_collective_invite()
--     (security definer)

CREATE TABLE IF NOT EXISTS public.collective_invites (
  code        text PRIMARY KEY,
  created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '30 days',
  used_by     uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at     timestamptz NULL,
  -- URL-safe and at least 12 characters: the code is the whole secret in the link.
  CONSTRAINT collective_invites_code_format CHECK (code ~ '^[A-Za-z0-9_-]{12,64}$')
);

CREATE INDEX IF NOT EXISTS collective_invites_open_idx
  ON public.collective_invites (expires_at)
  WHERE used_by IS NULL;

ALTER TABLE public.collective_invites ENABLE ROW LEVEL SECURITY;

-- Grants: nothing for anon; authenticated is narrowed to what the admin policies allow.
REVOKE ALL ON public.collective_invites FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.collective_invites TO authenticated;
GRANT ALL ON public.collective_invites TO service_role;

DROP POLICY IF EXISTS "Admins read collective invites" ON public.collective_invites;
CREATE POLICY "Admins read collective invites"
  ON public.collective_invites
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- created_by must be the admin themselves, so an invite cannot be attributed to someone else.
DROP POLICY IF EXISTS "Admins create collective invites" ON public.collective_invites;
CREATE POLICY "Admins create collective invites"
  ON public.collective_invites
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    AND created_by = auth.uid()
    AND used_by IS NULL
    AND used_at IS NULL
  );

DROP POLICY IF EXISTS "Admins delete collective invites" ON public.collective_invites;
CREATE POLICY "Admins delete collective invites"
  ON public.collective_invites
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

COMMENT ON TABLE public.collective_invites IS
  'Collective invite links (WP2, 2026-11-25). Single use, 30 days. Admin-only table; redeemed through redeem_collective_invite(), checked through check_collective_invite().';

-- Admin Email Lock (Day 64, May 7, 2026 — Sasha)
--
-- Sasha asked for his admin rights to be PERSISTENT across account
-- deletion, progress reset, and any DB row removal — "whenever an
-- account with this email appears, it should always have all the
-- admin capabilities fully from then on."
--
-- The existing model has two layers that were out of sync:
--   (a) Client-side allowlist in src/lib/isAdmin.ts — already
--       hardcoded with Sasha's email, already survives data deletion
--       because it lives in source. ✓
--   (b) Server-side has_role(user_id, 'admin') checks user_roles —
--       fragile because the row vanishes on account deletion (FK
--       CASCADE) and there's no auto-rehydration on re-signup.
--
-- This migration closes the gap with three reinforcing mechanisms:
--   1. has_role() redefined: returns true for 'admin' when EITHER
--      the user has a user_roles row OR their auth.users.email is
--      in the magic allowlist (case-insensitive). Admin status is
--      now derived from the email — there's no row to delete.
--   2. One-time backfill: insert a user_roles admin row for every
--      currently-existing auth.users record matching the allowlist.
--      Idempotent. Belt-and-suspenders so any code reading the
--      table directly also sees admin.
--   3. AFTER INSERT trigger on auth.users: auto-insert the
--      user_roles row on every future signup with the magic email.
--      So account delete → resignup still leaves a row, even
--      though has_role() alone would already grant admin.
--
-- Magic allowlist (single SQL constant, edit in one place):
--   - alexanderkonst@gmail.com
--   - konst@alum.mit.edu
--   - me@sloan.mit.edu
--
-- To add a future admin email: edit the array literal in both
-- has_role() AND in the trigger function below, ship a new
-- migration. Two-edit pattern is intentional — keeps the source
-- of truth obvious and grep-able.

-- ─── 1. Redefine has_role() with email-derived admin fallback ──

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Magic-email admin: derived from auth.users.email, no row needed.
    -- Survives any deletion of user_roles. Lower-cased for safety.
    (
      _role = 'admin'::app_role
      AND EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = _user_id
          AND lower(email) = ANY (ARRAY[
            'alexanderkonst@gmail.com',
            'konst@alum.mit.edu',
            'me@sloan.mit.edu'
          ])
      )
    )
    OR
    -- Standard user_roles lookup (unchanged behavior for non-magic
    -- emails, for non-admin roles, and for explicitly-granted admins).
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    );
$$;

-- ─── 2. Backfill: ensure existing magic-email users have a row ──

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE lower(email) = ANY (ARRAY[
  'alexanderkonst@gmail.com',
  'konst@alum.mit.edu',
  'me@sloan.mit.edu'
])
ON CONFLICT (user_id, role) DO NOTHING;

-- ─── 3. Trigger: auto-insert on future signups ──

CREATE OR REPLACE FUNCTION public.grant_admin_on_magic_email_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = ANY (ARRAY[
    'alexanderkonst@gmail.com',
    'konst@alum.mit.edu',
    'me@sloan.mit.edu'
  ]) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop any prior version of this trigger (idempotent re-runs).
DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;

CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.grant_admin_on_magic_email_signup();

-- ─── 4. Comment for future spelunkers ──

COMMENT ON FUNCTION public.has_role(uuid, app_role) IS
  'Day 64 (Sasha, 2026-05-07): admin role derives from auth.users.email '
  'when in the magic allowlist (alexanderkonst@gmail.com, konst@alum.mit.edu, '
  'me@sloan.mit.edu), OR from a user_roles row. The email path survives any '
  'data deletion — admin status cannot be revoked from these accounts by '
  'wiping rows. To revoke, the email must be removed from the allowlist '
  'via a new migration.';

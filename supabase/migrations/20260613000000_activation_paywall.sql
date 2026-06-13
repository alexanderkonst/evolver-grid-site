-- Day 95 (Sasha 2026-06-13): $37 deeper Top Talent view paywall.
--
-- Context: the deeper Top Talent view (/game/me/zone-of-genius/*) was
-- auth-gated only — any user who signed up free could read the entire
-- paid product. This migration adds the durable activation marker the
-- content gate keys on, grandfathers every existing account (Option A
-- rollout — zero lockout of current users / founders / coupon cohort),
-- and protects the column so a client cannot self-grant access.
--
-- Order matters: add column → backfill → install protective trigger,
-- so the grandfather backfill (run as the migration role) completes
-- before the trigger that pins the column for non-service-role writers.

-- 1. Durable activation marker. NULL = not activated (new signups).
ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS activation_unlocked_at timestamptz;

-- 2. Grandfather every account that exists today. No current user —
--    including anyone who paid, was gifted, or redeemed a coupon — is
--    locked out. The paywall applies PROSPECTIVELY: rows created after
--    this migration default to NULL and must be unlocked explicitly by
--    the redeem-activation-coupon / confirm-activation-payment edge
--    functions.
UPDATE public.game_profiles
  SET activation_unlocked_at = now()
  WHERE activation_unlocked_at IS NULL;

-- 3. Protect the column. A user CAN update their own game_profiles row
--    (existing RLS for notifications, mission, etc. is unchanged), but
--    they must NOT be able to set activation_unlocked_at on themselves
--    — that would be self-granting paid access. A BEFORE UPDATE trigger
--    pins the column to its prior value for every writer EXCEPT the
--    service role (PostgREST SET ROLE service_role for service-key
--    requests — i.e. the two activation edge functions). Column-level
--    REVOKE does NOT work here because `authenticated` holds table-wide
--    UPDATE, which makes Postgres ignore column-level privileges; a
--    trigger is the reliable mechanism.
CREATE OR REPLACE FUNCTION public.protect_activation_unlocked_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role (edge functions with the service key) may set it.
  -- current_user reflects PostgREST's SET ROLE: 'service_role' for
  -- service-key requests, 'authenticated'/'anon' for client requests.
  IF current_user = 'service_role' THEN
    RETURN NEW;
  END IF;
  -- Everyone else: silently keep the prior value. Never raises — so a
  -- legitimate profile update that happens to include the column (e.g.
  -- an ORM sending the full row) succeeds, it just can't move this field.
  NEW.activation_unlocked_at := OLD.activation_unlocked_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_activation_unlocked_at ON public.game_profiles;
CREATE TRIGGER trg_protect_activation_unlocked_at
  BEFORE UPDATE ON public.game_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_activation_unlocked_at();

COMMENT ON COLUMN public.game_profiles.activation_unlocked_at IS
  'Day 95: timestamp the $37 deeper Top Talent view was unlocked (paid or coupon). NULL = not activated. Settable only by service-role edge functions (see protect_activation_unlocked_at trigger).';

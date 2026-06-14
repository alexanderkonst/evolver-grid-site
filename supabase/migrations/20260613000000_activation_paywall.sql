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

-- 1b. One-time payment-consumption marker. When confirm-activation-payment
--     unlocks via a Stripe session, it stamps that session id here. A
--     partial UNIQUE index makes each paid session usable for exactly ONE
--     account — so a $37 checkout session cannot be replayed across
--     multiple profiles (audit finding: session ids are not secrets).
ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS activation_stripe_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS game_profiles_activation_stripe_session_id_key
  ON public.game_profiles (activation_stripe_session_id)
  WHERE activation_stripe_session_id IS NOT NULL;

-- 2. Grandfather every account that exists today. No current user —
--    including anyone who paid, was gifted, or redeemed a coupon — is
--    locked out. The paywall applies PROSPECTIVELY: rows created after
--    this migration default to NULL and must be unlocked explicitly by
--    the redeem-activation-coupon / confirm-activation-payment edge
--    functions.
UPDATE public.game_profiles
  SET activation_unlocked_at = now()
  WHERE activation_unlocked_at IS NULL;

-- 3. Protect the columns. A user CAN update their own game_profiles row
--    (existing RLS for notifications, mission, etc. is unchanged), but
--    they must NOT be able to set activation_unlocked_at (or the session
--    marker) on themselves — that would be self-granting paid access. A
--    BEFORE UPDATE trigger pins both columns to their prior values for
--    every writer EXCEPT server-side roles (the activation edge functions
--    run as service_role; migrations/admin run as postgres/supabase_admin).
--    Column-level REVOKE does NOT work here because `authenticated` holds
--    table-wide UPDATE, which makes Postgres ignore column-level
--    privileges; a trigger is the reliable mechanism.
--
--    CRITICAL (audit, Day 100): the function is SECURITY INVOKER (NOT
--    SECURITY DEFINER). Under SECURITY DEFINER, current_user resolves to
--    the function OWNER (postgres on Supabase), so a `current_user =
--    'service_role'` check would be FALSE even for the legitimate service-
--    role edge functions — pinning the column for everyone and silently
--    breaking every paid/coupon unlock. As SECURITY INVOKER, current_user
--    correctly reflects PostgREST's per-request SET ROLE. We also check
--    the JWT role claim as a belt-and-suspenders.
CREATE OR REPLACE FUNCTION public.protect_activation_unlocked_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Allow server-side writers: service_role (edge functions via the
  -- service key) and direct admin/migration writes. Everyone else
  -- (authenticated / anon clients) is pinned.
  IF current_user IN ('service_role', 'supabase_admin', 'postgres')
     OR coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role'
  THEN
    RETURN NEW;
  END IF;
  -- Client write: silently keep the prior values. Never raises — a
  -- legitimate profile update that happens to include these columns
  -- (e.g. an ORM sending the full row) succeeds; it just can't move them.
  NEW.activation_unlocked_at := OLD.activation_unlocked_at;
  NEW.activation_stripe_session_id := OLD.activation_stripe_session_id;
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

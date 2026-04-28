-- 1.1 — Create the entitlement_tier enum
DO $$ BEGIN
  CREATE TYPE entitlement_tier AS ENUM (
    'tasting',
    'builder',
    'locked_in',
    'gifted_builder',
    'gifted_locked_in',
    'founders_50',
    'ignition'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1.2 — Add columns to game_profiles (this project's profiles table)
ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS entitlement_tier entitlement_tier NOT NULL DEFAULT 'tasting',
  ADD COLUMN IF NOT EXISTS entitlement_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS entitlement_granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS entitlement_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS entitlement_note TEXT;

-- 1.3 — Index for admin queries
CREATE INDEX IF NOT EXISTS idx_game_profiles_entitlement_tier
  ON public.game_profiles(entitlement_tier)
  WHERE entitlement_tier <> 'tasting';

-- 1.4 — RLS: admins can update entitlement
DROP POLICY IF EXISTS "admins_can_update_entitlement" ON public.game_profiles;
CREATE POLICY "admins_can_update_entitlement"
  ON public.game_profiles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Audit log table
CREATE TABLE IF NOT EXISTS public.entitlement_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_tier entitlement_tier,
  new_tier entitlement_tier NOT NULL,
  expires_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entitlement_grants_profile
  ON public.entitlement_grants(profile_id, created_at DESC);

ALTER TABLE public.entitlement_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_full_access_grants" ON public.entitlement_grants;
CREATE POLICY "admins_full_access_grants"
  ON public.entitlement_grants FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can read their own grant history (join through game_profiles since
-- game_profiles.id ≠ auth.uid())
DROP POLICY IF EXISTS "users_read_own_grants" ON public.entitlement_grants;
CREATE POLICY "users_read_own_grants"
  ON public.entitlement_grants FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM public.game_profiles WHERE user_id = auth.uid()
    )
  );

-- 3. Admin RPC: set_entitlement_tier (resolves by email)
CREATE OR REPLACE FUNCTION public.set_entitlement_tier(
  p_target_email TEXT,
  p_new_tier entitlement_tier,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_note TEXT DEFAULT NULL
)
RETURNS TABLE (
  profile_id UUID,
  previous_tier entitlement_tier,
  new_tier entitlement_tier,
  granted_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_profile_id UUID;
  v_previous_tier entitlement_tier;
BEGIN
  IF NOT public.has_role(v_caller, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can set entitlement tiers';
  END IF;

  SELECT p.id, p.entitlement_tier
    INTO v_profile_id, v_previous_tier
  FROM auth.users u
  JOIN public.game_profiles p ON p.user_id = u.id
  WHERE lower(u.email) = lower(p_target_email)
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'No profile found for email: %', p_target_email;
  END IF;

  UPDATE public.game_profiles
    SET entitlement_tier = p_new_tier,
        entitlement_granted_at = now(),
        entitlement_granted_by = v_caller,
        entitlement_expires_at = p_expires_at,
        entitlement_note = p_note
  WHERE id = v_profile_id;

  INSERT INTO public.entitlement_grants
    (profile_id, granted_by, previous_tier, new_tier, expires_at, note)
    VALUES (v_profile_id, v_caller, v_previous_tier, p_new_tier, p_expires_at, p_note);

  RETURN QUERY SELECT v_profile_id, v_previous_tier, p_new_tier, now();
END;
$$;
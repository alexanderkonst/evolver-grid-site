CREATE OR REPLACE FUNCTION public.revert_expired_entitlement_grants()
RETURNS TABLE (
  reverted_profile_id UUID,
  previous_tier entitlement_tier,
  user_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT gp.id, gp.user_id, gp.entitlement_tier, u.email
    FROM public.game_profiles gp
    LEFT JOIN auth.users u ON u.id = gp.user_id
    WHERE gp.entitlement_expires_at IS NOT NULL
      AND gp.entitlement_expires_at < now()
      AND gp.entitlement_tier IN ('gifted_builder', 'gifted_locked_in')
  LOOP
    UPDATE public.game_profiles
      SET entitlement_tier = 'tasting',
          entitlement_granted_at = now(),
          entitlement_granted_by = NULL,
          entitlement_expires_at = NULL,
          entitlement_note = 'Auto-reverted: gift period ended ' || to_char(now(), 'YYYY-MM-DD')
    WHERE id = r.id;

    INSERT INTO public.entitlement_grants (profile_id, granted_by, previous_tier, new_tier, expires_at, note)
      VALUES (r.id, NULL, r.entitlement_tier, 'tasting', NULL, 'Auto-revert: expired gift');

    RETURN QUERY SELECT r.id, r.entitlement_tier, r.email::TEXT;
  END LOOP;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;
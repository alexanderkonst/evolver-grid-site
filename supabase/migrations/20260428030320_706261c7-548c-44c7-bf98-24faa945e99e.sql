-- Drop old function (return type changed)
DROP FUNCTION IF EXISTS public.revert_expired_entitlement_grants();

-- 1. Cron run log
CREATE TABLE IF NOT EXISTS public.entitlement_cron_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reverted_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  duration_ms INT
);

ALTER TABLE public.entitlement_cron_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_cron_log" ON public.entitlement_cron_log;
CREATE POLICY "admins_read_cron_log"
  ON public.entitlement_cron_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. New revert function
CREATE FUNCTION public.revert_expired_entitlement_grants()
RETURNS TABLE (
  ran_at TIMESTAMPTZ,
  reverted_count INT,
  duration_ms INT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_started TIMESTAMPTZ := clock_timestamp();
  v_count INT := 0;
  v_error TEXT := NULL;
  v_duration INT;
  r RECORD;
BEGIN
  BEGIN
    FOR r IN
      SELECT gp.id, gp.user_id, gp.entitlement_tier,
             COALESCE(u.email, '(missing-email)') AS email
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
        VALUES (r.id, NULL, r.entitlement_tier, 'tasting', NULL,
                'Auto-revert: expired gift (was ' || r.email || ')');

      v_count := v_count + 1;
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    v_error := SQLERRM;
  END;

  v_duration := EXTRACT(MILLISECOND FROM (clock_timestamp() - v_started))::INT;

  INSERT INTO public.entitlement_cron_log (reverted_count, error_message, duration_ms)
    VALUES (v_count, v_error, v_duration);

  RETURN QUERY SELECT v_started, v_count, v_duration, v_error;
END;
$$;

-- 3. Admin rollback
CREATE OR REPLACE FUNCTION public.admin_rollback_entitlement(
  p_target_email TEXT,
  p_reason TEXT DEFAULT 'Manual rollback (admin test)'
)
RETURNS TABLE (
  email TEXT,
  previous_tier entitlement_tier,
  new_tier entitlement_tier
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_profile_id UUID;
  v_prev entitlement_tier;
  v_email TEXT;
BEGIN
  IF NOT public.has_role(v_caller, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can roll back entitlements';
  END IF;

  SELECT gp.id, gp.entitlement_tier, COALESCE(u.email, '(missing-email)')
    INTO v_profile_id, v_prev, v_email
  FROM auth.users u
  JOIN public.game_profiles gp ON gp.user_id = u.id
  WHERE lower(u.email) = lower(p_target_email);

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'No profile found for email: %', p_target_email;
  END IF;

  UPDATE public.game_profiles
    SET entitlement_tier = 'tasting',
        entitlement_granted_at = now(),
        entitlement_granted_by = v_caller,
        entitlement_note = p_reason
  WHERE id = v_profile_id;

  INSERT INTO public.entitlement_grants (profile_id, granted_by, previous_tier, new_tier, note)
    VALUES (v_profile_id, v_caller, v_prev, 'tasting', p_reason);

  RETURN QUERY SELECT v_email::TEXT, v_prev, 'tasting'::entitlement_tier;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_rollback_entitlement(TEXT, TEXT) TO authenticated;
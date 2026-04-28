CREATE OR REPLACE FUNCTION public.admin_lookup_entitlement(
  p_email TEXT
)
RETURNS TABLE (
  email TEXT,
  tier entitlement_tier,
  granted_at TIMESTAMPTZ,
  granted_by_email TEXT,
  expires_at TIMESTAMPTZ,
  note TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can look up entitlements';
  END IF;

  RETURN QUERY
  SELECT
    u.email::TEXT,
    gp.entitlement_tier,
    gp.entitlement_granted_at,
    gb.email::TEXT  AS granted_by_email,
    gp.entitlement_expires_at,
    gp.entitlement_note
  FROM auth.users u
  JOIN public.game_profiles gp ON gp.user_id = u.id
  LEFT JOIN auth.users gb ON gb.id = gp.entitlement_granted_by
  WHERE lower(u.email) = lower(p_email)
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_lookup_entitlement(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_recent_grants(
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  target_email TEXT,
  granted_by_email TEXT,
  previous_tier entitlement_tier,
  new_tier entitlement_tier,
  expires_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can read the audit log';
  END IF;

  RETURN QUERY
  SELECT
    eg.id,
    tu.email::TEXT      AS target_email,
    gu.email::TEXT      AS granted_by_email,
    eg.previous_tier,
    eg.new_tier,
    eg.expires_at,
    eg.note,
    eg.created_at
  FROM public.entitlement_grants eg
  JOIN public.game_profiles gp ON gp.id = eg.profile_id
  JOIN auth.users tu    ON tu.id = gp.user_id
  LEFT JOIN auth.users gu ON gu.id = eg.granted_by
  ORDER BY eg.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 200));
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_recent_grants(INT) TO authenticated;
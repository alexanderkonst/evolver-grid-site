-- 1) events: honor the visibility column
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Public events are viewable; private only by owner"
ON public.events FOR SELECT
USING (visibility = 'public' OR created_by = auth.uid());

-- 2) founder_canvases: writes restricted to admins
DROP POLICY IF EXISTS "Authenticated users can manage canvases" ON public.founder_canvases;
CREATE POLICY "Admins can insert canvases" ON public.founder_canvases
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update canvases" ON public.founder_canvases
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete canvases" ON public.founder_canvases
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read all canvases" ON public.founder_canvases
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3) definer views: stop exposing them (and auth.users) to signed-in clients
REVOKE ALL ON public.founder_state_v1 FROM authenticated, anon;
REVOKE ALL ON public.match_active_declines FROM authenticated, anon;
REVOKE ALL ON public.match_consent_funnel FROM authenticated, anon;
GRANT SELECT ON public.founder_state_v1 TO service_role;
GRANT SELECT ON public.match_active_declines TO service_role;
GRANT SELECT ON public.match_consent_funnel TO service_role;

-- Admin-only accessor so /admin keeps working without exposing the view
CREATE OR REPLACE FUNCTION public.admin_founder_states()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can read founder states';
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.last_touch_at DESC), '[]'::jsonb)
    INTO v_rows
  FROM public.founder_state_v1 t;

  RETURN v_rows;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_founder_states() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_founder_states() TO authenticated, service_role;

-- 4) revoke client EXECUTE on SECURITY DEFINER functions that clients never call
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_product_builder_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_admin_on_magic_email_signup() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_profile_username() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_profile_username(text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.eq_complete_task(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_my_public_profile_username(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_lookup_entitlement(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_recent_grants(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_rollback_entitlement(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_entitlement_tier(text, entitlement_tier, timestamptz, text) FROM PUBLIC, anon;
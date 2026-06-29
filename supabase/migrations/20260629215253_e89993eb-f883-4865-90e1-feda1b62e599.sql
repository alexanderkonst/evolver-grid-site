-- Restore EXECUTE for admin SECURITY DEFINER RPCs to authenticated.
-- These were locked down during a recent security pass; they self-enforce
-- has_role(auth.uid(),'admin') inside the function body, so granting EXECUTE
-- to authenticated does not widen access beyond the admin allow-list.
GRANT EXECUTE ON FUNCTION public.admin_lookup_entitlement(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_recent_grants(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_entitlement_tier(text, public.entitlement_tier, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_rollback_entitlement(text, text) TO authenticated;
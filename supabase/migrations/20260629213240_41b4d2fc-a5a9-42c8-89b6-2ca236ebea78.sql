-- Revert security_invoker on admin views that join auth.users.
-- With security_invoker=true the calling admin user lacked SELECT on
-- auth.users → "permission denied for table users" in /admin.
-- These views are admin-gated client-side (AdminGate) and revoked from anon.
ALTER VIEW public.founder_state_v1 SET (security_invoker = false);
ALTER VIEW public.match_consent_funnel SET (security_invoker = false);
ALTER VIEW public.match_active_declines SET (security_invoker = false);

REVOKE ALL ON public.founder_state_v1 FROM anon;
REVOKE ALL ON public.match_consent_funnel FROM anon;
REVOKE ALL ON public.match_active_declines FROM anon;

GRANT SELECT ON public.founder_state_v1 TO authenticated;
GRANT SELECT ON public.match_consent_funnel TO authenticated;
GRANT SELECT ON public.match_active_declines TO authenticated;
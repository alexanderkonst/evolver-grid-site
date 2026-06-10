
-- Fix orphan-profile and public-read exposures

-- event_rsvps: restrict SELECT to owner
DROP POLICY IF EXISTS "RSVPs are viewable by everyone" ON public.event_rsvps;
CREATE POLICY "Users can view own RSVP" ON public.event_rsvps FOR SELECT USING (auth.uid() = user_id);

-- user_assets: restrict SELECT to owner
DROP POLICY IF EXISTS "Anyone can read assets" ON public.user_assets;
CREATE POLICY "Users can view own assets" ON public.user_assets FOR SELECT USING (auth.uid() = user_id);

-- canvas_snapshots: remove NULL user_id branches
DROP POLICY IF EXISTS "Users can view own canvas snapshots" ON public.canvas_snapshots;
CREATE POLICY "Users can view own canvas snapshots" ON public.canvas_snapshots FOR SELECT
  USING (auth.uid() = user_id OR profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert own canvas snapshots" ON public.canvas_snapshots;
CREATE POLICY "Users can insert own canvas snapshots" ON public.canvas_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id OR profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid()));

-- game_profiles: remove NULL user_id branches
DROP POLICY IF EXISTS "Users can view own game profile" ON public.game_profiles;
CREATE POLICY "Users can view own game profile" ON public.game_profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own game profile" ON public.game_profiles;
CREATE POLICY "Users can insert own game profile" ON public.game_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own game profile" ON public.game_profiles;
CREATE POLICY "Users can update own game profile" ON public.game_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- qol_snapshots: remove NULL user_id branch
DROP POLICY IF EXISTS "Users can view own QoL snapshots" ON public.qol_snapshots;
CREATE POLICY "Users can view own QoL snapshots" ON public.qol_snapshots FOR SELECT
  USING (profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert own QoL snapshots" ON public.qol_snapshots;
CREATE POLICY "Users can insert own QoL snapshots" ON public.qol_snapshots FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid()));

-- zog_snapshots: remove NULL user_id branch
DROP POLICY IF EXISTS "Users can view own ZoG snapshots" ON public.zog_snapshots;
CREATE POLICY "Users can view own ZoG snapshots" ON public.zog_snapshots FOR SELECT
  USING (profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert own ZoG snapshots" ON public.zog_snapshots;
CREATE POLICY "Users can insert own ZoG snapshots" ON public.zog_snapshots FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid()));

-- player_upgrades: remove NULL user_id branch
DROP POLICY IF EXISTS "Users can view own upgrades" ON public.player_upgrades;
CREATE POLICY "Users can view own upgrades" ON public.player_upgrades FOR SELECT
  USING (profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert own upgrades" ON public.player_upgrades;
CREATE POLICY "Users can insert own upgrades" ON public.player_upgrades FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid()));

-- equilibrium_users: drop anon access (bot uses service role)
DROP POLICY IF EXISTS "Anon can select equilibrium users" ON public.equilibrium_users;
DROP POLICY IF EXISTS "Anon can insert equilibrium users" ON public.equilibrium_users;
DROP POLICY IF EXISTS "Anon can update equilibrium users" ON public.equilibrium_users;

-- View security: switch to security_invoker so RLS applies
ALTER VIEW public.founder_state_v1 SET (security_invoker = true);
ALTER VIEW public.match_consent_funnel SET (security_invoker = true);
ALTER VIEW public.match_active_declines SET (security_invoker = true);

-- Revoke EXECUTE on admin/internal SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.admin_lookup_entitlement(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_recent_grants(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_rollback_entitlement(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_entitlement_tier(text, entitlement_tier, timestamp with time zone, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.revert_expired_entitlement_grants() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

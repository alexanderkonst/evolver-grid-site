
DO $$
DECLARE
  v_emails text[] := ARRAY['karimekurit@gmail.com','personalytics@gmail.com','konst@alum.mit.edu','me@sloan.mit.edu'];
  v_user_ids uuid[];
  v_profile_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO v_user_ids FROM auth.users WHERE lower(email) = ANY(v_emails);
  SELECT array_agg(id) INTO v_profile_ids FROM public.game_profiles WHERE user_id = ANY(v_user_ids) OR lower(email) = ANY(v_emails);

  IF v_profile_ids IS NOT NULL THEN
    DELETE FROM public.action_events WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.player_upgrades WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.first_time_actions WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.qol_snapshots WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.zog_snapshots WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.missions WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.quests WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.canvas_snapshots WHERE profile_id = ANY(v_profile_ids) OR user_id = ANY(v_user_ids);
    DELETE FROM public.entitlement_grants WHERE profile_id = ANY(v_profile_ids);
  END IF;

  IF v_user_ids IS NOT NULL THEN
    DELETE FROM public.mission_participants WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.multiple_intelligences_results WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.genius_offer_requests WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.genius_offer_wizard_progress WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.product_builder_snapshots WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.marketplace_products WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.ai_boost_purchases WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.connections WHERE requester_id = ANY(v_user_ids) OR receiver_id = ANY(v_user_ids);
    DELETE FROM public.event_rsvps WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.events WHERE created_by = ANY(v_user_ids);
    DELETE FROM public.artifact_improvements WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.anonymous_genius_results WHERE claimed_user_id = ANY(v_user_ids);
    DELETE FROM public.user_roles WHERE user_id = ANY(v_user_ids);
  END IF;

  DELETE FROM public.nurture_email_queue WHERE lower(email) = ANY(v_emails);
  DELETE FROM public.nurture_opt_outs WHERE lower(email) = ANY(v_emails);
  DELETE FROM public.email_send_log WHERE lower(recipient_email) = ANY(v_emails);
  DELETE FROM public.email_unsubscribe_tokens WHERE lower(email) = ANY(v_emails);
  DELETE FROM public.anonymous_genius_results WHERE lower(email) = ANY(v_emails);
  DELETE FROM public.anonymous_genius_rate_limits WHERE lower(email_lower) = ANY(v_emails);
  DELETE FROM public.multiple_intelligences_assessments WHERE lower(email) = ANY(v_emails);
  DELETE FROM public.event_rsvps WHERE lower(email) = ANY(v_emails);

  IF v_profile_ids IS NOT NULL THEN
    DELETE FROM public.game_profiles WHERE id = ANY(v_profile_ids);
  END IF;
  IF v_user_ids IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = ANY(v_user_ids);
  END IF;
END $$;

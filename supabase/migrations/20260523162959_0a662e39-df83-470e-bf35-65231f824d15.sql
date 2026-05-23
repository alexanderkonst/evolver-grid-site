DO $$
DECLARE
  v_user_id uuid := '649809aa-b036-4411-a495-592777f3c6be';
  v_profile_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO v_profile_ids FROM public.game_profiles WHERE user_id = v_user_id;

  IF v_profile_ids IS NOT NULL THEN
    DELETE FROM public.action_events WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.first_time_actions WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.missions WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.canvas_snapshots WHERE profile_id = ANY(v_profile_ids);
    DELETE FROM public.entitlement_grants WHERE profile_id = ANY(v_profile_ids);
  END IF;

  DELETE FROM public.events WHERE created_by = v_user_id;
  DELETE FROM public.genius_offer_requests WHERE user_id = v_user_id;
  DELETE FROM public.ai_boost_purchases WHERE user_id = v_user_id;
  DELETE FROM public.artifact_improvements WHERE user_id = v_user_id;
  DELETE FROM public.event_rsvps WHERE user_id = v_user_id;
  DELETE FROM public.genius_offer_wizard_progress WHERE user_id = v_user_id;
  DELETE FROM public.marketplace_products WHERE user_id = v_user_id;
  DELETE FROM public.mission_participants WHERE user_id = v_user_id;
  DELETE FROM public.canvas_snapshots WHERE user_id = v_user_id;
  DELETE FROM public.match_interests WHERE from_user_id = v_user_id OR to_user_id = v_user_id;
  DELETE FROM public.match_intros WHERE user_a_id = v_user_id OR user_b_id = v_user_id;
  UPDATE public.anonymous_genius_results SET claimed_user_id = NULL WHERE claimed_user_id = v_user_id;

  DELETE FROM public.game_profiles WHERE user_id = v_user_id;
  DELETE FROM auth.users WHERE id = v_user_id;
END $$;
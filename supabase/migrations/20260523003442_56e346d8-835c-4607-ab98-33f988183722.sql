
DO $$
DECLARE
  target_ids uuid[] := ARRAY[
    '090189b8-2aa8-44c2-8083-d259029470a2'::uuid,
    '661222ec-44e9-48be-82e0-9e50c5484ce1'::uuid,
    '694843dd-be78-4530-a539-6771c391a4ba'::uuid
  ];
  profile_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO profile_ids FROM public.game_profiles WHERE user_id = ANY(target_ids);

  IF profile_ids IS NOT NULL THEN
    DELETE FROM public.action_events WHERE profile_id = ANY(profile_ids);
    DELETE FROM public.first_time_actions WHERE profile_id = ANY(profile_ids);
    DELETE FROM public.missions WHERE profile_id = ANY(profile_ids);
    DELETE FROM public.canvas_snapshots WHERE profile_id = ANY(profile_ids);
    DELETE FROM public.entitlement_grants WHERE profile_id = ANY(profile_ids);
  END IF;

  -- No-cascade FKs
  DELETE FROM public.events WHERE created_by = ANY(target_ids);
  DELETE FROM public.genius_offer_requests WHERE user_id = ANY(target_ids);

  -- Other user-keyed (most cascade but be explicit/safe)
  DELETE FROM public.ai_boost_purchases WHERE user_id = ANY(target_ids);
  DELETE FROM public.artifact_improvements WHERE user_id = ANY(target_ids);
  DELETE FROM public.event_rsvps WHERE user_id = ANY(target_ids);
  DELETE FROM public.genius_offer_wizard_progress WHERE user_id = ANY(target_ids);
  DELETE FROM public.marketplace_products WHERE user_id = ANY(target_ids);
  DELETE FROM public.mission_participants WHERE user_id = ANY(target_ids);
  DELETE FROM public.user_roles WHERE user_id = ANY(target_ids);
  DELETE FROM public.canvas_snapshots WHERE user_id = ANY(target_ids);
  DELETE FROM public.match_interests WHERE from_user_id = ANY(target_ids) OR to_user_id = ANY(target_ids);
  DELETE FROM public.match_intros WHERE user_a_id = ANY(target_ids) OR user_b_id = ANY(target_ids);
  UPDATE public.anonymous_genius_results SET claimed_user_id = NULL WHERE claimed_user_id = ANY(target_ids);

  DELETE FROM public.game_profiles WHERE user_id = ANY(target_ids);

  DELETE FROM auth.users WHERE id = ANY(target_ids);
END $$;

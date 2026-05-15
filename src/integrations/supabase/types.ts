export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      action_events: {
        Row: {
          id: string
          action_id: string
          profile_id: string
          source: string | null
          vector: string | null
          qol_domain: string | null
          selected_at: string | null
          completed_at: string | null
          duration: number | null
          mode: string | null
          metadata: Json
          created_at: string
        };
        Insert: {
          id?: string
          action_id: string
          profile_id: string
          source?: string | null
          vector?: string | null
          qol_domain?: string | null
          selected_at?: string | null
          completed_at?: string | null
          duration?: number | null
          mode?: string | null
          metadata: Json
          created_at: string
        };
        Update: {
          id?: string
          action_id?: string
          profile_id?: string
          source?: string | null
          vector?: string | null
          qol_domain?: string | null
          selected_at?: string | null
          completed_at?: string | null
          duration?: number | null
          mode?: string | null
          metadata?: Json
          created_at?: string
        };
        Relationships: [];
      };
      ai_boost_purchases: {
        Row: {
          id: string
          user_id: string
          created_at: string
          source: string | null
          stripe_session_id: string | null
        };
        Insert: {
          id?: string
          user_id: string
          created_at: string
          source?: string | null
          stripe_session_id?: string | null
        };
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          source?: string | null
          stripe_session_id?: string | null
        };
        Relationships: [];
      };
      anonymous_genius_rate_limits: {
        Row: {
          email_lower: string
          window_start: string
          hit_count: number
        };
        Insert: {
          email_lower: string
          window_start: string
          hit_count: number
        };
        Update: {
          email_lower?: string
          window_start?: string
          hit_count?: number
        };
        Relationships: [];
      };
      anonymous_genius_results: {
        Row: {
          id: string
          email: string
          result_payload: Json
          assessment_version: string
          claimed_user_id: string | null
          claimed_at: string | null
          created_at: string
          updated_at: string
        };
        Insert: {
          id?: string
          email: string
          result_payload: Json
          assessment_version: string
          claimed_user_id?: string | null
          claimed_at?: string | null
          created_at: string
          updated_at: string
        };
        Update: {
          id?: string
          email?: string
          result_payload?: Json
          assessment_version?: string
          claimed_user_id?: string | null
          claimed_at?: string | null
          created_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      artifact_improvements: {
        Row: {
          id: string
          user_id: string
          artifact_key: string
          artifact_before_id: string | null
          artifact_after_id: string | null
          roast_findings: Json
          what_changed: string | null
          crystallized_action: string | null
          specificity_before: number | null
          specificity_after: number | null
          specificity_delta: number | null
          accepted: boolean
          diminishing_returns: boolean
          model_used: string
          created_at: string
        };
        Insert: {
          id?: string
          user_id: string
          artifact_key: string
          artifact_before_id?: string | null
          artifact_after_id?: string | null
          roast_findings: Json
          what_changed?: string | null
          crystallized_action?: string | null
          specificity_before?: number | null
          specificity_after?: number | null
          specificity_delta?: number | null
          accepted: boolean
          diminishing_returns: boolean
          model_used: string
          created_at: string
        };
        Update: {
          id?: string
          user_id?: string
          artifact_key?: string
          artifact_before_id?: string | null
          artifact_after_id?: string | null
          roast_findings?: Json
          what_changed?: string | null
          crystallized_action?: string | null
          specificity_before?: number | null
          specificity_after?: number | null
          specificity_delta?: number | null
          accepted?: boolean
          diminishing_returns?: boolean
          model_used?: string
          created_at?: string
        };
        Relationships: [];
      };
      canvas_snapshots: {
        Row: {
          id: string
          profile_id: string | null
          user_id: string | null
          version: string | null
          session_number: number | null
          uniqueness: Json | null
          myth: Json | null
          tribe: Json | null
          pain: Json | null
          promise: Json | null
          lead_magnet: Json | null
          value_ladder: Json | null
          tagline: string | null
          facilitator: string | null
          session_date: string | null
          notes: string | null
          artifact_status: Json | null
          created_at: string | null
          updated_at: string | null
        };
        Insert: {
          id?: string
          profile_id?: string | null
          user_id?: string | null
          version?: string | null
          session_number?: number | null
          uniqueness?: Json | null
          myth?: Json | null
          tribe?: Json | null
          pain?: Json | null
          promise?: Json | null
          lead_magnet?: Json | null
          value_ladder?: Json | null
          tagline?: string | null
          facilitator?: string | null
          session_date?: string | null
          notes?: string | null
          artifact_status?: Json | null
          created_at?: string | null
          updated_at?: string | null
        };
        Update: {
          id?: string
          profile_id?: string | null
          user_id?: string | null
          version?: string | null
          session_number?: number | null
          uniqueness?: Json | null
          myth?: Json | null
          tribe?: Json | null
          pain?: Json | null
          promise?: Json | null
          lead_magnet?: Json | null
          value_ladder?: Json | null
          tagline?: string | null
          facilitator?: string | null
          session_date?: string | null
          notes?: string | null
          artifact_status?: Json | null
          created_at?: string | null
          updated_at?: string | null
        };
        Relationships: [];
      };
      connections: {
        Row: {
          id: string
          requester_id: string
          receiver_id: string
          status: string | null
          message: string | null
          responded_at: string | null
          created_at: string | null
        };
        Insert: {
          id?: string
          requester_id: string
          receiver_id: string
          status?: string | null
          message?: string | null
          responded_at?: string | null
          created_at?: string | null
        };
        Update: {
          id?: string
          requester_id?: string
          receiver_id?: string
          status?: string | null
          message?: string | null
          responded_at?: string | null
          created_at?: string | null
        };
        Relationships: [];
      };
      email_send_log: {
        Row: {
          id: string
          message_id: string | null
          template_name: string
          recipient_email: string
          status: string
          error_message: string | null
          metadata: Json | null
          created_at: string
        };
        Insert: {
          id?: string
          message_id?: string | null
          template_name: string
          recipient_email: string
          status: string
          error_message?: string | null
          metadata?: Json | null
          created_at: string
        };
        Update: {
          id?: string
          message_id?: string | null
          template_name?: string
          recipient_email?: string
          status?: string
          error_message?: string | null
          metadata?: Json | null
          created_at?: string
        };
        Relationships: [];
      };
      email_send_state: {
        Row: {
          id: number
          retry_after_until: string | null
          batch_size: number
          send_delay_ms: number
          auth_email_ttl_minutes: number
          transactional_email_ttl_minutes: number
          updated_at: string
        };
        Insert: {
          id: number
          retry_after_until?: string | null
          batch_size: number
          send_delay_ms: number
          auth_email_ttl_minutes: number
          transactional_email_ttl_minutes: number
          updated_at: string
        };
        Update: {
          id?: number
          retry_after_until?: string | null
          batch_size?: number
          send_delay_ms?: number
          auth_email_ttl_minutes?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        };
        Relationships: [];
      };
      email_unsubscribe_tokens: {
        Row: {
          id: string
          token: string
          email: string
          created_at: string
          used_at: string | null
        };
        Insert: {
          id?: string
          token: string
          email: string
          created_at: string
          used_at?: string | null
        };
        Update: {
          id?: string
          token?: string
          email?: string
          created_at?: string
          used_at?: string | null
        };
        Relationships: [];
      };
      entitlement_cron_log: {
        Row: {
          id: string
          ran_at: string
          reverted_count: number
          error_message: string | null
          duration_ms: number | null
        };
        Insert: {
          id?: string
          ran_at: string
          reverted_count: number
          error_message?: string | null
          duration_ms?: number | null
        };
        Update: {
          id?: string
          ran_at?: string
          reverted_count?: number
          error_message?: string | null
          duration_ms?: number | null
        };
        Relationships: [];
      };
      entitlement_grants: {
        Row: {
          id: string
          profile_id: string
          granted_by: string | null
          previous_tier: 'tasting' | 'builder' | 'locked_in' | 'gifted_builder' | 'gifted_locked_in' | 'founders_50' | 'ignition' | null
          new_tier: 'tasting' | 'builder' | 'locked_in' | 'gifted_builder' | 'gifted_locked_in' | 'founders_50' | 'ignition'
          expires_at: string | null
          note: string | null
          created_at: string
        };
        Insert: {
          id?: string
          profile_id: string
          granted_by?: string | null
          previous_tier?: 'tasting' | 'builder' | 'locked_in' | 'gifted_builder' | 'gifted_locked_in' | 'founders_50' | 'ignition' | null
          new_tier: 'tasting' | 'builder' | 'locked_in' | 'gifted_builder' | 'gifted_locked_in' | 'founders_50' | 'ignition'
          expires_at?: string | null
          note?: string | null
          created_at: string
        };
        Update: {
          id?: string
          profile_id?: string
          granted_by?: string | null
          previous_tier?: 'tasting' | 'builder' | 'locked_in' | 'gifted_builder' | 'gifted_locked_in' | 'founders_50' | 'ignition' | null
          new_tier?: 'tasting' | 'builder' | 'locked_in' | 'gifted_builder' | 'gifted_locked_in' | 'founders_50' | 'ignition'
          expires_at?: string | null
          note?: string | null
          created_at?: string
        };
        Relationships: [];
      };
      equilibrium_focus: {
        Row: {
          user_id: string
          position: number
          task_id: string
          promoted_at: string
        };
        Insert: {
          user_id: string
          position: number
          task_id: string
          promoted_at: string
        };
        Update: {
          user_id?: string
          position?: number
          task_id?: string
          promoted_at?: string
        };
        Relationships: [];
      };
      equilibrium_state: {
        Row: {
          user_id: string
          mission_override_text: string | null
          role_override_text: string | null
          moon_focus_text: string | null
          last_synthesis_text: string | null
          last_synthesis_at: string | null
          updated_at: string
        };
        Insert: {
          user_id: string
          mission_override_text?: string | null
          role_override_text?: string | null
          moon_focus_text?: string | null
          last_synthesis_text?: string | null
          last_synthesis_at?: string | null
          updated_at: string
        };
        Update: {
          user_id?: string
          mission_override_text?: string | null
          role_override_text?: string | null
          moon_focus_text?: string | null
          last_synthesis_text?: string | null
          last_synthesis_at?: string | null
          updated_at?: string
        };
        Relationships: [];
      };
      equilibrium_strategies: {
        Row: {
          user_id: string
          position: number
          text: string
          set_at: string
        };
        Insert: {
          user_id: string
          position: number
          text: string
          set_at: string
        };
        Update: {
          user_id?: string
          position?: number
          text?: string
          set_at?: string
        };
        Relationships: [];
      };
      equilibrium_synthesis_log: {
        Row: {
          id: string
          user_id: string
          reading_text: string
          cycle_snapshot_json: Json
          generated_at: string
        };
        Insert: {
          id?: string
          user_id: string
          reading_text: string
          cycle_snapshot_json: Json
          generated_at: string
        };
        Update: {
          id?: string
          user_id?: string
          reading_text?: string
          cycle_snapshot_json?: Json
          generated_at?: string
        };
        Relationships: [];
      };
      equilibrium_tasks: {
        Row: {
          id: string
          workstream_id: string
          position: number
          text: string
          status: string
          created_at: string
          done_at: string | null
          do_now_at: string | null
        };
        Insert: {
          id?: string
          workstream_id: string
          position: number
          text: string
          status: string
          created_at: string
          done_at?: string | null
          do_now_at?: string | null
        };
        Update: {
          id?: string
          workstream_id?: string
          position?: number
          text?: string
          status?: string
          created_at?: string
          done_at?: string | null
          do_now_at?: string | null
        };
        Relationships: [];
      };
      equilibrium_users: {
        Row: {
          id: string
          chat_id: number
          birthday: string
          timezone: number | null
          created_at: string
        };
        Insert: {
          id?: string
          chat_id: number
          birthday: string
          timezone?: number | null
          created_at: string
        };
        Update: {
          id?: string
          chat_id?: number
          birthday?: string
          timezone?: number | null
          created_at?: string
        };
        Relationships: [];
      };
      equilibrium_workstreams: {
        Row: {
          id: string
          user_id: string
          position: number
          title: string
          created_at: string
          archived_at: string | null
        };
        Insert: {
          id?: string
          user_id: string
          position: number
          title: string
          created_at: string
          archived_at?: string | null
        };
        Update: {
          id?: string
          user_id?: string
          position?: number
          title?: string
          created_at?: string
          archived_at?: string | null
        };
        Relationships: [];
      };
      event_rsvps: {
        Row: {
          id: string
          event_id: string | null
          user_id: string | null
          status: string | null
          created_at: string | null
          email: string | null
          wants_reminder: boolean | null
        };
        Insert: {
          id?: string
          event_id?: string | null
          user_id?: string | null
          status?: string | null
          created_at?: string | null
          email?: string | null
          wants_reminder?: boolean | null
        };
        Update: {
          id?: string
          event_id?: string | null
          user_id?: string | null
          status?: string | null
          created_at?: string | null
          email?: string | null
          wants_reminder?: boolean | null
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string
          community_id: string | null
          title: string
          description: string | null
          photo_url: string | null
          event_date: string
          event_time: unknown
          location: string | null
          created_by: string | null
          created_at: string | null
          timezone: string | null
          visibility: string | null
        };
        Insert: {
          id?: string
          community_id?: string | null
          title: string
          description?: string | null
          photo_url?: string | null
          event_date: string
          event_time: unknown
          location?: string | null
          created_by?: string | null
          created_at?: string | null
          timezone?: string | null
          visibility?: string | null
        };
        Update: {
          id?: string
          community_id?: string | null
          title?: string
          description?: string | null
          photo_url?: string | null
          event_date?: string
          event_time?: unknown
          location?: string | null
          created_by?: string | null
          created_at?: string | null
          timezone?: string | null
          visibility?: string | null
        };
        Relationships: [];
      };
      first_time_actions: {
        Row: {
          id: string
          profile_id: string
          action_id: string
          completed_at: string
          xp_bonus_awarded: number
        };
        Insert: {
          id?: string
          profile_id: string
          action_id: string
          completed_at: string
          xp_bonus_awarded: number
        };
        Update: {
          id?: string
          profile_id?: string
          action_id?: string
          completed_at?: string
          xp_bonus_awarded?: number
        };
        Relationships: [];
      };
      founder_canvases: {
        Row: {
          id: string
          name: string
          archetype: string
          tagline: string
          session_date: string
          session_number: string
          sigil: string
          uniqueness: string
          myth_lie: string
          myth_truth: string
          myth_line: string
          tribe: string
          pain: string
          promise: string
          color_primary: string
          color_glow: string
          color_bg: string
          color_border: string
          status: string
          consent_given: boolean
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        };
        Insert: {
          id?: string
          name: string
          archetype: string
          tagline: string
          session_date: string
          session_number: string
          sigil: string
          uniqueness: string
          myth_lie: string
          myth_truth: string
          myth_line: string
          tribe: string
          pain: string
          promise: string
          color_primary: string
          color_glow: string
          color_bg: string
          color_border: string
          status: string
          consent_given: boolean
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        };
        Update: {
          id?: string
          name?: string
          archetype?: string
          tagline?: string
          session_date?: string
          session_number?: string
          sigil?: string
          uniqueness?: string
          myth_lie?: string
          myth_truth?: string
          myth_line?: string
          tribe?: string
          pain?: string
          promise?: string
          color_primary?: string
          color_glow?: string
          color_bg?: string
          color_border?: string
          status?: string
          consent_given?: boolean
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      founder_state_v1: {
        Row: {
          user_id: string | null
          slug: string | null
          display_name: string | null
          email: string | null
          onboarding_stage: string | null
          current_step: number | null
          latest_zog_snapshot_at: string | null
          latest_zog_top_talent: string | null
          latest_qol_snapshot_at: string | null
          has_ignition: boolean | null
          has_build: boolean | null
          revenue_total_usd: number | null
          last_touch_at: string | null
          has_top_talent: boolean | null
          top_talent_resonance: number | null
          joined_at: string | null
          has_paid: boolean | null
          days_to_first_paid: number | null
          nurture_status: string | null
        };
        Insert: {
          user_id?: string | null
          slug?: string | null
          display_name?: string | null
          email?: string | null
          onboarding_stage?: string | null
          current_step?: number | null
          latest_zog_snapshot_at?: string | null
          latest_zog_top_talent?: string | null
          latest_qol_snapshot_at?: string | null
          has_ignition?: boolean | null
          has_build?: boolean | null
          revenue_total_usd?: number | null
          last_touch_at?: string | null
          has_top_talent?: boolean | null
          top_talent_resonance?: number | null
          joined_at?: string | null
          has_paid?: boolean | null
          days_to_first_paid?: number | null
          nurture_status?: string | null
        };
        Update: {
          user_id?: string | null
          slug?: string | null
          display_name?: string | null
          email?: string | null
          onboarding_stage?: string | null
          current_step?: number | null
          latest_zog_snapshot_at?: string | null
          latest_zog_top_talent?: string | null
          latest_qol_snapshot_at?: string | null
          has_ignition?: boolean | null
          has_build?: boolean | null
          revenue_total_usd?: number | null
          last_touch_at?: string | null
          has_top_talent?: boolean | null
          top_talent_resonance?: number | null
          joined_at?: string | null
          has_paid?: boolean | null
          days_to_first_paid?: number | null
          nurture_status?: string | null
        };
        Relationships: [];
      };
      game_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          last_zog_snapshot_id: string | null
          last_qol_snapshot_id: string | null
          total_quests_completed: number
          last_quest_title: string | null
          last_quest_completed_at: string | null
          ai_upgrade_access: boolean | null
          xp_total: number
          level: number
          current_streak_days: number
          longest_streak_days: number
          xp_body: number
          xp_mind: number
          xp_emotions: number
          xp_spirit: number
          xp_uniqueness: number
          user_id: string | null
          practice_count: number
          last_practice_at: string | null
          zone_of_genius_completed: boolean | null
          multiple_intelligences_completed: boolean | null
          first_name: string | null
          last_name: string | null
          personality_tests: Json | null
          main_quest_stage: string
          main_quest_status: string
          main_quest_updated_at: string
          main_quest_progress: Json | null
          genius_stage: string | null
          onboarding_completed: boolean
          onboarding_step: number
          avatar_url: string | null
          linkedin_pdf_url: string | null
          linkedin_extracted_at: string | null
          onboarding_stage: string | null
          visibility: string | null
          show_location: boolean | null
          show_mission: boolean | null
          show_offer: boolean | null
          username: string | null
          qol_priority_order: Json | null
          location: string | null
          spoken_languages: string[] | null
          qol_priorities: Json | null
          first_time_actions: Json | null
          mission_id: string | null
          zog_profile_read_at: string | null
          resources_mapped_at: string | null
          mission_discovered_at: string | null
          last_canvas_snapshot_id: string | null
          email: string | null
          access_token: string | null
          entitlement_tier: 'tasting' | 'builder' | 'locked_in' | 'gifted_builder' | 'gifted_locked_in' | 'founders_50' | 'ignition'
          entitlement_granted_at: string | null
          entitlement_granted_by: string | null
          entitlement_expires_at: string | null
          entitlement_note: string | null
        };
        Insert: {
          id?: string
          created_at: string
          updated_at: string
          last_zog_snapshot_id?: string | null
          last_qol_snapshot_id?: string | null
          total_quests_completed: number
          last_quest_title?: string | null
          last_quest_completed_at?: string | null
          ai_upgrade_access?: boolean | null
          xp_total: number
          level: number
          current_streak_days: number
          longest_streak_days: number
          xp_body: number
          xp_mind: number
          xp_emotions: number
          xp_spirit: number
          xp_uniqueness: number
          user_id?: string | null
          practice_count: number
          last_practice_at?: string | null
          zone_of_genius_completed?: boolean | null
          multiple_intelligences_completed?: boolean | null
          first_name?: string | null
          last_name?: string | null
          personality_tests?: Json | null
          main_quest_stage: string
          main_quest_status: string
          main_quest_updated_at: string
          main_quest_progress?: Json | null
          genius_stage?: string | null
          onboarding_completed: boolean
          onboarding_step: number
          avatar_url?: string | null
          linkedin_pdf_url?: string | null
          linkedin_extracted_at?: string | null
          onboarding_stage?: string | null
          visibility?: string | null
          show_location?: boolean | null
          show_mission?: boolean | null
          show_offer?: boolean | null
          username?: string | null
          qol_priority_order?: Json | null
          location?: string | null
          spoken_languages?: string[] | null
          qol_priorities?: Json | null
          first_time_actions?: Json | null
          mission_id?: string | null
          zog_profile_read_at?: string | null
          resources_mapped_at?: string | null
          mission_discovered_at?: string | null
          last_canvas_snapshot_id?: string | null
          email?: string | null
          access_token?: string | null
          entitlement_tier: 'tasting' | 'builder' | 'locked_in' | 'gifted_builder' | 'gifted_locked_in' | 'founders_50' | 'ignition'
          entitlement_granted_at?: string | null
          entitlement_granted_by?: string | null
          entitlement_expires_at?: string | null
          entitlement_note?: string | null
        };
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          last_zog_snapshot_id?: string | null
          last_qol_snapshot_id?: string | null
          total_quests_completed?: number
          last_quest_title?: string | null
          last_quest_completed_at?: string | null
          ai_upgrade_access?: boolean | null
          xp_total?: number
          level?: number
          current_streak_days?: number
          longest_streak_days?: number
          xp_body?: number
          xp_mind?: number
          xp_emotions?: number
          xp_spirit?: number
          xp_uniqueness?: number
          user_id?: string | null
          practice_count?: number
          last_practice_at?: string | null
          zone_of_genius_completed?: boolean | null
          multiple_intelligences_completed?: boolean | null
          first_name?: string | null
          last_name?: string | null
          personality_tests?: Json | null
          main_quest_stage?: string
          main_quest_status?: string
          main_quest_updated_at?: string
          main_quest_progress?: Json | null
          genius_stage?: string | null
          onboarding_completed?: boolean
          onboarding_step?: number
          avatar_url?: string | null
          linkedin_pdf_url?: string | null
          linkedin_extracted_at?: string | null
          onboarding_stage?: string | null
          visibility?: string | null
          show_location?: boolean | null
          show_mission?: boolean | null
          show_offer?: boolean | null
          username?: string | null
          qol_priority_order?: Json | null
          location?: string | null
          spoken_languages?: string[] | null
          qol_priorities?: Json | null
          first_time_actions?: Json | null
          mission_id?: string | null
          zog_profile_read_at?: string | null
          resources_mapped_at?: string | null
          mission_discovered_at?: string | null
          last_canvas_snapshot_id?: string | null
          email?: string | null
          access_token?: string | null
          entitlement_tier?: 'tasting' | 'builder' | 'locked_in' | 'gifted_builder' | 'gifted_locked_in' | 'founders_50' | 'ignition'
          entitlement_granted_at?: string | null
          entitlement_granted_by?: string | null
          entitlement_expires_at?: string | null
          entitlement_note?: string | null
        };
        Relationships: [];
      };
      genius_offer_requests: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          has_ai_assistant: boolean
          ai_summary_raw: string | null
          no_ai_genius_description: string | null
          offers_sold: string | null
          best_client_story: string | null
          extra_notes: string | null
          intelligences_note: string | null
          status: string
          user_id: string | null
          source_branch: string | null
          products_sold: string | null
          best_clients: string | null
          pdf_url: string | null
          summary_title: string | null
          summary_promise: string | null
        };
        Insert: {
          id?: string
          created_at: string
          name: string
          email: string
          has_ai_assistant: boolean
          ai_summary_raw?: string | null
          no_ai_genius_description?: string | null
          offers_sold?: string | null
          best_client_story?: string | null
          extra_notes?: string | null
          intelligences_note?: string | null
          status: string
          user_id?: string | null
          source_branch?: string | null
          products_sold?: string | null
          best_clients?: string | null
          pdf_url?: string | null
          summary_title?: string | null
          summary_promise?: string | null
        };
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          has_ai_assistant?: boolean
          ai_summary_raw?: string | null
          no_ai_genius_description?: string | null
          offers_sold?: string | null
          best_client_story?: string | null
          extra_notes?: string | null
          intelligences_note?: string | null
          status?: string
          user_id?: string | null
          source_branch?: string | null
          products_sold?: string | null
          best_clients?: string | null
          pdf_url?: string | null
          summary_title?: string | null
          summary_promise?: string | null
        };
        Relationships: [];
      };
      genius_offer_wizard_progress: {
        Row: {
          id: string
          user_id: string
          current_step: number | null
          name: string | null
          email: string | null
          has_ai_assistant: boolean | null
          ai_knows_offers: boolean | null
          ai_summary: string | null
          zone_of_genius_completed: boolean | null
          multiple_intelligences_completed: boolean | null
          products_sold: string | null
          best_clients: string | null
          created_at: string | null
          updated_at: string | null
        };
        Insert: {
          id?: string
          user_id: string
          current_step?: number | null
          name?: string | null
          email?: string | null
          has_ai_assistant?: boolean | null
          ai_knows_offers?: boolean | null
          ai_summary?: string | null
          zone_of_genius_completed?: boolean | null
          multiple_intelligences_completed?: boolean | null
          products_sold?: string | null
          best_clients?: string | null
          created_at?: string | null
          updated_at?: string | null
        };
        Update: {
          id?: string
          user_id?: string
          current_step?: number | null
          name?: string | null
          email?: string | null
          has_ai_assistant?: boolean | null
          ai_knows_offers?: boolean | null
          ai_summary?: string | null
          zone_of_genius_completed?: boolean | null
          multiple_intelligences_completed?: boolean | null
          products_sold?: string | null
          best_clients?: string | null
          created_at?: string | null
          updated_at?: string | null
        };
        Relationships: [];
      };
      marketplace_products: {
        Row: {
          id: string
          user_id: string
          snapshot_id: string | null
          slug: string
          title: string
          landing_html: string | null
          blueprint_content: Json | null
          cta_config: Json | null
          is_live: boolean | null
          views: number | null
          published_at: string | null
          created_at: string | null
          updated_at: string | null
        };
        Insert: {
          id?: string
          user_id: string
          snapshot_id?: string | null
          slug: string
          title: string
          landing_html?: string | null
          blueprint_content?: Json | null
          cta_config?: Json | null
          is_live?: boolean | null
          views?: number | null
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        };
        Update: {
          id?: string
          user_id?: string
          snapshot_id?: string | null
          slug?: string
          title?: string
          landing_html?: string | null
          blueprint_content?: Json | null
          cta_config?: Json | null
          is_live?: boolean | null
          views?: number | null
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        };
        Relationships: [];
      };
      mission_challenges: {
        Row: {
          id: string
          focus_area_id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        };
        Insert: {
          id: string
          focus_area_id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        };
        Update: {
          id?: string
          focus_area_id?: string
          title?: string
          description?: string
          created_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      mission_focus_areas: {
        Row: {
          id: string
          pillar_id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        };
        Insert: {
          id: string
          pillar_id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        };
        Update: {
          id?: string
          pillar_id?: string
          title?: string
          description?: string
          created_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      mission_outcomes: {
        Row: {
          id: string
          challenge_id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        };
        Insert: {
          id: string
          challenge_id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        };
        Update: {
          id?: string
          challenge_id?: string
          title?: string
          description?: string
          created_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      mission_participants: {
        Row: {
          id: string
          user_id: string
          mission_id: string
          mission_title: string
          outcome_id: string | null
          challenge_id: string | null
          focus_area_id: string | null
          pillar_id: string | null
          email: string
          first_name: string | null
          intro_text: string | null
          share_consent: boolean
          wants_to_lead: boolean
          wants_to_integrate: boolean
          notify_level: string
          email_frequency: string
          created_at: string
          notified_at: string | null
        };
        Insert: {
          id?: string
          user_id: string
          mission_id: string
          mission_title: string
          outcome_id?: string | null
          challenge_id?: string | null
          focus_area_id?: string | null
          pillar_id?: string | null
          email: string
          first_name?: string | null
          intro_text?: string | null
          share_consent: boolean
          wants_to_lead: boolean
          wants_to_integrate: boolean
          notify_level: string
          email_frequency: string
          created_at: string
          notified_at?: string | null
        };
        Update: {
          id?: string
          user_id?: string
          mission_id?: string
          mission_title?: string
          outcome_id?: string | null
          challenge_id?: string | null
          focus_area_id?: string | null
          pillar_id?: string | null
          email?: string
          first_name?: string | null
          intro_text?: string | null
          share_consent?: boolean
          wants_to_lead?: boolean
          wants_to_integrate?: boolean
          notify_level?: string
          email_frequency?: string
          created_at?: string
          notified_at?: string | null
        };
        Relationships: [];
      };
      mission_participants_public: {
        Row: {
          id: string | null
          user_id: string | null
          mission_id: string | null
          mission_title: string | null
          outcome_id: string | null
          challenge_id: string | null
          focus_area_id: string | null
          pillar_id: string | null
          first_name: string | null
          intro_text: string | null
          share_consent: boolean | null
          wants_to_lead: boolean | null
          wants_to_integrate: boolean | null
          notify_level: string | null
          email_frequency: string | null
          created_at: string | null
          notified_at: string | null
        };
        Insert: {
          id?: string | null
          user_id?: string | null
          mission_id?: string | null
          mission_title?: string | null
          outcome_id?: string | null
          challenge_id?: string | null
          focus_area_id?: string | null
          pillar_id?: string | null
          first_name?: string | null
          intro_text?: string | null
          share_consent?: boolean | null
          wants_to_lead?: boolean | null
          wants_to_integrate?: boolean | null
          notify_level?: string | null
          email_frequency?: string | null
          created_at?: string | null
          notified_at?: string | null
        };
        Update: {
          id?: string | null
          user_id?: string | null
          mission_id?: string | null
          mission_title?: string | null
          outcome_id?: string | null
          challenge_id?: string | null
          focus_area_id?: string | null
          pillar_id?: string | null
          first_name?: string | null
          intro_text?: string | null
          share_consent?: boolean | null
          wants_to_lead?: boolean | null
          wants_to_integrate?: boolean | null
          notify_level?: string | null
          email_frequency?: string | null
          created_at?: string | null
          notified_at?: string | null
        };
        Relationships: [];
      };
      mission_pillars: {
        Row: {
          id: string
          title: string
          description: string
          icon: string | null
          color: string | null
          created_at: string
          updated_at: string
        };
        Insert: {
          id: string
          title: string
          description: string
          icon?: string | null
          color?: string | null
          created_at: string
          updated_at: string
        };
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      mission_search: {
        Row: {
          mission_id: string
          mission_title: string
          mission_statement: string
          outcome_id: string | null
          challenge_id: string | null
          focus_area_id: string | null
          pillar_id: string | null
          updated_at: string | null
          existing_projects: Json | null
        };
        Insert: {
          mission_id: string
          mission_title: string
          mission_statement: string
          outcome_id?: string | null
          challenge_id?: string | null
          focus_area_id?: string | null
          pillar_id?: string | null
          updated_at?: string | null
          existing_projects?: Json | null
        };
        Update: {
          mission_id?: string
          mission_title?: string
          mission_statement?: string
          outcome_id?: string | null
          challenge_id?: string | null
          focus_area_id?: string | null
          pillar_id?: string | null
          updated_at?: string | null
          existing_projects?: Json | null
        };
        Relationships: [];
      };
      missions: {
        Row: {
          id: string
          profile_id: string | null
          statement: string | null
          categories: string[] | null
          created_at: string | null
          updated_at: string | null
        };
        Insert: {
          id?: string
          profile_id?: string | null
          statement?: string | null
          categories?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        };
        Update: {
          id?: string
          profile_id?: string | null
          statement?: string | null
          categories?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        };
        Relationships: [];
      };
      multiple_intelligences_assessments: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          ranking: Json
        };
        Insert: {
          id?: string
          created_at: string
          name: string
          email: string
          ranking: Json
        };
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          ranking?: Json
        };
        Relationships: [];
      };
      multiple_intelligences_results: {
        Row: {
          id: string
          user_id: string
          ordered_intelligences: Json
          created_at: string | null
          updated_at: string | null
        };
        Insert: {
          id?: string
          user_id: string
          ordered_intelligences: Json
          created_at?: string | null
          updated_at?: string | null
        };
        Update: {
          id?: string
          user_id?: string
          ordered_intelligences?: Json
          created_at?: string | null
          updated_at?: string | null
        };
        Relationships: [];
      };
      nurture_email_queue: {
        Row: {
          id: string
          email: string
          profile_id: string | null
          email_type: string
          scheduled_for: string
          sent_at: string | null
          payload: Json
          status: string
          attempts: number
          last_error: string | null
          created_at: string
          updated_at: string
        };
        Insert: {
          id?: string
          email: string
          profile_id?: string | null
          email_type: string
          scheduled_for: string
          sent_at?: string | null
          payload: Json
          status: string
          attempts: number
          last_error?: string | null
          created_at: string
          updated_at: string
        };
        Update: {
          id?: string
          email?: string
          profile_id?: string | null
          email_type?: string
          scheduled_for?: string
          sent_at?: string | null
          payload?: Json
          status?: string
          attempts?: number
          last_error?: string | null
          created_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      nurture_opt_outs: {
        Row: {
          email: string
          opted_out_at: string
          reason: string | null
        };
        Insert: {
          email: string
          opted_out_at: string
          reason?: string | null
        };
        Update: {
          email?: string
          opted_out_at?: string
          reason?: string | null
        };
        Relationships: [];
      };
      player_upgrades: {
        Row: {
          id: string
          profile_id: string
          upgrade_id: string
          status: string
          completed_at: string | null
        };
        Insert: {
          id?: string
          profile_id: string
          upgrade_id: string
          status: string
          completed_at?: string | null
        };
        Update: {
          id?: string
          profile_id?: string
          upgrade_id?: string
          status?: string
          completed_at?: string | null
        };
        Relationships: [];
      };
      product_builder_snapshots: {
        Row: {
          id: string
          user_id: string
          deep_icp: Json | null
          deep_pain: Json | null
          deep_tp: Json | null
          landing_content: Json | null
          blueprint_content: Json | null
          cta_config: Json | null
          resonance_ratings: Json | null
          current_step: number | null
          is_complete: boolean | null
          created_at: string | null
          updated_at: string | null
        };
        Insert: {
          id?: string
          user_id: string
          deep_icp?: Json | null
          deep_pain?: Json | null
          deep_tp?: Json | null
          landing_content?: Json | null
          blueprint_content?: Json | null
          cta_config?: Json | null
          resonance_ratings?: Json | null
          current_step?: number | null
          is_complete?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        };
        Update: {
          id?: string
          user_id?: string
          deep_icp?: Json | null
          deep_pain?: Json | null
          deep_tp?: Json | null
          landing_content?: Json | null
          blueprint_content?: Json | null
          cta_config?: Json | null
          resonance_ratings?: Json | null
          current_step?: number | null
          is_complete?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        };
        Relationships: [];
      };
      qol_snapshots: {
        Row: {
          id: string
          profile_id: string | null
          created_at: string
          wealth_stage: number
          health_stage: number
          happiness_stage: number
          love_relationships_stage: number
          impact_stage: number
          growth_stage: number
          social_ties_stage: number
          home_stage: number
          xp_awarded: boolean
        };
        Insert: {
          id?: string
          profile_id?: string | null
          created_at: string
          wealth_stage: number
          health_stage: number
          happiness_stage: number
          love_relationships_stage: number
          impact_stage: number
          growth_stage: number
          social_ties_stage: number
          home_stage: number
          xp_awarded: boolean
        };
        Update: {
          id?: string
          profile_id?: string | null
          created_at?: string
          wealth_stage?: number
          health_stage?: number
          happiness_stage?: number
          love_relationships_stage?: number
          impact_stage?: number
          growth_stage?: number
          social_ties_stage?: number
          home_stage?: number
          xp_awarded?: boolean
        };
        Relationships: [];
      };
      quests: {
        Row: {
          id: string
          profile_id: string
          title: string
          practice_type: string | null
          path: string | null
          intention: string | null
          duration_minutes: number | null
          xp_awarded: number
          completed_at: string
        };
        Insert: {
          id?: string
          profile_id: string
          title: string
          practice_type?: string | null
          path?: string | null
          intention?: string | null
          duration_minutes?: number | null
          xp_awarded: number
          completed_at: string
        };
        Update: {
          id?: string
          profile_id?: string
          title?: string
          practice_type?: string | null
          path?: string | null
          intention?: string | null
          duration_minutes?: number | null
          xp_awarded?: number
          completed_at?: string
        };
        Relationships: [];
      };
      resonance_events: {
        Row: {
          id: string
          profile_id: string | null
          user_id: string | null
          client_session_id: string | null
          artifact_kind: string
          artifact_id: string | null
          rating: number
          tier: string
          message_seen: string | null
          matrix_source: string
          matrix_version: string | null
          context_json: Json | null
          created_at: string
        };
        Insert: {
          id?: string
          profile_id?: string | null
          user_id?: string | null
          client_session_id?: string | null
          artifact_kind: string
          artifact_id?: string | null
          rating: number
          tier: string
          message_seen?: string | null
          matrix_source: string
          matrix_version?: string | null
          context_json?: Json | null
          created_at: string
        };
        Update: {
          id?: string
          profile_id?: string | null
          user_id?: string | null
          client_session_id?: string | null
          artifact_kind?: string
          artifact_id?: string | null
          rating?: number
          tier?: string
          message_seen?: string | null
          matrix_source?: string
          matrix_version?: string | null
          context_json?: Json | null
          created_at?: string
        };
        Relationships: [];
      };
      suppressed_emails: {
        Row: {
          id: string
          email: string
          reason: string
          metadata: Json | null
          created_at: string
        };
        Insert: {
          id?: string
          email: string
          reason: string
          metadata?: Json | null
          created_at: string
        };
        Update: {
          id?: string
          email?: string
          reason?: string
          metadata?: Json | null
          created_at?: string
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string
          person_name: string
          title: string
          short_quote: string
          full_quote: string
          sort_order: number
          is_active: boolean
          surface: string
          created_at: string
          updated_at: string
        };
        Insert: {
          id?: string
          person_name: string
          title: string
          short_quote: string
          full_quote: string
          sort_order: number
          is_active: boolean
          surface: string
          created_at: string
          updated_at: string
        };
        Update: {
          id?: string
          person_name?: string
          title?: string
          short_quote?: string
          full_quote?: string
          sort_order?: number
          is_active?: boolean
          surface?: string
          created_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      unique_business_dossiers: {
        Row: {
          id: string
          user_id: string
          slug: string
          title: string
          artifact_snapshot: Json
          specificity_avg: number
          landing_page_version: string | null
          landing_page_rendered_html: string | null
          dossier_rendered_html: string | null
          is_live: boolean
          views: number
          published_at: string
          updated_at: string
        };
        Insert: {
          id?: string
          user_id: string
          slug: string
          title: string
          artifact_snapshot: Json
          specificity_avg: number
          landing_page_version?: string | null
          landing_page_rendered_html?: string | null
          dossier_rendered_html?: string | null
          is_live: boolean
          views: number
          published_at: string
          updated_at: string
        };
        Update: {
          id?: string
          user_id?: string
          slug?: string
          title?: string
          artifact_snapshot?: Json
          specificity_avg?: number
          landing_page_version?: string | null
          landing_page_rendered_html?: string | null
          dossier_rendered_html?: string | null
          is_live?: boolean
          views?: number
          published_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      upgrade_catalog: {
        Row: {
          id: string
          code: string
          title: string
          short_label: string
          description: string
          path_slug: string
          branch: string
          is_paid: boolean
          xp_reward: number
          sort_order: number
          created_at: string
        };
        Insert: {
          id?: string
          code: string
          title: string
          short_label: string
          description: string
          path_slug: string
          branch: string
          is_paid: boolean
          xp_reward: number
          sort_order: number
          created_at: string
        };
        Update: {
          id?: string
          code?: string
          title?: string
          short_label?: string
          description?: string
          path_slug?: string
          branch?: string
          is_paid?: boolean
          xp_reward?: number
          sort_order?: number
          created_at?: string
        };
        Relationships: [];
      };
      user_assets: {
        Row: {
          id: string
          user_id: string
          type_id: string
          sub_type_id: string | null
          category_id: string | null
          title: string
          description: string | null
          source: string | null
          created_at: string | null
          updated_at: string | null
        };
        Insert: {
          id?: string
          user_id: string
          type_id: string
          sub_type_id?: string | null
          category_id?: string | null
          title: string
          description?: string | null
          source?: string | null
          created_at?: string | null
          updated_at?: string | null
        };
        Update: {
          id?: string
          user_id?: string
          type_id?: string
          sub_type_id?: string | null
          category_id?: string | null
          title?: string
          description?: string | null
          source?: string | null
          created_at?: string | null
          updated_at?: string | null
        };
        Relationships: [];
      };
      user_business_artifacts: {
        Row: {
          id: string
          user_id: string
          artifact_key: string
          step_number: number
          content: string | null
          version: string
          precision_score: number | null
          created_at: string
          updated_at: string
          content_json: Json | null
          specificity_score: number | null
          parent_version_id: string | null
          roast_findings: Json | null
          what_changed: string | null
          is_locked: boolean
        };
        Insert: {
          id?: string
          user_id: string
          artifact_key: string
          step_number: number
          content?: string | null
          version: string
          precision_score?: number | null
          created_at: string
          updated_at: string
          content_json?: Json | null
          specificity_score?: number | null
          parent_version_id?: string | null
          roast_findings?: Json | null
          what_changed?: string | null
          is_locked: boolean
        };
        Update: {
          id?: string
          user_id?: string
          artifact_key?: string
          step_number?: number
          content?: string | null
          version?: string
          precision_score?: number | null
          created_at?: string
          updated_at?: string
          content_json?: Json | null
          specificity_score?: number | null
          parent_version_id?: string | null
          roast_findings?: Json | null
          what_changed?: string | null
          is_locked?: boolean
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'user'
          created_at: string
        };
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'user'
          created_at: string
        };
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'user'
          created_at?: string
        };
        Relationships: [];
      };
      vector_progress: {
        Row: {
          id: string
          profile_id: string
          vector: string
          step_index: number
          version: string
          draft_skipped_at: string | null
          created_at: string
          updated_at: string
        };
        Insert: {
          id?: string
          profile_id: string
          vector: string
          step_index: number
          version: string
          draft_skipped_at?: string | null
          created_at: string
          updated_at: string
        };
        Update: {
          id?: string
          profile_id?: string
          vector?: string
          step_index?: number
          version?: string
          draft_skipped_at?: string | null
          created_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      visibility_settings: {
        Row: {
          id: string
          user_id: string
          data_type: string
          visibility: string
          created_at: string
          updated_at: string
        };
        Insert: {
          id?: string
          user_id: string
          data_type: string
          visibility: string
          created_at: string
          updated_at: string
        };
        Update: {
          id?: string
          user_id?: string
          data_type?: string
          visibility?: string
          created_at?: string
          updated_at?: string
        };
        Relationships: [];
      };
      zog_snapshots: {
        Row: {
          id: string
          profile_id: string | null
          created_at: string
          archetype_title: string
          core_pattern: string
          top_three_talents: Json
          top_ten_talents: Json
          xp_awarded: boolean
          mastery_action: string | null
          appleseed_data: Json | null
          excalibur_data: Json | null
          appleseed_generated_at: string | null
          excalibur_generated_at: string | null
          ai_response_raw: string | null
          share_slug: string | null
          resonance_rating: number | null
        };
        Insert: {
          id?: string
          profile_id?: string | null
          created_at: string
          archetype_title: string
          core_pattern: string
          top_three_talents: Json
          top_ten_talents: Json
          xp_awarded: boolean
          mastery_action?: string | null
          appleseed_data?: Json | null
          excalibur_data?: Json | null
          appleseed_generated_at?: string | null
          excalibur_generated_at?: string | null
          ai_response_raw?: string | null
          share_slug?: string | null
          resonance_rating?: number | null
        };
        Update: {
          id?: string
          profile_id?: string | null
          created_at?: string
          archetype_title?: string
          core_pattern?: string
          top_three_talents?: Json
          top_ten_talents?: Json
          xp_awarded?: boolean
          mastery_action?: string | null
          appleseed_data?: Json | null
          excalibur_data?: Json | null
          appleseed_generated_at?: string | null
          excalibur_generated_at?: string | null
          ai_response_raw?: string | null
          share_slug?: string | null
          resonance_rating?: number | null
        };
        Relationships: [];
      };
    };
    Enums: {
      app_role: 'admin' | 'user';
      entitlement_tier: 'tasting' | 'builder' | 'locked_in' | 'gifted_builder' | 'gifted_locked_in' | 'founders_50' | 'ignition';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
    Functions: {
      eq_complete_task: {
        Args: { p_task_id: string };
        Returns: undefined;
      };
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

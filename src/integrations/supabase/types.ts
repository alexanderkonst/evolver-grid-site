export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      action_events: {
        Row: {
          action_id: string
          completed_at: string | null
          created_at: string
          duration: number | null
          id: string
          metadata: Json
          mode: string | null
          profile_id: string
          qol_domain: string | null
          selected_at: string | null
          source: string | null
          vector: string | null
        }
        Insert: {
          action_id: string
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          metadata?: Json
          mode?: string | null
          profile_id: string
          qol_domain?: string | null
          selected_at?: string | null
          source?: string | null
          vector?: string | null
        }
        Update: {
          action_id?: string
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          metadata?: Json
          mode?: string | null
          profile_id?: string
          qol_domain?: string | null
          selected_at?: string | null
          source?: string | null
          vector?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_boost_purchases: {
        Row: {
          created_at: string
          id: string
          source: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          source?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          source?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      anonymous_genius_rate_limits: {
        Row: {
          email_lower: string
          hit_count: number
          window_start: string
        }
        Insert: {
          email_lower: string
          hit_count?: number
          window_start: string
        }
        Update: {
          email_lower?: string
          hit_count?: number
          window_start?: string
        }
        Relationships: []
      }
      anonymous_genius_results: {
        Row: {
          assessment_version: string
          claimed_at: string | null
          claimed_user_id: string | null
          created_at: string
          email: string
          id: string
          result_payload: Json
          updated_at: string
        }
        Insert: {
          assessment_version?: string
          claimed_at?: string | null
          claimed_user_id?: string | null
          created_at?: string
          email: string
          id?: string
          result_payload: Json
          updated_at?: string
        }
        Update: {
          assessment_version?: string
          claimed_at?: string | null
          claimed_user_id?: string | null
          created_at?: string
          email?: string
          id?: string
          result_payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
      artifact_improvements: {
        Row: {
          accepted: boolean
          artifact_after_id: string | null
          artifact_before_id: string | null
          artifact_key: string
          created_at: string
          crystallized_action: string | null
          diminishing_returns: boolean
          id: string
          model_used: string
          roast_findings: Json
          specificity_after: number | null
          specificity_before: number | null
          specificity_delta: number | null
          user_id: string
          what_changed: string | null
        }
        Insert: {
          accepted: boolean
          artifact_after_id?: string | null
          artifact_before_id?: string | null
          artifact_key: string
          created_at?: string
          crystallized_action?: string | null
          diminishing_returns?: boolean
          id?: string
          model_used?: string
          roast_findings: Json
          specificity_after?: number | null
          specificity_before?: number | null
          specificity_delta?: number | null
          user_id: string
          what_changed?: string | null
        }
        Update: {
          accepted?: boolean
          artifact_after_id?: string | null
          artifact_before_id?: string | null
          artifact_key?: string
          created_at?: string
          crystallized_action?: string | null
          diminishing_returns?: boolean
          id?: string
          model_used?: string
          roast_findings?: Json
          specificity_after?: number | null
          specificity_before?: number | null
          specificity_delta?: number | null
          user_id?: string
          what_changed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artifact_improvements_artifact_after_id_fkey"
            columns: ["artifact_after_id"]
            isOneToOne: false
            referencedRelation: "user_business_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_improvements_artifact_before_id_fkey"
            columns: ["artifact_before_id"]
            isOneToOne: false
            referencedRelation: "user_business_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_snapshots: {
        Row: {
          artifact_status: Json | null
          created_at: string | null
          facilitator: string | null
          id: string
          lead_magnet: Json | null
          myth: Json | null
          notes: string | null
          pain: Json | null
          profile_id: string | null
          promise: Json | null
          session_date: string | null
          session_number: number | null
          tagline: string | null
          tribe: Json | null
          uniqueness: Json | null
          updated_at: string | null
          user_id: string | null
          value_ladder: Json | null
          version: string | null
        }
        Insert: {
          artifact_status?: Json | null
          created_at?: string | null
          facilitator?: string | null
          id?: string
          lead_magnet?: Json | null
          myth?: Json | null
          notes?: string | null
          pain?: Json | null
          profile_id?: string | null
          promise?: Json | null
          session_date?: string | null
          session_number?: number | null
          tagline?: string | null
          tribe?: Json | null
          uniqueness?: Json | null
          updated_at?: string | null
          user_id?: string | null
          value_ladder?: Json | null
          version?: string | null
        }
        Update: {
          artifact_status?: Json | null
          created_at?: string | null
          facilitator?: string | null
          id?: string
          lead_magnet?: Json | null
          myth?: Json | null
          notes?: string | null
          pain?: Json | null
          profile_id?: string | null
          promise?: Json | null
          session_date?: string | null
          session_number?: number | null
          tagline?: string | null
          tribe?: Json | null
          uniqueness?: Json | null
          updated_at?: string | null
          user_id?: string | null
          value_ladder?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canvas_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          receiver_id: string
          requester_id: string
          responded_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          receiver_id: string
          requester_id: string
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          receiver_id?: string
          requester_id?: string
          responded_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      entitlement_cron_log: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          id: string
          ran_at: string
          reverted_count: number
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          ran_at?: string
          reverted_count?: number
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          ran_at?: string
          reverted_count?: number
        }
        Relationships: []
      }
      entitlement_grants: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          new_tier: Database["public"]["Enums"]["entitlement_tier"]
          note: string | null
          previous_tier: Database["public"]["Enums"]["entitlement_tier"] | null
          profile_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          new_tier: Database["public"]["Enums"]["entitlement_tier"]
          note?: string | null
          previous_tier?: Database["public"]["Enums"]["entitlement_tier"] | null
          profile_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          new_tier?: Database["public"]["Enums"]["entitlement_tier"]
          note?: string | null
          previous_tier?: Database["public"]["Enums"]["entitlement_tier"] | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlement_grants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equilibrium_focus: {
        Row: {
          position: number
          promoted_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          position: number
          promoted_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          position?: number
          promoted_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equilibrium_focus_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "equilibrium_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      equilibrium_state: {
        Row: {
          last_synthesis_at: string | null
          last_synthesis_text: string | null
          mission_override_text: string | null
          moon_focus_text: string | null
          role_override_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          last_synthesis_at?: string | null
          last_synthesis_text?: string | null
          mission_override_text?: string | null
          moon_focus_text?: string | null
          role_override_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          last_synthesis_at?: string | null
          last_synthesis_text?: string | null
          mission_override_text?: string | null
          moon_focus_text?: string | null
          role_override_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      equilibrium_strategies: {
        Row: {
          position: number
          set_at: string
          text: string
          user_id: string
        }
        Insert: {
          position: number
          set_at?: string
          text: string
          user_id: string
        }
        Update: {
          position?: number
          set_at?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      equilibrium_synthesis_log: {
        Row: {
          cycle_snapshot_json: Json
          generated_at: string
          id: string
          reading_text: string
          user_id: string
        }
        Insert: {
          cycle_snapshot_json: Json
          generated_at?: string
          id?: string
          reading_text: string
          user_id: string
        }
        Update: {
          cycle_snapshot_json?: Json
          generated_at?: string
          id?: string
          reading_text?: string
          user_id?: string
        }
        Relationships: []
      }
      equilibrium_tasks: {
        Row: {
          created_at: string
          do_now_at: string | null
          done_at: string | null
          id: string
          position: number
          status: string
          text: string
          workstream_id: string
        }
        Insert: {
          created_at?: string
          do_now_at?: string | null
          done_at?: string | null
          id?: string
          position: number
          status?: string
          text: string
          workstream_id: string
        }
        Update: {
          created_at?: string
          do_now_at?: string | null
          done_at?: string | null
          id?: string
          position?: number
          status?: string
          text?: string
          workstream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equilibrium_tasks_workstream_id_fkey"
            columns: ["workstream_id"]
            isOneToOne: false
            referencedRelation: "equilibrium_workstreams"
            referencedColumns: ["id"]
          },
        ]
      }
      equilibrium_users: {
        Row: {
          birthday: string
          chat_id: number
          created_at: string
          id: string
          timezone: number | null
        }
        Insert: {
          birthday: string
          chat_id: number
          created_at?: string
          id?: string
          timezone?: number | null
        }
        Update: {
          birthday?: string
          chat_id?: number
          created_at?: string
          id?: string
          timezone?: number | null
        }
        Relationships: []
      }
      equilibrium_workstreams: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          position: number
          title: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          position: number
          title: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          position?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string | null
          email: string | null
          event_id: string | null
          id: string
          status: string | null
          user_id: string | null
          wants_reminder: boolean | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          wants_reminder?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          wants_reminder?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          community_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string
          id: string
          location: string | null
          photo_url: string | null
          timezone: string | null
          title: string
          visibility: string | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time: string
          id?: string
          location?: string | null
          photo_url?: string | null
          timezone?: string | null
          title: string
          visibility?: string | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string
          id?: string
          location?: string | null
          photo_url?: string | null
          timezone?: string | null
          title?: string
          visibility?: string | null
        }
        Relationships: []
      }
      first_time_actions: {
        Row: {
          action_id: string
          completed_at: string
          id: string
          profile_id: string
          xp_bonus_awarded: number
        }
        Insert: {
          action_id: string
          completed_at?: string
          id?: string
          profile_id: string
          xp_bonus_awarded?: number
        }
        Update: {
          action_id?: string
          completed_at?: string
          id?: string
          profile_id?: string
          xp_bonus_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "first_time_actions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_canvases: {
        Row: {
          archetype: string
          color_bg: string
          color_border: string
          color_glow: string
          color_primary: string
          consent_given: boolean
          created_at: string
          id: string
          is_active: boolean
          myth_lie: string
          myth_line: string
          myth_truth: string
          name: string
          pain: string
          promise: string
          session_date: string
          session_number: string
          sigil: string
          sort_order: number
          status: string
          tagline: string
          tribe: string
          uniqueness: string
          updated_at: string
        }
        Insert: {
          archetype: string
          color_bg?: string
          color_border?: string
          color_glow?: string
          color_primary?: string
          consent_given?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          myth_lie: string
          myth_line: string
          myth_truth: string
          name: string
          pain: string
          promise: string
          session_date: string
          session_number: string
          sigil?: string
          sort_order?: number
          status?: string
          tagline: string
          tribe: string
          uniqueness: string
          updated_at?: string
        }
        Update: {
          archetype?: string
          color_bg?: string
          color_border?: string
          color_glow?: string
          color_primary?: string
          consent_given?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          myth_lie?: string
          myth_line?: string
          myth_truth?: string
          name?: string
          pain?: string
          promise?: string
          session_date?: string
          session_number?: string
          sigil?: string
          sort_order?: number
          status?: string
          tagline?: string
          tribe?: string
          uniqueness?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_profiles: {
        Row: {
          access_token: string | null
          ai_upgrade_access: boolean | null
          avatar_url: string | null
          created_at: string
          current_streak_days: number
          email: string | null
          entitlement_expires_at: string | null
          entitlement_granted_at: string | null
          entitlement_granted_by: string | null
          entitlement_note: string | null
          entitlement_tier: Database["public"]["Enums"]["entitlement_tier"]
          first_name: string | null
          first_time_actions: Json | null
          genius_stage: string | null
          id: string
          last_canvas_snapshot_id: string | null
          last_name: string | null
          last_practice_at: string | null
          last_qol_snapshot_id: string | null
          last_quest_completed_at: string | null
          last_quest_title: string | null
          last_zog_snapshot_id: string | null
          level: number
          linkedin_extracted_at: string | null
          linkedin_pdf_url: string | null
          location: string | null
          longest_streak_days: number
          main_quest_progress: Json | null
          main_quest_stage: string
          main_quest_status: string
          main_quest_updated_at: string
          mission_discovered_at: string | null
          mission_id: string | null
          multiple_intelligences_completed: boolean | null
          onboarding_completed: boolean
          onboarding_stage: string | null
          onboarding_step: number
          personality_tests: Json | null
          practice_count: number
          qol_priorities: Json | null
          qol_priority_order: Json | null
          resources_mapped_at: string | null
          show_location: boolean | null
          show_mission: boolean | null
          show_offer: boolean | null
          spoken_languages: string[] | null
          total_quests_completed: number
          updated_at: string
          user_id: string | null
          username: string | null
          visibility: string | null
          xp_body: number
          xp_emotions: number
          xp_mind: number
          xp_spirit: number
          xp_total: number
          xp_uniqueness: number
          zog_profile_read_at: string | null
          zone_of_genius_completed: boolean | null
        }
        Insert: {
          access_token?: string | null
          ai_upgrade_access?: boolean | null
          avatar_url?: string | null
          created_at?: string
          current_streak_days?: number
          email?: string | null
          entitlement_expires_at?: string | null
          entitlement_granted_at?: string | null
          entitlement_granted_by?: string | null
          entitlement_note?: string | null
          entitlement_tier?: Database["public"]["Enums"]["entitlement_tier"]
          first_name?: string | null
          first_time_actions?: Json | null
          genius_stage?: string | null
          id?: string
          last_canvas_snapshot_id?: string | null
          last_name?: string | null
          last_practice_at?: string | null
          last_qol_snapshot_id?: string | null
          last_quest_completed_at?: string | null
          last_quest_title?: string | null
          last_zog_snapshot_id?: string | null
          level?: number
          linkedin_extracted_at?: string | null
          linkedin_pdf_url?: string | null
          location?: string | null
          longest_streak_days?: number
          main_quest_progress?: Json | null
          main_quest_stage?: string
          main_quest_status?: string
          main_quest_updated_at?: string
          mission_discovered_at?: string | null
          mission_id?: string | null
          multiple_intelligences_completed?: boolean | null
          onboarding_completed?: boolean
          onboarding_stage?: string | null
          onboarding_step?: number
          personality_tests?: Json | null
          practice_count?: number
          qol_priorities?: Json | null
          qol_priority_order?: Json | null
          resources_mapped_at?: string | null
          show_location?: boolean | null
          show_mission?: boolean | null
          show_offer?: boolean | null
          spoken_languages?: string[] | null
          total_quests_completed?: number
          updated_at?: string
          user_id?: string | null
          username?: string | null
          visibility?: string | null
          xp_body?: number
          xp_emotions?: number
          xp_mind?: number
          xp_spirit?: number
          xp_total?: number
          xp_uniqueness?: number
          zog_profile_read_at?: string | null
          zone_of_genius_completed?: boolean | null
        }
        Update: {
          access_token?: string | null
          ai_upgrade_access?: boolean | null
          avatar_url?: string | null
          created_at?: string
          current_streak_days?: number
          email?: string | null
          entitlement_expires_at?: string | null
          entitlement_granted_at?: string | null
          entitlement_granted_by?: string | null
          entitlement_note?: string | null
          entitlement_tier?: Database["public"]["Enums"]["entitlement_tier"]
          first_name?: string | null
          first_time_actions?: Json | null
          genius_stage?: string | null
          id?: string
          last_canvas_snapshot_id?: string | null
          last_name?: string | null
          last_practice_at?: string | null
          last_qol_snapshot_id?: string | null
          last_quest_completed_at?: string | null
          last_quest_title?: string | null
          last_zog_snapshot_id?: string | null
          level?: number
          linkedin_extracted_at?: string | null
          linkedin_pdf_url?: string | null
          location?: string | null
          longest_streak_days?: number
          main_quest_progress?: Json | null
          main_quest_stage?: string
          main_quest_status?: string
          main_quest_updated_at?: string
          mission_discovered_at?: string | null
          mission_id?: string | null
          multiple_intelligences_completed?: boolean | null
          onboarding_completed?: boolean
          onboarding_stage?: string | null
          onboarding_step?: number
          personality_tests?: Json | null
          practice_count?: number
          qol_priorities?: Json | null
          qol_priority_order?: Json | null
          resources_mapped_at?: string | null
          show_location?: boolean | null
          show_mission?: boolean | null
          show_offer?: boolean | null
          spoken_languages?: string[] | null
          total_quests_completed?: number
          updated_at?: string
          user_id?: string | null
          username?: string | null
          visibility?: string | null
          xp_body?: number
          xp_emotions?: number
          xp_mind?: number
          xp_spirit?: number
          xp_total?: number
          xp_uniqueness?: number
          zog_profile_read_at?: string | null
          zone_of_genius_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_last_qol_snapshot"
            columns: ["last_qol_snapshot_id"]
            isOneToOne: false
            referencedRelation: "qol_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_last_zog_snapshot"
            columns: ["last_zog_snapshot_id"]
            isOneToOne: false
            referencedRelation: "zog_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_profiles_last_canvas_snapshot_id_fkey"
            columns: ["last_canvas_snapshot_id"]
            isOneToOne: false
            referencedRelation: "canvas_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_profiles_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      genius_offer_requests: {
        Row: {
          ai_summary_raw: string | null
          best_client_story: string | null
          best_clients: string | null
          created_at: string
          email: string
          extra_notes: string | null
          has_ai_assistant: boolean
          id: string
          intelligences_note: string | null
          name: string
          no_ai_genius_description: string | null
          offers_sold: string | null
          pdf_url: string | null
          products_sold: string | null
          source_branch: string | null
          status: string
          summary_promise: string | null
          summary_title: string | null
          user_id: string | null
        }
        Insert: {
          ai_summary_raw?: string | null
          best_client_story?: string | null
          best_clients?: string | null
          created_at?: string
          email: string
          extra_notes?: string | null
          has_ai_assistant: boolean
          id?: string
          intelligences_note?: string | null
          name: string
          no_ai_genius_description?: string | null
          offers_sold?: string | null
          pdf_url?: string | null
          products_sold?: string | null
          source_branch?: string | null
          status?: string
          summary_promise?: string | null
          summary_title?: string | null
          user_id?: string | null
        }
        Update: {
          ai_summary_raw?: string | null
          best_client_story?: string | null
          best_clients?: string | null
          created_at?: string
          email?: string
          extra_notes?: string | null
          has_ai_assistant?: boolean
          id?: string
          intelligences_note?: string | null
          name?: string
          no_ai_genius_description?: string | null
          offers_sold?: string | null
          pdf_url?: string | null
          products_sold?: string | null
          source_branch?: string | null
          status?: string
          summary_promise?: string | null
          summary_title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      genius_offer_wizard_progress: {
        Row: {
          ai_knows_offers: boolean | null
          ai_summary: string | null
          best_clients: string | null
          created_at: string | null
          current_step: number | null
          email: string | null
          has_ai_assistant: boolean | null
          id: string
          multiple_intelligences_completed: boolean | null
          name: string | null
          products_sold: string | null
          updated_at: string | null
          user_id: string
          zone_of_genius_completed: boolean | null
        }
        Insert: {
          ai_knows_offers?: boolean | null
          ai_summary?: string | null
          best_clients?: string | null
          created_at?: string | null
          current_step?: number | null
          email?: string | null
          has_ai_assistant?: boolean | null
          id?: string
          multiple_intelligences_completed?: boolean | null
          name?: string | null
          products_sold?: string | null
          updated_at?: string | null
          user_id: string
          zone_of_genius_completed?: boolean | null
        }
        Update: {
          ai_knows_offers?: boolean | null
          ai_summary?: string | null
          best_clients?: string | null
          created_at?: string | null
          current_step?: number | null
          email?: string | null
          has_ai_assistant?: boolean | null
          id?: string
          multiple_intelligences_completed?: boolean | null
          name?: string | null
          products_sold?: string | null
          updated_at?: string | null
          user_id?: string
          zone_of_genius_completed?: boolean | null
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          blueprint_content: Json | null
          created_at: string | null
          cta_config: Json | null
          id: string
          is_live: boolean | null
          landing_html: string | null
          published_at: string | null
          slug: string
          snapshot_id: string | null
          title: string
          updated_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          blueprint_content?: Json | null
          created_at?: string | null
          cta_config?: Json | null
          id?: string
          is_live?: boolean | null
          landing_html?: string | null
          published_at?: string | null
          slug: string
          snapshot_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          blueprint_content?: Json | null
          created_at?: string | null
          cta_config?: Json | null
          id?: string
          is_live?: boolean | null
          landing_html?: string | null
          published_at?: string | null
          slug?: string
          snapshot_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "product_builder_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_challenges: {
        Row: {
          created_at: string
          description: string
          focus_area_id: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          focus_area_id: string
          id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          focus_area_id?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_challenges_focus_area_id_fkey"
            columns: ["focus_area_id"]
            isOneToOne: false
            referencedRelation: "mission_focus_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_focus_areas: {
        Row: {
          created_at: string
          description: string
          id: string
          pillar_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
          pillar_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          pillar_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_focus_areas_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "mission_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_outcomes: {
        Row: {
          challenge_id: string
          created_at: string
          description: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          description: string
          id: string
          title: string
          updated_at?: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          description?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_outcomes_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "mission_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_participants: {
        Row: {
          challenge_id: string | null
          created_at: string
          email: string
          email_frequency: string
          first_name: string | null
          focus_area_id: string | null
          id: string
          intro_text: string | null
          mission_id: string
          mission_title: string
          notified_at: string | null
          notify_level: string
          outcome_id: string | null
          pillar_id: string | null
          share_consent: boolean
          user_id: string
          wants_to_integrate: boolean
          wants_to_lead: boolean
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string
          email: string
          email_frequency?: string
          first_name?: string | null
          focus_area_id?: string | null
          id?: string
          intro_text?: string | null
          mission_id: string
          mission_title: string
          notified_at?: string | null
          notify_level?: string
          outcome_id?: string | null
          pillar_id?: string | null
          share_consent?: boolean
          user_id: string
          wants_to_integrate?: boolean
          wants_to_lead?: boolean
        }
        Update: {
          challenge_id?: string | null
          created_at?: string
          email?: string
          email_frequency?: string
          first_name?: string | null
          focus_area_id?: string | null
          id?: string
          intro_text?: string | null
          mission_id?: string
          mission_title?: string
          notified_at?: string | null
          notify_level?: string
          outcome_id?: string | null
          pillar_id?: string | null
          share_consent?: boolean
          user_id?: string
          wants_to_integrate?: boolean
          wants_to_lead?: boolean
        }
        Relationships: []
      }
      mission_pillars: {
        Row: {
          color: string | null
          created_at: string
          description: string
          icon: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description: string
          icon?: string | null
          id: string
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mission_search: {
        Row: {
          challenge_id: string | null
          existing_projects: Json | null
          focus_area_id: string | null
          mission_id: string
          mission_statement: string
          mission_title: string
          outcome_id: string | null
          pillar_id: string | null
          updated_at: string | null
        }
        Insert: {
          challenge_id?: string | null
          existing_projects?: Json | null
          focus_area_id?: string | null
          mission_id: string
          mission_statement: string
          mission_title: string
          outcome_id?: string | null
          pillar_id?: string | null
          updated_at?: string | null
        }
        Update: {
          challenge_id?: string | null
          existing_projects?: Json | null
          focus_area_id?: string | null
          mission_id?: string
          mission_statement?: string
          mission_title?: string
          outcome_id?: string | null
          pillar_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mission_search_challenge"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "mission_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mission_search_focus_area"
            columns: ["focus_area_id"]
            isOneToOne: false
            referencedRelation: "mission_focus_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mission_search_outcome"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "mission_outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mission_search_pillar"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "mission_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          categories: string[] | null
          created_at: string | null
          id: string
          profile_id: string | null
          statement: string | null
          updated_at: string | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          statement?: string | null
          updated_at?: string | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          statement?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      multiple_intelligences_assessments: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          ranking: Json
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          ranking: Json
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          ranking?: Json
        }
        Relationships: []
      }
      multiple_intelligences_results: {
        Row: {
          created_at: string | null
          id: string
          ordered_intelligences: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ordered_intelligences: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ordered_intelligences?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nurture_email_queue: {
        Row: {
          attempts: number
          created_at: string
          email: string
          email_type: string
          id: string
          last_error: string | null
          payload: Json
          profile_id: string | null
          scheduled_for: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          email: string
          email_type: string
          id?: string
          last_error?: string | null
          payload?: Json
          profile_id?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          email?: string
          email_type?: string
          id?: string
          last_error?: string | null
          payload?: Json
          profile_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nurture_email_queue_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nurture_opt_outs: {
        Row: {
          email: string
          opted_out_at: string
          reason: string | null
        }
        Insert: {
          email: string
          opted_out_at?: string
          reason?: string | null
        }
        Update: {
          email?: string
          opted_out_at?: string
          reason?: string | null
        }
        Relationships: []
      }
      player_upgrades: {
        Row: {
          completed_at: string | null
          id: string
          profile_id: string
          status: string
          upgrade_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          profile_id: string
          status?: string
          upgrade_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          profile_id?: string
          status?: string
          upgrade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_upgrades_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_upgrades_upgrade_id_fkey"
            columns: ["upgrade_id"]
            isOneToOne: false
            referencedRelation: "upgrade_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      product_builder_snapshots: {
        Row: {
          blueprint_content: Json | null
          created_at: string | null
          cta_config: Json | null
          current_step: number | null
          deep_icp: Json | null
          deep_pain: Json | null
          deep_tp: Json | null
          id: string
          is_complete: boolean | null
          landing_content: Json | null
          resonance_ratings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blueprint_content?: Json | null
          created_at?: string | null
          cta_config?: Json | null
          current_step?: number | null
          deep_icp?: Json | null
          deep_pain?: Json | null
          deep_tp?: Json | null
          id?: string
          is_complete?: boolean | null
          landing_content?: Json | null
          resonance_ratings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blueprint_content?: Json | null
          created_at?: string | null
          cta_config?: Json | null
          current_step?: number | null
          deep_icp?: Json | null
          deep_pain?: Json | null
          deep_tp?: Json | null
          id?: string
          is_complete?: boolean | null
          landing_content?: Json | null
          resonance_ratings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      qol_snapshots: {
        Row: {
          created_at: string
          growth_stage: number
          happiness_stage: number
          health_stage: number
          home_stage: number
          id: string
          impact_stage: number
          love_relationships_stage: number
          profile_id: string | null
          social_ties_stage: number
          wealth_stage: number
          xp_awarded: boolean
        }
        Insert: {
          created_at?: string
          growth_stage: number
          happiness_stage: number
          health_stage: number
          home_stage: number
          id?: string
          impact_stage: number
          love_relationships_stage: number
          profile_id?: string | null
          social_ties_stage: number
          wealth_stage: number
          xp_awarded?: boolean
        }
        Update: {
          created_at?: string
          growth_stage?: number
          happiness_stage?: number
          health_stage?: number
          home_stage?: number
          id?: string
          impact_stage?: number
          love_relationships_stage?: number
          profile_id?: string | null
          social_ties_stage?: number
          wealth_stage?: number
          xp_awarded?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          completed_at: string
          duration_minutes: number | null
          id: string
          intention: string | null
          path: string | null
          practice_type: string | null
          profile_id: string
          title: string
          xp_awarded: number
        }
        Insert: {
          completed_at?: string
          duration_minutes?: number | null
          id?: string
          intention?: string | null
          path?: string | null
          practice_type?: string | null
          profile_id: string
          title: string
          xp_awarded?: number
        }
        Update: {
          completed_at?: string
          duration_minutes?: number | null
          id?: string
          intention?: string | null
          path?: string | null
          practice_type?: string | null
          profile_id?: string
          title?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "quests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resonance_events: {
        Row: {
          artifact_id: string | null
          artifact_kind: string
          client_session_id: string | null
          context_json: Json | null
          created_at: string
          id: string
          matrix_source: string
          matrix_version: string | null
          message_seen: string | null
          profile_id: string | null
          rating: number
          tier: string
          user_id: string | null
        }
        Insert: {
          artifact_id?: string | null
          artifact_kind: string
          client_session_id?: string | null
          context_json?: Json | null
          created_at?: string
          id?: string
          matrix_source?: string
          matrix_version?: string | null
          message_seen?: string | null
          profile_id?: string | null
          rating: number
          tier: string
          user_id?: string | null
        }
        Update: {
          artifact_id?: string | null
          artifact_kind?: string
          client_session_id?: string | null
          context_json?: Json | null
          created_at?: string
          id?: string
          matrix_source?: string
          matrix_version?: string | null
          message_seen?: string | null
          profile_id?: string | null
          rating?: number
          tier?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          full_quote: string
          id: string
          is_active: boolean
          person_name: string
          short_quote: string
          sort_order: number
          surface: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_quote: string
          id?: string
          is_active?: boolean
          person_name: string
          short_quote: string
          sort_order?: number
          surface?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_quote?: string
          id?: string
          is_active?: boolean
          person_name?: string
          short_quote?: string
          sort_order?: number
          surface?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      unique_business_dossiers: {
        Row: {
          artifact_snapshot: Json
          dossier_rendered_html: string | null
          id: string
          is_live: boolean
          landing_page_rendered_html: string | null
          landing_page_version: string | null
          published_at: string
          slug: string
          specificity_avg: number
          title: string
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          artifact_snapshot: Json
          dossier_rendered_html?: string | null
          id?: string
          is_live?: boolean
          landing_page_rendered_html?: string | null
          landing_page_version?: string | null
          published_at?: string
          slug: string
          specificity_avg: number
          title: string
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          artifact_snapshot?: Json
          dossier_rendered_html?: string | null
          id?: string
          is_live?: boolean
          landing_page_rendered_html?: string | null
          landing_page_version?: string | null
          published_at?: string
          slug?: string
          specificity_avg?: number
          title?: string
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      upgrade_catalog: {
        Row: {
          branch: string
          code: string
          created_at: string
          description: string
          id: string
          is_paid: boolean
          path_slug: string
          short_label: string
          sort_order: number
          title: string
          xp_reward: number
        }
        Insert: {
          branch: string
          code: string
          created_at?: string
          description: string
          id?: string
          is_paid?: boolean
          path_slug: string
          short_label: string
          sort_order?: number
          title: string
          xp_reward?: number
        }
        Update: {
          branch?: string
          code?: string
          created_at?: string
          description?: string
          id?: string
          is_paid?: boolean
          path_slug?: string
          short_label?: string
          sort_order?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      user_assets: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          source: string | null
          sub_type_id: string | null
          title: string
          type_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          source?: string | null
          sub_type_id?: string | null
          title: string
          type_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          source?: string | null
          sub_type_id?: string | null
          title?: string
          type_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_business_artifacts: {
        Row: {
          artifact_key: string
          content: string | null
          content_json: Json | null
          created_at: string
          id: string
          is_locked: boolean
          parent_version_id: string | null
          precision_score: number | null
          roast_findings: Json | null
          specificity_score: number | null
          step_number: number
          updated_at: string
          user_id: string
          version: string
          what_changed: string | null
        }
        Insert: {
          artifact_key: string
          content?: string | null
          content_json?: Json | null
          created_at?: string
          id?: string
          is_locked?: boolean
          parent_version_id?: string | null
          precision_score?: number | null
          roast_findings?: Json | null
          specificity_score?: number | null
          step_number: number
          updated_at?: string
          user_id: string
          version?: string
          what_changed?: string | null
        }
        Update: {
          artifact_key?: string
          content?: string | null
          content_json?: Json | null
          created_at?: string
          id?: string
          is_locked?: boolean
          parent_version_id?: string | null
          precision_score?: number | null
          roast_findings?: Json | null
          specificity_score?: number | null
          step_number?: number
          updated_at?: string
          user_id?: string
          version?: string
          what_changed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_business_artifacts_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "user_business_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vector_progress: {
        Row: {
          created_at: string
          draft_skipped_at: string | null
          id: string
          profile_id: string
          step_index: number
          updated_at: string
          vector: string
          version: string
        }
        Insert: {
          created_at?: string
          draft_skipped_at?: string | null
          id?: string
          profile_id: string
          step_index?: number
          updated_at?: string
          vector: string
          version?: string
        }
        Update: {
          created_at?: string
          draft_skipped_at?: string | null
          id?: string
          profile_id?: string
          step_index?: number
          updated_at?: string
          vector?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_settings: {
        Row: {
          created_at: string
          data_type: string
          id: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          data_type: string
          id?: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          data_type?: string
          id?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      zog_snapshots: {
        Row: {
          ai_response_raw: string | null
          appleseed_data: Json | null
          appleseed_generated_at: string | null
          archetype_title: string
          core_pattern: string
          created_at: string
          excalibur_data: Json | null
          excalibur_generated_at: string | null
          id: string
          mastery_action: string | null
          profile_id: string | null
          resonance_rating: number | null
          share_slug: string | null
          top_ten_talents: Json
          top_three_talents: Json
          xp_awarded: boolean
        }
        Insert: {
          ai_response_raw?: string | null
          appleseed_data?: Json | null
          appleseed_generated_at?: string | null
          archetype_title: string
          core_pattern: string
          created_at?: string
          excalibur_data?: Json | null
          excalibur_generated_at?: string | null
          id?: string
          mastery_action?: string | null
          profile_id?: string | null
          resonance_rating?: number | null
          share_slug?: string | null
          top_ten_talents: Json
          top_three_talents: Json
          xp_awarded?: boolean
        }
        Update: {
          ai_response_raw?: string | null
          appleseed_data?: Json | null
          appleseed_generated_at?: string | null
          archetype_title?: string
          core_pattern?: string
          created_at?: string
          excalibur_data?: Json | null
          excalibur_generated_at?: string | null
          id?: string
          mastery_action?: string | null
          profile_id?: string | null
          resonance_rating?: number | null
          share_slug?: string | null
          top_ten_talents?: Json
          top_three_talents?: Json
          xp_awarded?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "game_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      founder_state_v1: {
        Row: {
          current_step: number | null
          days_to_first_paid: number | null
          display_name: string | null
          email: string | null
          has_build: boolean | null
          has_ignition: boolean | null
          has_paid: boolean | null
          has_top_talent: boolean | null
          joined_at: string | null
          last_touch_at: string | null
          latest_qol_snapshot_at: string | null
          latest_zog_snapshot_at: string | null
          latest_zog_top_talent: string | null
          nurture_status: string | null
          onboarding_stage: string | null
          revenue_total_usd: number | null
          slug: string | null
          top_talent_resonance: number | null
          user_id: string | null
        }
        Relationships: []
      }
      mission_participants_public: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          email_frequency: string | null
          first_name: string | null
          focus_area_id: string | null
          id: string | null
          intro_text: string | null
          mission_id: string | null
          mission_title: string | null
          notified_at: string | null
          notify_level: string | null
          outcome_id: string | null
          pillar_id: string | null
          share_consent: boolean | null
          user_id: string | null
          wants_to_integrate: boolean | null
          wants_to_lead: boolean | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          email_frequency?: string | null
          first_name?: string | null
          focus_area_id?: string | null
          id?: string | null
          intro_text?: string | null
          mission_id?: string | null
          mission_title?: string | null
          notified_at?: string | null
          notify_level?: string | null
          outcome_id?: string | null
          pillar_id?: string | null
          share_consent?: boolean | null
          user_id?: string | null
          wants_to_integrate?: boolean | null
          wants_to_lead?: boolean | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          email_frequency?: string | null
          first_name?: string | null
          focus_area_id?: string | null
          id?: string | null
          intro_text?: string | null
          mission_id?: string | null
          mission_title?: string | null
          notified_at?: string | null
          notify_level?: string | null
          outcome_id?: string | null
          pillar_id?: string | null
          share_consent?: boolean | null
          user_id?: string | null
          wants_to_integrate?: boolean | null
          wants_to_lead?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_lookup_entitlement: {
        Args: { p_email: string }
        Returns: {
          email: string
          expires_at: string
          granted_at: string
          granted_by_email: string
          note: string
          tier: Database["public"]["Enums"]["entitlement_tier"]
        }[]
      }
      admin_recent_grants: {
        Args: { p_limit?: number }
        Returns: {
          created_at: string
          expires_at: string
          granted_by_email: string
          id: string
          new_tier: Database["public"]["Enums"]["entitlement_tier"]
          note: string
          previous_tier: Database["public"]["Enums"]["entitlement_tier"]
          target_email: string
        }[]
      }
      admin_rollback_entitlement: {
        Args: { p_reason?: string; p_target_email: string }
        Returns: {
          email: string
          new_tier: Database["public"]["Enums"]["entitlement_tier"]
          previous_tier: Database["public"]["Enums"]["entitlement_tier"]
        }[]
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      eq_complete_task: { Args: { p_task_id: string }; Returns: undefined }
      get_public_zog_snapshot: {
        Args: { p_slug: string }
        Returns: {
          appleseed_data: Json
          appleseed_generated_at: string
          archetype_title: string
          core_pattern: string
          created_at: string
          mastery_action: string
          share_slug: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      revert_expired_entitlement_grants: {
        Args: never
        Returns: {
          duration_ms: number
          error_message: string
          ran_at: string
          reverted_count: number
        }[]
      }
      set_entitlement_tier: {
        Args: {
          p_expires_at?: string
          p_new_tier: Database["public"]["Enums"]["entitlement_tier"]
          p_note?: string
          p_target_email: string
        }
        Returns: {
          granted_at: string
          new_tier: Database["public"]["Enums"]["entitlement_tier"]
          previous_tier: Database["public"]["Enums"]["entitlement_tier"]
          profile_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      entitlement_tier:
        | "tasting"
        | "builder"
        | "locked_in"
        | "gifted_builder"
        | "gifted_locked_in"
        | "founders_50"
        | "ignition"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      entitlement_tier: [
        "tasting",
        "builder",
        "locked_in",
        "gifted_builder",
        "gifted_locked_in",
        "founders_50",
        "ignition",
      ],
    },
  },
} as const

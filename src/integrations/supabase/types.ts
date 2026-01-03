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
      game_profiles: {
        Row: {
          ai_upgrade_access: boolean | null
          created_at: string
          current_streak_days: number
          first_name: string | null
          id: string
          last_name: string | null
          last_practice_at: string | null
          last_qol_snapshot_id: string | null
          last_quest_completed_at: string | null
          last_quest_title: string | null
          last_zog_snapshot_id: string | null
          level: number
          longest_streak_days: number
          main_quest_progress: Json | null
          main_quest_stage: string
          main_quest_status: string
          main_quest_updated_at: string
          multiple_intelligences_completed: boolean | null
          personality_tests: Json | null
          practice_count: number
          total_quests_completed: number
          updated_at: string
          user_id: string | null
          xp_body: number
          xp_emotions: number
          xp_mind: number
          xp_spirit: number
          xp_total: number
          xp_uniqueness: number
          zone_of_genius_completed: boolean | null
        }
        Insert: {
          ai_upgrade_access?: boolean | null
          created_at?: string
          current_streak_days?: number
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_practice_at?: string | null
          last_qol_snapshot_id?: string | null
          last_quest_completed_at?: string | null
          last_quest_title?: string | null
          last_zog_snapshot_id?: string | null
          level?: number
          longest_streak_days?: number
          main_quest_progress?: Json | null
          main_quest_stage?: string
          main_quest_status?: string
          main_quest_updated_at?: string
          multiple_intelligences_completed?: boolean | null
          personality_tests?: Json | null
          practice_count?: number
          total_quests_completed?: number
          updated_at?: string
          user_id?: string | null
          xp_body?: number
          xp_emotions?: number
          xp_mind?: number
          xp_spirit?: number
          xp_total?: number
          xp_uniqueness?: number
          zone_of_genius_completed?: boolean | null
        }
        Update: {
          ai_upgrade_access?: boolean | null
          created_at?: string
          current_streak_days?: number
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_practice_at?: string | null
          last_qol_snapshot_id?: string | null
          last_quest_completed_at?: string | null
          last_quest_title?: string | null
          last_zog_snapshot_id?: string | null
          level?: number
          longest_streak_days?: number
          main_quest_progress?: Json | null
          main_quest_stage?: string
          main_quest_status?: string
          main_quest_updated_at?: string
          multiple_intelligences_completed?: boolean | null
          personality_tests?: Json | null
          practice_count?: number
          total_quests_completed?: number
          updated_at?: string
          user_id?: string | null
          xp_body?: number
          xp_emotions?: number
          xp_mind?: number
          xp_spirit?: number
          xp_total?: number
          xp_uniqueness?: number
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
      upgrade_catalog: {
        Row: {
          branch: string
          code: string
          created_at: string
          description: string
          id: string
          is_paid: boolean
          path_slug: string
          prereqs: string[] | null
          short_label: string
          sort_order: number
          title: string
          unlock_effects: Json | null
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
          prereqs?: string[] | null
          short_label: string
          sort_order?: number
          title: string
          unlock_effects?: Json | null
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
          prereqs?: string[] | null
          short_label?: string
          sort_order?: number
          title?: string
          unlock_effects?: Json | null
          xp_reward?: number
        }
        Relationships: []
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
      zog_snapshots: {
        Row: {
          archetype_title: string
          core_pattern: string
          created_at: string
          id: string
          mastery_action: string | null
          profile_id: string | null
          top_ten_talents: Json
          top_three_talents: Json
          xp_awarded: boolean
        }
        Insert: {
          archetype_title: string
          core_pattern: string
          created_at?: string
          id?: string
          mastery_action?: string | null
          profile_id?: string | null
          top_ten_talents: Json
          top_three_talents: Json
          xp_awarded?: boolean
        }
        Update: {
          archetype_title?: string
          core_pattern?: string
          created_at?: string
          id?: string
          mastery_action?: string | null
          profile_id?: string | null
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const

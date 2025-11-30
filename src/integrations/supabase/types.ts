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
      game_profiles: {
        Row: {
          ai_upgrade_access: boolean | null
          created_at: string
          current_streak_days: number
          id: string
          last_qol_snapshot_id: string | null
          last_quest_completed_at: string | null
          last_quest_title: string | null
          last_zog_snapshot_id: string | null
          level: number
          longest_streak_days: number
          total_quests_completed: number
          updated_at: string
          user_id: string | null
          xp_body: number
          xp_heart: number
          xp_mind: number
          xp_spirit: number
          xp_total: number
          xp_uniqueness_work: number
        }
        Insert: {
          ai_upgrade_access?: boolean | null
          created_at?: string
          current_streak_days?: number
          id?: string
          last_qol_snapshot_id?: string | null
          last_quest_completed_at?: string | null
          last_quest_title?: string | null
          last_zog_snapshot_id?: string | null
          level?: number
          longest_streak_days?: number
          total_quests_completed?: number
          updated_at?: string
          user_id?: string | null
          xp_body?: number
          xp_heart?: number
          xp_mind?: number
          xp_spirit?: number
          xp_total?: number
          xp_uniqueness_work?: number
        }
        Update: {
          ai_upgrade_access?: boolean | null
          created_at?: string
          current_streak_days?: number
          id?: string
          last_qol_snapshot_id?: string | null
          last_quest_completed_at?: string | null
          last_quest_title?: string | null
          last_zog_snapshot_id?: string | null
          level?: number
          longest_streak_days?: number
          total_quests_completed?: number
          updated_at?: string
          user_id?: string | null
          xp_body?: number
          xp_heart?: number
          xp_mind?: number
          xp_spirit?: number
          xp_total?: number
          xp_uniqueness_work?: number
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
      zog_snapshots: {
        Row: {
          archetype_title: string
          core_pattern: string
          created_at: string
          id: string
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

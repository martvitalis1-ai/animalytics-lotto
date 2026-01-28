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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          alias: string | null
          code: string
          created_at: string | null
          is_active: boolean | null
          role: string | null
        }
        Insert: {
          alias?: string | null
          code: string
          created_at?: string | null
          is_active?: boolean | null
          role?: string | null
        }
        Update: {
          alias?: string | null
          code?: string
          created_at?: string | null
          is_active?: boolean | null
          role?: string | null
        }
        Relationships: []
      }
      ai_predictions: {
        Row: {
          analysis_notes: string | null
          confidence_score: number | null
          created_at: string
          id: number
          lottery_type: string
          predicted_animals: string[] | null
          predicted_numbers: string[]
          prediction_date: string
        }
        Insert: {
          analysis_notes?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: number
          lottery_type: string
          predicted_animals?: string[] | null
          predicted_numbers: string[]
          prediction_date: string
        }
        Update: {
          analysis_notes?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: number
          lottery_type?: string
          predicted_animals?: string[] | null
          predicted_numbers?: string[]
          prediction_date?: string
        }
        Relationships: []
      }
      bot_memory: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          memory_type: string | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          memory_type?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          memory_type?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_predictions_cache: {
        Row: {
          cache_date: string
          created_at: string | null
          draw_time: string | null
          history_hash: string
          id: string
          lottery_id: string
          predictions: Json
        }
        Insert: {
          cache_date: string
          created_at?: string | null
          draw_time?: string | null
          history_hash: string
          id?: string
          lottery_id: string
          predictions: Json
        }
        Update: {
          cache_date?: string
          created_at?: string | null
          draw_time?: string | null
          history_hash?: string
          id?: string
          lottery_id?: string
          predictions?: Json
        }
        Relationships: []
      }
      dato_ricardo_predictions: {
        Row: {
          created_at: string
          draw_time: string
          id: number
          lottery_type: string
          notes: string | null
          predicted_animals: string[] | null
          predicted_numbers: string[]
          prediction_date: string
        }
        Insert: {
          created_at?: string
          draw_time: string
          id?: number
          lottery_type: string
          notes?: string | null
          predicted_animals?: string[] | null
          predicted_numbers: string[]
          prediction_date: string
        }
        Update: {
          created_at?: string
          draw_time?: string
          id?: number
          lottery_type?: string
          notes?: string | null
          predicted_animals?: string[] | null
          predicted_numbers?: string[]
          prediction_date?: string
        }
        Relationships: []
      }
      learning_meta: {
        Row: {
          consecutive_days_learning: number | null
          gaps_detected: number[] | null
          id: string
          last_hit_date: string | null
          last_processed_date: string | null
          start_date: string | null
          total_days_learned: number | null
          updated_at: string
        }
        Insert: {
          consecutive_days_learning?: number | null
          gaps_detected?: number[] | null
          id?: string
          last_hit_date?: string | null
          last_processed_date?: string | null
          start_date?: string | null
          total_days_learned?: number | null
          updated_at?: string
        }
        Update: {
          consecutive_days_learning?: number | null
          gaps_detected?: number[] | null
          id?: string
          last_hit_date?: string | null
          last_processed_date?: string | null
          start_date?: string | null
          total_days_learned?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_records: {
        Row: {
          actual_result: string
          created_at: string
          draw_time: string
          hit_patterns: string[] | null
          id: string
          learning_date: string
          lottery_id: string
          miss_patterns: string[] | null
          processed: boolean | null
        }
        Insert: {
          actual_result: string
          created_at?: string
          draw_time: string
          hit_patterns?: string[] | null
          id?: string
          learning_date: string
          lottery_id: string
          miss_patterns?: string[] | null
          processed?: boolean | null
        }
        Update: {
          actual_result?: string
          created_at?: string
          draw_time?: string
          hit_patterns?: string[] | null
          id?: string
          learning_date?: string
          lottery_id?: string
          miss_patterns?: string[] | null
          processed?: boolean | null
        }
        Relationships: []
      }
      learning_state: {
        Row: {
          baseline_chance: number | null
          consecutive_below_chance: number | null
          created_at: string
          hit_rate: number | null
          hits: number | null
          hypothesis_id: string
          id: string
          last_evaluated: string | null
          lottery_id: string
          misses: number | null
          pattern_type: string
          status: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          baseline_chance?: number | null
          consecutive_below_chance?: number | null
          created_at?: string
          hit_rate?: number | null
          hits?: number | null
          hypothesis_id: string
          id?: string
          last_evaluated?: string | null
          lottery_id: string
          misses?: number | null
          pattern_type: string
          status?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          baseline_chance?: number | null
          consecutive_below_chance?: number | null
          created_at?: string
          hit_rate?: number | null
          hits?: number | null
          hypothesis_id?: string
          id?: string
          last_evaluated?: string | null
          lottery_id?: string
          misses?: number | null
          pattern_type?: string
          status?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      lottery_results: {
        Row: {
          animal_name: string | null
          created_at: string
          draw_date: string
          draw_time: string
          id: number
          lottery_type: string
          result_number: string
        }
        Insert: {
          animal_name?: string | null
          created_at?: string
          draw_date?: string
          draw_time: string
          id?: number
          lottery_type: string
          result_number: string
        }
        Update: {
          animal_name?: string | null
          created_at?: string
          draw_date?: string
          draw_time?: string
          id?: number
          lottery_type?: string
          result_number?: string
        }
        Relationships: []
      }
      top3_cache: {
        Row: {
          cache_date: string
          created_at: string
          id: string
          last_recalculated: string
          lottery_id: string
          recalculation_reason: string | null
          top3_numbers: Json
        }
        Insert: {
          cache_date?: string
          created_at?: string
          id?: string
          last_recalculated?: string
          lottery_id: string
          recalculation_reason?: string | null
          top3_numbers: Json
        }
        Update: {
          cache_date?: string
          created_at?: string
          id?: string
          last_recalculated?: string
          lottery_id?: string
          recalculation_reason?: string | null
          top3_numbers?: Json
        }
        Relationships: []
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

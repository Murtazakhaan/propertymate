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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      glossary_terms: {
        Row: {
          beginner_definition: string | null
          category: string | null
          created_at: string
          definition: string
          id: string
          term: string
        }
        Insert: {
          beginner_definition?: string | null
          category?: string | null
          created_at?: string
          definition: string
          id?: string
          term: string
        }
        Update: {
          beginner_definition?: string | null
          category?: string | null
          created_at?: string
          definition?: string
          id?: string
          term?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_listings: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          id: string
          image_url: string | null
          link: string | null
          price: number
          property_type: string | null
          suburb_result_id: string
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          link?: string | null
          price: number
          property_type?: string | null
          suburb_result_id: string
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          link?: string | null
          price?: number
          property_type?: string | null
          suburb_result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_listings_suburb_result_id_fkey"
            columns: ["suburb_result_id"]
            isOneToOne: false
            referencedRelation: "suburb_results"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          budget_unknown: boolean | null
          created_at: string
          deposit: number | null
          existing_loan_amount: number | null
          existing_property_address: string | null
          existing_property_value: number | null
          goal: string
          has_existing_home: boolean | null
          home_age_preference: string | null
          id: string
          income: number | null
          investor_strategy: string | null
          is_first_home: boolean | null
          open_to_interstate: boolean | null
          risk_growth_preference: number | null
          timeline: string
          user_id: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          budget_unknown?: boolean | null
          created_at?: string
          deposit?: number | null
          existing_loan_amount?: number | null
          existing_property_address?: string | null
          existing_property_value?: number | null
          goal: string
          has_existing_home?: boolean | null
          home_age_preference?: string | null
          id?: string
          income?: number | null
          investor_strategy?: string | null
          is_first_home?: boolean | null
          open_to_interstate?: boolean | null
          risk_growth_preference?: number | null
          timeline: string
          user_id?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          budget_unknown?: boolean | null
          created_at?: string
          deposit?: number | null
          existing_loan_amount?: number | null
          existing_property_address?: string | null
          existing_property_value?: number | null
          goal?: string
          has_existing_home?: boolean | null
          home_age_preference?: string | null
          id?: string
          income?: number | null
          investor_strategy?: string | null
          is_first_home?: boolean | null
          open_to_interstate?: boolean | null
          risk_growth_preference?: number | null
          timeline?: string
          user_id?: string | null
        }
        Relationships: []
      }
      shortlists: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          suburb_result_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          suburb_result_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          suburb_result_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shortlists_suburb_result_id_fkey"
            columns: ["suburb_result_id"]
            isOneToOne: false
            referencedRelation: "suburb_results"
            referencedColumns: ["id"]
          },
        ]
      }
      suburb_results: {
        Row: {
          best_for_tag: string | null
          capital_growth_rate: number | null
          confidence: string | null
          created_at: string
          crime_rate_level: string | null
          days_on_market: number | null
          has_train_station: boolean | null
          house_weekly_rent: number | null
          id: string
          infrastructure_projects: string | null
          match_score: number
          median_price: number | null
          nearest_hospital: string | null
          nearest_shopping_centre: string | null
          num_schools: number | null
          population_growth: number | null
          postcode: string | null
          quiz_submission_id: string
          reasoning: string | null
          rental_range_high: number | null
          rental_range_low: number | null
          rental_yield: number | null
          risk_level: string
          stamp_duty_estimate: number | null
          state: string
          suburb_name: string
          unit_weekly_rent: number | null
          vacancy_rate: number | null
          weekly_out_of_pocket: number | null
        }
        Insert: {
          best_for_tag?: string | null
          capital_growth_rate?: number | null
          confidence?: string | null
          created_at?: string
          crime_rate_level?: string | null
          days_on_market?: number | null
          has_train_station?: boolean | null
          house_weekly_rent?: number | null
          id?: string
          infrastructure_projects?: string | null
          match_score?: number
          median_price?: number | null
          nearest_hospital?: string | null
          nearest_shopping_centre?: string | null
          num_schools?: number | null
          population_growth?: number | null
          postcode?: string | null
          quiz_submission_id: string
          reasoning?: string | null
          rental_range_high?: number | null
          rental_range_low?: number | null
          rental_yield?: number | null
          risk_level?: string
          stamp_duty_estimate?: number | null
          state: string
          suburb_name: string
          unit_weekly_rent?: number | null
          vacancy_rate?: number | null
          weekly_out_of_pocket?: number | null
        }
        Update: {
          best_for_tag?: string | null
          capital_growth_rate?: number | null
          confidence?: string | null
          created_at?: string
          crime_rate_level?: string | null
          days_on_market?: number | null
          has_train_station?: boolean | null
          house_weekly_rent?: number | null
          id?: string
          infrastructure_projects?: string | null
          match_score?: number
          median_price?: number | null
          nearest_hospital?: string | null
          nearest_shopping_centre?: string | null
          num_schools?: number | null
          population_growth?: number | null
          postcode?: string | null
          quiz_submission_id?: string
          reasoning?: string | null
          rental_range_high?: number | null
          rental_range_low?: number | null
          rental_yield?: number | null
          risk_level?: string
          stamp_duty_estimate?: number | null
          state?: string
          suburb_name?: string
          unit_weekly_rent?: number | null
          vacancy_rate?: number | null
          weekly_out_of_pocket?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "suburb_results_quiz_submission_id_fkey"
            columns: ["quiz_submission_id"]
            isOneToOne: false
            referencedRelation: "quiz_submissions"
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

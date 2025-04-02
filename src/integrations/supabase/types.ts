export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      communication_prompts: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          text: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          text: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_questions: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          premium_only: boolean | null
          text: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          premium_only?: boolean | null
          text: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          premium_only?: boolean | null
          text?: string
        }
        Relationships: []
      }
      date_ideas: {
        Row: {
          at_home: boolean | null
          category: string | null
          cost_level: number | null
          created_at: string | null
          description: string | null
          id: string
          outdoor: boolean | null
          premium_only: boolean | null
          time_required: number | null
          title: string
        }
        Insert: {
          at_home?: boolean | null
          category?: string | null
          cost_level?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          outdoor?: boolean | null
          premium_only?: boolean | null
          time_required?: number | null
          title: string
        }
        Update: {
          at_home?: boolean | null
          category?: string | null
          cost_level?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          outdoor?: boolean | null
          premium_only?: boolean | null
          time_required?: number | null
          title?: string
        }
        Relationships: []
      }
      goal_milestones: {
        Row: {
          created_at: string | null
          goal_id: string
          id: string
          is_completed: boolean | null
          sequence_number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          goal_id: string
          id?: string
          is_completed?: boolean | null
          sequence_number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          goal_id?: string
          id?: string
          is_completed?: boolean | null
          sequence_number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          is_shared: boolean | null
          progress: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          is_shared?: boolean | null
          progress?: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          is_shared?: boolean | null
          progress?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journey_questions: {
        Row: {
          category: string | null
          created_at: string | null
          difficulty: number
          explanation: string | null
          id: string
          journey_id: string
          love_language: Database["public"]["Enums"]["love_language"] | null
          modality: Database["public"]["Enums"]["question_modality"] | null
          sequence_number: number
          text: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          difficulty?: number
          explanation?: string | null
          id?: string
          journey_id: string
          love_language?: Database["public"]["Enums"]["love_language"] | null
          modality?: Database["public"]["Enums"]["question_modality"] | null
          sequence_number: number
          text: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          difficulty?: number
          explanation?: string | null
          id?: string
          journey_id?: string
          love_language?: Database["public"]["Enums"]["love_language"] | null
          modality?: Database["public"]["Enums"]["question_modality"] | null
          sequence_number?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_questions_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_responses: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          journey_id: string
          question_id: string
          reflection: string | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          journey_id: string
          question_id: string
          reflection?: string | null
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          journey_id?: string
          question_id?: string
          reflection?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_responses_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "journey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: number
          estimated_days: number | null
          id: string
          image_url: string | null
          premium_only: boolean | null
          title: string
          type: Database["public"]["Enums"]["journey_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: number
          estimated_days?: number | null
          id?: string
          image_url?: string | null
          premium_only?: boolean | null
          title: string
          type: Database["public"]["Enums"]["journey_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: number
          estimated_days?: number | null
          id?: string
          image_url?: string | null
          premium_only?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["journey_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_invitations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          invite_code: string
          recipient_email: string
          sender_id: string
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_code: string
          recipient_email: string
          sender_id: string
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string
          recipient_email?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          is_onboarded: boolean | null
          last_active: string | null
          partner_id: string | null
          relationship_type:
            | Database["public"]["Enums"]["relationship_type"]
            | null
          subscription_expiry: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id: string
          is_onboarded?: boolean | null
          last_active?: string | null
          partner_id?: string | null
          relationship_type?:
            | Database["public"]["Enums"]["relationship_type"]
            | null
          subscription_expiry?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          is_onboarded?: boolean | null
          last_active?: string | null
          partner_id?: string | null
          relationship_type?:
            | Database["public"]["Enums"]["relationship_type"]
            | null
          subscription_expiry?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_events: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          event_datetime: string | null
          id: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          event_datetime?: string | null
          id?: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          event_datetime?: string | null
          id?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          details: Json | null
          id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_date_ideas: {
        Row: {
          created_at: string | null
          date_idea_id: string
          id: string
          is_completed: boolean | null
          is_favorite: boolean | null
          notes: string | null
          scheduled_for: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_idea_id: string
          id?: string
          is_completed?: boolean | null
          is_favorite?: boolean | null
          notes?: string | null
          scheduled_for?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_idea_id?: string
          id?: string
          is_completed?: boolean | null
          is_favorite?: boolean | null
          notes?: string | null
          scheduled_for?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_date_ideas_date_idea_id_fkey"
            columns: ["date_idea_id"]
            isOneToOne: false
            referencedRelation: "date_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journeys: {
        Row: {
          completed_at: string | null
          id: string
          is_active: boolean | null
          journey_id: string
          progress: number
          start_date: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_active?: boolean | null
          journey_id: string
          progress?: number
          start_date?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_active?: boolean | null
          journey_id?: string
          progress?: number
          start_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journeys_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      event_status: "planned" | "completed" | "cancelled"
      gender: "male" | "female" | "non-binary" | "prefer-not-to-say"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      journey_type:
        | "communication"
        | "intimacy"
        | "trust"
        | "growth"
        | "conflict"
      love_language:
        | "words-of-affirmation"
        | "acts-of-service"
        | "receiving-gifts"
        | "quality-time"
        | "physical-touch"
      question_modality: "reflection" | "discussion" | "activity"
      relationship_type:
        | "monogamous"
        | "polyamorous"
        | "lgbtq"
        | "long-distance"
      subscription_tier: "free" | "premium" | "platinum"
      user_role: "user" | "admin" | "partner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export type ProfileUpdate = {
  avatar_url?: string | null;
  created_at?: string | null;
  email?: string;
  full_name?: string;
  gender?: Database["public"]["Enums"]["gender"] | null;
  id?: string;
  is_onboarded?: boolean | null;
  last_active?: string | null;
  partner_id?: string | null;
  relationship_type?: Database["public"]["Enums"]["relationship_type"] | null;
  subscription_expiry?: string | null;
  subscription_tier?: Database["public"]["Enums"]["subscription_tier"] | null;
  updated_at?: string | null;
  username?: string;
};

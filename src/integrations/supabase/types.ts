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
      achievements: {
        Row: {
          awarded_at: string | null
          created_at: string | null
          description: string
          icon: string
          id: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          awarded_at?: string | null
          created_at?: string | null
          description: string
          icon: string
          id?: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          awarded_at?: string | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          completed_at: string | null
          content_id: string
          created_at: string | null
          id: string
          mood_rating: number | null
          notes: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          created_at?: string | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          created_at?: string | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversation_memories: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_memories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_activities: {
        Row: {
          activity_type: string
          completed_at: string | null
          id: string
          points_earned: number | null
          response: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          completed_at?: string | null
          id?: string
          points_earned?: number | null
          response?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          completed_at?: string | null
          id?: string
          points_earned?: number | null
          response?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_questions: {
        Row: {
          category: string
          created_at: string | null
          difficulty: number | null
          explanation: string | null
          id: string
          journey_id: string | null
          love_language: string | null
          modality: string
          text: string
        }
        Insert: {
          category: string
          created_at?: string | null
          difficulty?: number | null
          explanation?: string | null
          id?: string
          journey_id?: string | null
          love_language?: string | null
          modality: string
          text: string
        }
        Update: {
          category?: string
          created_at?: string | null
          difficulty?: number | null
          explanation?: string | null
          id?: string
          journey_id?: string | null
          love_language?: string | null
          modality?: string
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
          journey_id: string | null
          question_id: string | null
          user_id: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          journey_id?: string | null
          question_id?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          journey_id?: string | null
          question_id?: string | null
          user_id?: string | null
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
          description: string
          difficulty: number | null
          estimated_duration: unknown | null
          id: string
          modality: string | null
          title: string
          type: Database["public"]["Enums"]["journey_type"]
        }
        Insert: {
          created_at?: string | null
          description: string
          difficulty?: number | null
          estimated_duration?: unknown | null
          id?: string
          modality?: string | null
          title: string
          type: Database["public"]["Enums"]["journey_type"]
        }
        Update: {
          created_at?: string | null
          description?: string
          difficulty?: number | null
          estimated_duration?: unknown | null
          id?: string
          modality?: string | null
          title?: string
          type?: Database["public"]["Enums"]["journey_type"]
        }
        Relationships: []
      }
      memories: {
        Row: {
          created_at: string | null
          date: string | null
          description: string
          id: string
          related_to: string[] | null
          sentiment: string | null
          tags: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description: string
          id?: string
          related_to?: string[] | null
          sentiment?: string | null
          tags?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string
          id?: string
          related_to?: string[] | null
          sentiment?: string | null
          tags?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      memory_storage: {
        Row: {
          id: string
          key: string
          timestamp: string
          user_id: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          timestamp?: string
          user_id?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          timestamp?: string
          user_id?: string | null
          value?: Json
        }
        Relationships: []
      }
      partner_invites: {
        Row: {
          created_at: string
          id: string
          receiver_email: string
          sender_id: string
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_email: string
          sender_id: string
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_email?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_invites_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          isonboarded: boolean | null
          last_daily_activity: string | null
          name: string
          partner_code: string | null
          partner_id: string | null
          relationship_level: string | null
          relationship_points: number | null
          streak_count: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          isonboarded?: boolean | null
          last_daily_activity?: string | null
          name: string
          partner_code?: string | null
          partner_id?: string | null
          relationship_level?: string | null
          relationship_points?: number | null
          streak_count?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          isonboarded?: boolean | null
          last_daily_activity?: string | null
          name?: string
          partner_code?: string | null
          partner_id?: string | null
          relationship_level?: string | null
          relationship_points?: number | null
          streak_count?: number | null
          updated_at?: string
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
      quiz_results: {
        Row: {
          answers: Json | null
          id: string
          quiz_type: string
          score: number
          taken_at: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          id?: string
          quiz_type: string
          score: number
          taken_at?: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          id?: string
          quiz_type?: string
          score?: number
          taken_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          achieved: boolean | null
          achieved_at: string | null
          badge_level: number | null
          badge_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          achieved?: boolean | null
          achieved_at?: string | null
          badge_level?: number | null
          badge_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          achieved?: boolean | null
          achieved_at?: string | null
          badge_level?: number | null
          badge_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journeys: {
        Row: {
          completed_at: string | null
          id: string
          journey_id: string | null
          start_date: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          journey_id?: string | null
          start_date?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          journey_id?: string | null
          start_date?: string | null
          user_id?: string | null
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
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      generate_partner_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "rejected"
      journey_type: "communication" | "intimacy" | "personal_growth"
      user_role: "user" | "admin"
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

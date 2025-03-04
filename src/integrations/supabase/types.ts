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
      partner_invitations: {
        Row: {
          id: string;
          created_at: string;
          inviter_id: string;
          partner_email: string;
          status: 'pending' | 'accepted' | 'rejected' | 'expired';
          invitation_code: string;
          accepted_at: string | null;
          expires_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          inviter_id: string;
          partner_email: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'expired';
          invitation_code: string;
          accepted_at?: string | null;
          expires_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          inviter_id?: string;
          partner_email?: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'expired';
          invitation_code?: string;
          accepted_at?: string | null;
          expires_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partner_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ];
      }
      profiles: {
        Row: {
          id: string;
          created_at: string;
          full_name: string;
          email: string;
          gender: string;
          relationship_type: string;
          partner_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          full_name: string;
          email: string;
          gender?: string;
          relationship_type?: string;
          partner_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          full_name?: string;
          email?: string;
          gender?: string;
          relationship_type?: string;
          partner_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_partner_id_fkey"
            columns: ["partner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ];
      };
      analytics_events: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          event_type: string;
          properties: Record<string, any>;
          timestamp: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          event_type: string;
          properties?: Record<string, any>;
          timestamp: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          event_type?: string;
          properties?: Record<string, any>;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ];
      };
      journey_progress: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          journey_id: string;
          day: number;
          completed: boolean;
          responses: Record<string, any>;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          journey_id: string;
          day: number;
          completed?: boolean;
          responses?: Record<string, any>;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          journey_id?: string;
          day?: number;
          completed?: boolean;
          responses?: Record<string, any>;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "journey_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ];
      };
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

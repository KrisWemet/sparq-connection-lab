
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          avatar_url?: string
          partner_name?: string
          anniversary_date?: string
          sexual_orientation?: string
          relationship_structure?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          avatar_url?: string
          partner_name?: string
          anniversary_date?: string
          sexual_orientation?: string
          relationship_structure?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          avatar_url?: string
          partner_name?: string
          anniversary_date?: string
          sexual_orientation?: string
          relationship_structure?: string
          updated_at?: string
        }
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
  }
}


export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  partner_name?: string;
  anniversary_date?: string;
  sexual_orientation?: string;
  relationship_structure?: string;
  created_at: string;
  updated_at: string;
  isOnboarded?: boolean;
}

export interface ProfileFormData {
  full_name: string;
  email: string;
  partner_name?: string;
  anniversary_date?: string;
  sexual_orientation?: string;
  relationship_structure?: string;
  avatar_url?: string;
} 

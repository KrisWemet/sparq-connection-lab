
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
  relationship_level?: string;
  relationship_points?: number;
  streak_count?: number;
  last_daily_activity?: string;
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

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_level: number;
  achieved: boolean;
  achieved_at?: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_type: string;
  completed_at: string;
  response?: string;
  points_earned: number;
}

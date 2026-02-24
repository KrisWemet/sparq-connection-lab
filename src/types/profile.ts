
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

  // ─── Session & Discovery Fields ────────────────────────────────────────
  /** User's chosen growth identity archetype */
  identity_archetype?: string;
  /** Whether using the app solo or with a partner */
  relationship_mode?: "solo" | "partner";
  /** Preferred daily session time (HH:MM format) */
  preferred_session_time?: string;
  /** Goals selected during onboarding */
  onboarding_goals?: string[];
  /** Current day in the 14-day discovery arc */
  discovery_day?: number;
  /** ISO date of last completed session */
  last_session_date?: string;
  /** Sessions completed in current week (for free tier gating) */
  sessions_completed_this_week?: number;
  /** ISO date when trial started */
  trial_start_date?: string;

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

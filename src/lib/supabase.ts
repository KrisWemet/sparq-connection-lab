import { createClient } from '@supabase/supabase-js';

// Environment variables should be set in .env.local
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** False when the Supabase env vars are missing (misconfigured build or preview). */
export const isSupabaseConfigured = Boolean(envUrl && envAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase calls will fail until they are set.'
  );
}

// createClient throws on an empty URL at import time, which used to 500 every
// page. Fall back to a reserved never-resolving host so pages still render and
// data calls fail fast (and get handled) instead.
const supabaseUrl = envUrl || 'https://supabase-not-configured.invalid';
const supabaseAnonKey = envAnonKey || 'missing-anon-key';

// Create a single supabase client for the entire app
// Use a simple in-process lock instead of Navigator LockManager to avoid
// timeouts caused by browser extensions interfering with the Lock API.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'sparq-auth',
    lock: async (name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
      return await fn();
    },
  },
});

// Define types for our database tables
export type Profile = {
  id: string;
  user_id?: string;
  name?: string;       // primary DB column
  full_name?: string;  // alias — some code uses this
  email?: string;
  avatar_url?: string;
  partner_name?: string;
  streak_count?: number;
  last_activity_date?: string;
  last_active?: string;
  isOnboarded?: boolean;
  created_at: string;
  updated_at?: string;
};

export type Activity = {
  id: string;
  user_id: string;
  type: 'metaphor' | 'futurePacing' | 'hypnoticStory' | 'daily_question';
  content_id: string;
  completed_at: string;
  notes?: string;
  mood_rating?: number;
  created_at: string;
};

export type Memory = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  related_to?: string[];
  created_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  awarded_at: string;
  icon: string;
  created_at: string;
};

// Helper functions for database operations
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(profile: Partial<Profile> & { id: string }): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' });

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }

  return true;
}

export async function logActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase
    .from('activities')
    .insert(activity);

  if (error) {
    console.error('Error logging activity:', error);
    return false;
  }

  // Update streak count
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count, last_activity_date')
    .eq('user_id', activity.user_id)
    .single();
  
  if (profile) {
    const lastActivity = profile.last_activity_date ? profile.last_activity_date.split('T')[0] : null;
    
    // If last activity was yesterday, increment streak
    // If last activity was today, keep streak the same
    // Otherwise, reset streak to 1
    let newStreakCount = 1;
    if (lastActivity === yesterday) {
      newStreakCount = profile.streak_count + 1;
    } else if (lastActivity === today) {
      newStreakCount = profile.streak_count;
    }
    
    await supabase
      .from('profiles')
      .update({ 
        streak_count: newStreakCount,
        last_activity_date: new Date().toISOString()
      })
      .eq('user_id', activity.user_id);
  }

  return true;
}

export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }

  return data || [];
}

export async function getRecentActivities(userId: string, limit = 10): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return data || [];
}


import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/services/supabaseService';

// Create a cached auth state to persist between renders/navigations
export const cachedAuthState = {
  user: null as User | null,
  profile: null as UserProfile | null,
  isAdmin: false,
  isOnboarded: false,
  initialized: false
};

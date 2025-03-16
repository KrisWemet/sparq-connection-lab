
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/supabaseService';
import { cachedAuthState } from '../auth-state';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/services/supabaseService';

type SessionSetupHandler = (
  user: User | null, 
  profile: UserProfile | null, 
  isAdmin: boolean, 
  isOnboarded: boolean
) => void;

export async function fetchInitialSession(setLoading: (loading: boolean) => void, onSessionLoaded: SessionSetupHandler) {
  try {
    setLoading(true);
    console.log("Getting initial session...");
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Session retrieved:", !!session);
    
    if (session?.user) {
      console.log("User found in session");
      cachedAuthState.user = session.user;
      
      // Get user profile
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          console.log("Profile found");
          cachedAuthState.profile = profile as UserProfile;
          
          // Set onboarded status based on profile data
          const profileIsOnboarded = !!profile.isOnboarded;
          cachedAuthState.isOnboarded = profileIsOnboarded;
          
          // Check if user is admin
          const adminStatus = await authService.isAdmin();
          cachedAuthState.isAdmin = adminStatus;
          
          onSessionLoaded(session.user, profile as UserProfile, adminStatus, profileIsOnboarded);
        } else {
          onSessionLoaded(session.user, null, false, false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        onSessionLoaded(session.user, null, false, false);
      }
    } else {
      console.log("No user in session");
      // Clear cached state if no user
      cachedAuthState.user = null;
      cachedAuthState.profile = null;
      cachedAuthState.isAdmin = false;
      cachedAuthState.isOnboarded = false;
      
      onSessionLoaded(null, null, false, false);
    }
  } catch (error) {
    console.error('Error getting initial session:', error);
    onSessionLoaded(null, null, false, false);
  } finally {
    setLoading(false);
    cachedAuthState.initialized = true;
    console.log("Auth initialization complete");
  }
}

export function useInitialSession(
  setLoading: (loading: boolean) => void,
  onSessionLoaded: SessionSetupHandler
) {
  useEffect(() => {
    if (cachedAuthState.initialized) {
      console.log("Using cached auth state, skipping initialization");
      onSessionLoaded(
        cachedAuthState.user, 
        cachedAuthState.profile, 
        cachedAuthState.isAdmin, 
        cachedAuthState.isOnboarded
      );
      return;
    }

    console.log("Auth provider initialized");
    fetchInitialSession(setLoading, onSessionLoaded);
  }, []);
}


import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';
import { refreshProfile } from '../auth-operations';
import { cachedAuthState } from '../auth-state';

export interface UseInitialSessionProps {
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setIsOnboarded: (isOnboarded: boolean) => void;
  setLoading: (loading: boolean) => void;
  setInitializationComplete: (complete: boolean) => void;
}

export function useInitialSession({ 
  setUser, 
  setProfile, 
  setIsAdmin,
  setIsOnboarded, 
  setLoading, 
  setInitializationComplete 
}: UseInitialSessionProps) {
  useEffect(() => {
    const initSession = async () => {
      try {
        // Try to get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          // We have a user
          setUser(session.user);
          cachedAuthState.user = session.user;
          
          try {
            // Load user profile
            const profile = await refreshProfile(session.user.id);
            
            if (profile) {
              setProfile(profile as UserProfile);
              cachedAuthState.profile = profile as UserProfile;
              
              // Set admin status
              const isAdminUser = session.user.email?.includes('admin@') || false;
              setIsAdmin(isAdminUser);
              cachedAuthState.isAdmin = isAdminUser;
              
              // Set onboarded status
              const isOnboardedStatus = !!profile.isOnboarded;
              setIsOnboarded(isOnboardedStatus);
              cachedAuthState.isOnboarded = isOnboardedStatus;
            }
          } catch (profileError) {
            console.error('Error loading profile during initialization:', profileError);
          }
        }
      } catch (error) {
        console.error('Error initializing auth session:', error);
      } finally {
        setLoading(false);
        setInitializationComplete(true);
        cachedAuthState.initialized = true;
      }
    };
    
    initSession();
  }, [setUser, setProfile, setIsAdmin, setIsOnboarded, setLoading, setInitializationComplete]);
}

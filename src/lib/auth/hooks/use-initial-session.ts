
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
          // Immediately set user to improve perceived performance
          setUser(session.user);
          cachedAuthState.user = session.user;
          
          // Set admin status immediately (don't wait for profile)
          const isAdminUser = session.user.email?.includes('admin@') || false;
          setIsAdmin(isAdminUser);
          cachedAuthState.isAdmin = isAdminUser;
          
          // Set initialization complete to allow UI to render
          setInitializationComplete(true);
          cachedAuthState.initialized = true;
          
          // Fetch profile in the background
          refreshProfile(session.user.id)
            .then(profile => {
              if (profile) {
                setProfile(profile as UserProfile);
                cachedAuthState.profile = profile as UserProfile;
                
                // Set onboarded status
                const isOnboardedStatus = !!profile.isOnboarded;
                setIsOnboarded(isOnboardedStatus);
                cachedAuthState.isOnboarded = isOnboardedStatus;
              }
            })
            .catch(profileError => {
              console.error('Error loading profile during initialization:', profileError);
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          // No session, set initialization complete and stop loading
          setInitializationComplete(true);
          cachedAuthState.initialized = true;
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth session:', error);
        // Even on error, set initialization complete and stop loading
        setInitializationComplete(true);
        cachedAuthState.initialized = true;
        setLoading(false);
      }
    };
    
    // Set a timeout to force-complete initialization if it takes too long
    const timeoutId = setTimeout(() => {
      setInitializationComplete(true);
      cachedAuthState.initialized = true;
      setLoading(false);
    }, 1000); // 1 second timeout as a safety net
    
    initSession().finally(() => clearTimeout(timeoutId));
    
    return () => clearTimeout(timeoutId);
  }, [setUser, setProfile, setIsAdmin, setIsOnboarded, setLoading, setInitializationComplete]);
}

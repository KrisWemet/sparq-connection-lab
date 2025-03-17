
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';
import { refreshProfile } from '../auth-operations';
import { cachedAuthState } from '../auth-state';

export interface UseAuthSubscriptionProps {
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setIsOnboarded: (isOnboarded: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export function useAuthSubscription({ 
  setUser, 
  setProfile, 
  setIsAdmin,
  setIsOnboarded,
  setLoading
}: UseAuthSubscriptionProps) {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User found in auth state change');
          
          // Immediately update user to improve perceived performance
          setUser(session.user);
          cachedAuthState.user = session.user;
          
          // Set admin status immediately (don't wait for profile)
          const isAdminUser = session.user.email?.includes('admin@') || false;
          setIsAdmin(isAdminUser);
          cachedAuthState.isAdmin = isAdminUser;
          
          // Fetch profile in the background
          setLoading(true);
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
            .catch(error => {
              console.error('Error fetching profile during auth state change:', error);
            })
            .finally(() => {
              setLoading(false);
            });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out in auth state change');
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsOnboarded(false);
          
          cachedAuthState.user = null;
          cachedAuthState.profile = null;
          cachedAuthState.isAdmin = false;
          cachedAuthState.isOnboarded = false;
        }
      }
    );
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [setUser, setProfile, setIsAdmin, setIsOnboarded, setLoading]);
}

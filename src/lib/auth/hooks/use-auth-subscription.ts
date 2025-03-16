
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
          setUser(session.user);
          cachedAuthState.user = session.user;
          setLoading(true); // Set loading state while we fetch the profile
          
          try {
            // Fetch profile for the user
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
          } catch (error) {
            console.error('Error fetching profile during auth state change:', error);
          } finally {
            setLoading(false);
          }
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

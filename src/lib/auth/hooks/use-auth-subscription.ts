
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cachedAuthState } from '../auth-state';
import { UserProfile } from '@/services/supabaseService';

interface UseAuthSubscriptionProps {
  setUser: (user: any) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setIsOnboarded: (isOnboarded: boolean) => void;
}

export function useAuthSubscription({
  setUser,
  setProfile,
  setIsAdmin,
  setIsOnboarded
}: UseAuthSubscriptionProps) {
  useEffect(() => {
    // Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (session?.user) {
          console.log("User found in auth state change");
          setUser(session.user);
          cachedAuthState.user = session.user;
          
          // Get user profile on auth change
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profile) {
              setProfile(profile as UserProfile);
              cachedAuthState.profile = profile as UserProfile;
              
              // Set onboarded status based on profile data
              const profileIsOnboarded = !!profile.isOnboarded;
              setIsOnboarded(profileIsOnboarded);
              cachedAuthState.isOnboarded = profileIsOnboarded;
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        } else {
          // Clear state
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsOnboarded(false);
          
          // Clear cached state
          cachedAuthState.user = null;
          cachedAuthState.profile = null;
          cachedAuthState.isAdmin = false;
          cachedAuthState.isOnboarded = false;
        }
      }
    );

    const authSubscription = { unsubscribe: () => { data.subscription.unsubscribe(); } };

    // Cleanup subscription
    return () => {
      authSubscription.unsubscribe();
    };
  }, [setUser, setProfile, setIsAdmin, setIsOnboarded]);
}

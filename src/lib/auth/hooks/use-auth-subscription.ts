
import { useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/services/supabaseService';
import { authService } from '@/services/supabaseService';
import { cachedAuthState } from '../auth-state';

type AuthChangeHandler = (user: User | null, profile: UserProfile | null) => void;

export function useAuthSubscription(onChange: AuthChangeHandler) {
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    // Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (session?.user) {
          console.log("User found in auth change");
          cachedAuthState.user = session.user;
          
          // Get user profile on auth change
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profile) {
              cachedAuthState.profile = profile as UserProfile;
              
              // Set onboarded status based on profile data
              const profileIsOnboarded = !!profile.isOnboarded;
              cachedAuthState.isOnboarded = profileIsOnboarded;
            }
            
            // Check if user is admin
            const adminStatus = await authService.isAdmin();
            cachedAuthState.isAdmin = adminStatus;

            onChange(session.user, profile as UserProfile);
          } catch (error) {
            console.error('Error fetching profile:', error);
            onChange(session.user, null);
          }
        } else {
          // Clear cached state
          cachedAuthState.user = null;
          cachedAuthState.profile = null;
          cachedAuthState.isAdmin = false;
          cachedAuthState.isOnboarded = false;
          
          onChange(null, null);
        }
      }
    );

    // Store the subscription with proper unsubscribe method
    authSubscription.current = data;

    // Cleanup subscription
    return () => {
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
      }
    };
  }, [onChange]);
}

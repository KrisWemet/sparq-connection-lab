
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cachedAuthState } from '../auth-state';
import { UserProfile } from '@/services/supabaseService';

interface UseInitialSessionProps {
  setUser: (user: any) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsOnboarded: (isOnboarded: boolean) => void;
  setInitializationComplete: (complete: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export function useInitialSession({
  setUser,
  setProfile,
  setIsOnboarded,
  setInitializationComplete,
  setLoading
}: UseInitialSessionProps) {
  useEffect(() => {
    console.log("AuthProvider initialized with supabase client", {
      hasSupabase: !!supabase, 
      hasAuth: !!(supabase && supabase.auth)
    });
    
    // Check if we already have a session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          console.log("Found existing session, setting user");
          setUser(data.session.user);
          cachedAuthState.user = data.session.user;
          
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
              
            if (profileData) {
              setProfile(profileData as UserProfile);
              cachedAuthState.profile = profileData as UserProfile;
              setIsOnboarded(!!profileData.isOnboarded);
              cachedAuthState.isOnboarded = !!profileData.isOnboarded;
            }
          } catch (error) {
            console.error("Error loading profile:", error);
          }
        }
        setInitializationComplete(true);
        cachedAuthState.initialized = true;
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setInitializationComplete(true);
        cachedAuthState.initialized = true;
        setLoading(false);
      }
    };
    
    checkSession();
  }, [setUser, setProfile, setIsOnboarded, setInitializationComplete, setLoading]);
}

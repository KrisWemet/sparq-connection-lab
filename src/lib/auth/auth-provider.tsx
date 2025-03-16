
import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth-context';
import { cachedAuthState } from './auth-state';
import { signIn, signUp, signOut, refreshProfile } from './auth-operations';
import { useAuthLoading } from './hooks/use-auth-loading';
import { useAuthSubscription } from './hooks/use-auth-subscription';
import { useInitialSession } from './hooks/use-initial-session';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedAuthState.user);
  const [profile, setProfile] = useState<UserProfile | null>(cachedAuthState.profile);
  const [isAdmin, setIsAdmin] = useState(cachedAuthState.isAdmin);
  const [isOnboarded, setIsOnboarded] = useState(cachedAuthState.isOnboarded);
  const [initializationComplete, setInitializationComplete] = useState(cachedAuthState.initialized);
  
  const { loading, setLoading } = useAuthLoading(!cachedAuthState.initialized);

  // Log some debug info about supabase client
  useEffect(() => {
    console.log("AuthProvider initialized with supabase client", {
      hasSupabase: !!supabase, 
      hasAuth: !!(supabase && supabase.auth)
    });
  }, []);

  // Handle session setup
  const handleSessionLoaded = useCallback((
    sessionUser: User | null, 
    sessionProfile: UserProfile | null, 
    adminStatus: boolean, 
    onboardedStatus: boolean
  ) => {
    console.log("Session loaded with user:", !!sessionUser, "profile:", !!sessionProfile);
    setUser(sessionUser);
    setProfile(sessionProfile);
    setIsAdmin(adminStatus);
    setIsOnboarded(onboardedStatus);
    setInitializationComplete(true);
    setLoading(false); // Ensure loading is set to false when session is loaded
  }, [setLoading]);

  // Initialize session
  useInitialSession(setLoading, handleSessionLoaded);

  // Handle auth state changes
  const handleAuthChange = useCallback((changedUser: User | null, changedProfile: UserProfile | null) => {
    console.log("Auth state changed, user:", !!changedUser, "profile:", !!changedProfile);
    // Set user and profile first, so they are available for navigation decisions
    setUser(changedUser);
    setProfile(changedProfile);
    
    if (changedProfile) {
      // Set onboarded status based on profile data
      const profileIsOnboarded = !!changedProfile.isOnboarded;
      setIsOnboarded(profileIsOnboarded);
      setIsAdmin(cachedAuthState.isAdmin);
    } else if (!changedUser) {
      setIsAdmin(false);
      setIsOnboarded(false);
    }
    
    // Important: Set loading to false immediately after processing auth change
    setLoading(false);
  }, [setLoading]);

  // Subscribe to auth changes
  useAuthSubscription(handleAuthChange);

  // Function to refresh profile data
  const handleRefreshProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await refreshProfile(user.id);
        
      if (profile) {
        console.log("Refreshed profile data:", profile);
        setProfile(profile as UserProfile);
        cachedAuthState.profile = profile as UserProfile;
        
        // Set onboarded status based on profile data
        const profileIsOnboarded = !!profile.isOnboarded;
        setIsOnboarded(profileIsOnboarded);
        cachedAuthState.isOnboarded = profileIsOnboarded;
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Starting sign in process with email:", email);
      await signIn(email, password);
      
      // Check if we have a session immediately to speed up redirection
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        console.log("Sign in successful, setting user directly");
        setUser(data.session.user);
        
        try {
          // Get profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileData) {
            console.log("Profile found in sign in process");
            setProfile(profileData as UserProfile);
            setIsOnboarded(!!profileData.isOnboarded);
          }
        } catch (profileError) {
          console.error("Error fetching profile during sign in:", profileError);
        }
      }
      
      console.log("Sign in operation completed");
    } catch (error) {
      console.error("Sign in error:", error);
      setLoading(false); // Make sure to set loading to false on error
      throw error;
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    fullName: string,
    gender = 'prefer-not-to-say',
    relationshipType = 'monogamous'
  ) => {
    setLoading(true);
    try {
      await signUp(email, password, fullName, gender, relationshipType);
      // Auth state change will set loading to false
    } catch (error) {
      console.error("Sign up error:", error);
      setLoading(false); // Make sure to set loading to false on error
      throw error;
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      // Clear user and profile immediately for faster UI updates
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setIsOnboarded(false);
      
      // Auth state change will confirm this change
    } catch (error) {
      setLoading(false); // Make sure to set loading to false on error
      throw error;
    }
  };

  // Provide auth context values to children
  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading,
      signIn: handleSignIn, 
      signUp: handleSignUp, 
      signOut: handleSignOut,
      isAdmin,
      isOnboarded,
      refreshProfile: handleRefreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

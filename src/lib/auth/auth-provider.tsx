
import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth-context';
import { cachedAuthState } from './auth-state';
import { signIn, signUp, signOut, refreshProfile } from './auth-operations';
import { useAuthLoading } from './hooks/use-auth-loading';
import { useAuthSubscription } from './hooks/use-auth-subscription';
import { useInitialSession } from './hooks/use-initial-session';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/services/supabaseService';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedAuthState.user);
  const [profile, setProfile] = useState<UserProfile | null>(cachedAuthState.profile);
  const [isAdmin, setIsAdmin] = useState(cachedAuthState.isAdmin);
  const [isOnboarded, setIsOnboarded] = useState(cachedAuthState.isOnboarded);
  const [initializationComplete, setInitializationComplete] = useState(cachedAuthState.initialized);
  
  const { loading, setLoading } = useAuthLoading(!cachedAuthState.initialized);

  // Handle session setup
  const handleSessionLoaded = useCallback((
    sessionUser: User | null, 
    sessionProfile: UserProfile | null, 
    adminStatus: boolean, 
    onboardedStatus: boolean
  ) => {
    console.log("Session loaded with user:", !!sessionUser);
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
    console.log("Auth state changed, user:", !!changedUser);
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
      await signIn(email, password);
      // Auth state change will set loading to false through the subscription
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
      // Auth state change will set loading to false
    } catch (error) {
      setLoading(false); // Make sure to set loading to false on error
      throw error;
    }
  };

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

import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth-context';
import { cachedAuthState } from './auth-state';
import { signIn, signUp, signOut, refreshProfile } from './auth-operations';
import { useAuthLoading } from './hooks/use-auth-loading';
import { useAuthSubscription } from './hooks/use-auth-subscription';
import { useInitialSession } from './hooks/use-initial-session';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedAuthState.user);
  const [profile, setProfile] = useState<UserProfile | null>(cachedAuthState.profile);
  const [isAdmin, setIsAdmin] = useState(cachedAuthState.isAdmin);
  const [isOnboarded, setIsOnboarded] = useState(cachedAuthState.isOnboarded);
  const [initializationComplete, setInitializationComplete] = useState(cachedAuthState.initialized);
  
  const { loading, setLoading } = useAuthLoading(!cachedAuthState.initialized);

  useEffect(() => {
    console.log("AuthProvider initialized with supabase client", {
      hasSupabase: !!supabase, 
      hasAuth: !!(supabase && supabase.auth)
    });
  }, []);

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
    setLoading(false);
  }, [setLoading]);

  useInitialSession(setLoading, handleSessionLoaded);

  const handleAuthChange = useCallback((changedUser: User | null, changedProfile: UserProfile | null) => {
    console.log("Auth state changed, user:", !!changedUser, "profile:", !!changedProfile);
    setUser(changedUser);
    setProfile(changedProfile);
    
    if (changedProfile) {
      const profileIsOnboarded = !!changedProfile.isOnboarded;
      setIsOnboarded(profileIsOnboarded);
      setIsAdmin(cachedAuthState.isAdmin);
    } else if (!changedUser) {
      setIsAdmin(false);
      setIsOnboarded(false);
    }
    
    setLoading(false);
  }, [setLoading]);

  useAuthSubscription(handleAuthChange);

  const handleRefreshProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await refreshProfile(user.id);
        
      if (profile) {
        console.log("Refreshed profile data:", profile);
        setProfile(profile as UserProfile);
        cachedAuthState.profile = profile as UserProfile;
        
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
      const result = await signIn(email, password);
      console.log("Sign in result:", !!result);
      
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        console.log("Sign in successful, setting user directly");
        setUser(data.session.user);
        cachedAuthState.user = data.session.user;
        
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileData) {
            console.log("Profile found in sign in process");
            setProfile(profileData as UserProfile);
            cachedAuthState.profile = profileData as UserProfile;
            setIsOnboarded(!!profileData.isOnboarded);
            cachedAuthState.isOnboarded = !!profileData.isOnboarded;
          }
        } catch (profileError) {
          console.error("Error fetching profile during sign in:", profileError);
        }
      }
      
      console.log("Sign in operation completed");
      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      setLoading(false);
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
    } catch (error) {
      console.error("Sign up error:", error);
      setLoading(false);
      throw error;
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setIsOnboarded(false);
      
      cachedAuthState.user = null;
      cachedAuthState.profile = null;
      cachedAuthState.isAdmin = false;
      cachedAuthState.isOnboarded = false;
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
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

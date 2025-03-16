
import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth-context';
import { cachedAuthState } from './auth-state';
import { signIn, signUp, signOut, refreshProfile } from './auth-operations';
import { useAuthLoading } from './hooks/use-auth-loading';
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
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [setLoading]);

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

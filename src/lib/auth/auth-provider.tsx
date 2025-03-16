
import React, { useState, useEffect, useRef } from 'react';
import { User, Subscription } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService, UserProfile } from '@/services/supabaseService';
import { AuthContext } from './auth-context';
import { cachedAuthState } from './auth-state';
import { signIn, signUp, signOut, refreshProfile } from './auth-operations';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedAuthState.user);
  const [profile, setProfile] = useState<UserProfile | null>(cachedAuthState.profile);
  const [loading, setLoading] = useState(!cachedAuthState.initialized);
  const [isAdmin, setIsAdmin] = useState(cachedAuthState.isAdmin);
  const [isOnboarded, setIsOnboarded] = useState(cachedAuthState.isOnboarded);
  const [initializationComplete, setInitializationComplete] = useState(cachedAuthState.initialized);
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);

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

  useEffect(() => {
    if (cachedAuthState.initialized) {
      console.log("Using cached auth state, skipping initialization");
      return;
    }

    console.log("Auth provider initialized");
    // Check for existing session on mount
    const getInitialSession = async () => {
      try {
        setLoading(true);
        console.log("Getting initial session...");
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session retrieved:", !!session);
        
        if (session?.user) {
          console.log("User found in session");
          setUser(session.user);
          cachedAuthState.user = session.user;
          
          // Get user profile
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profile) {
              console.log("Profile found");
              setProfile(profile as UserProfile);
              cachedAuthState.profile = profile as UserProfile;
              
              // Set onboarded status based on profile data
              const profileIsOnboarded = !!profile.isOnboarded;
              setIsOnboarded(profileIsOnboarded);
              cachedAuthState.isOnboarded = profileIsOnboarded;
            }
            
            // Check if user is admin
            const adminStatus = await authService.isAdmin();
            setIsAdmin(adminStatus);
            cachedAuthState.isAdmin = adminStatus;
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        } else {
          console.log("No user in session");
          // Clear cached state if no user
          cachedAuthState.user = null;
          cachedAuthState.profile = null;
          cachedAuthState.isAdmin = false;
          cachedAuthState.isOnboarded = false;
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
        setInitializationComplete(true);
        cachedAuthState.initialized = true;
        console.log("Auth initialization complete");
      }
    };

    getInitialSession();

    // Listen for auth changes - Fix the subscription handling
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setLoading(true);
        
        if (session?.user) {
          console.log("User found in auth change");
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
            
            // Check if user is admin
            const adminStatus = await authService.isAdmin();
            setIsAdmin(adminStatus);
            cachedAuthState.isAdmin = adminStatus;
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        } else {
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
        
        setLoading(false);
      }
    );

    // Store the subscription with proper unsubscribe method
    authSubscription.current = { unsubscribe: () => data.subscription.unsubscribe() };

    // Cleanup subscription
    return () => {
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
      }
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signIn(email, password);
    } finally {
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading: loading && !initializationComplete, // Only consider loading if initialization isn't complete
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


import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';
import { signIn, signUp, signOut, refreshProfile } from '../auth-operations';
import { cachedAuthState } from '../auth-state';
import { useAuthLoading } from './use-auth-loading';

export function useAuthOperations() {
  const [user, setUser] = useState<User | null>(cachedAuthState.user);
  const [profile, setProfile] = useState<UserProfile | null>(cachedAuthState.profile);
  const [isAdmin, setIsAdmin] = useState(cachedAuthState.isAdmin);
  const [isOnboarded, setIsOnboarded] = useState(cachedAuthState.isOnboarded);
  const [initializationComplete, setInitializationComplete] = useState(cachedAuthState.initialized);
  
  const { loading, setLoading } = useAuthLoading(!cachedAuthState.initialized);

  const handleRefreshProfile = async () => {
    if (!user) return;
    
    try {
      console.log("Refreshing profile data for user:", user.id);
      const profile = await refreshProfile(user.id);
        
      if (profile) {
        console.log("Refreshed profile data:", profile);
        setProfile(profile as UserProfile);
        cachedAuthState.profile = profile as UserProfile;
        
        const profileIsOnboarded = !!profile.isOnboarded;
        setIsOnboarded(profileIsOnboarded);
        cachedAuthState.isOnboarded = profileIsOnboarded;
        
        return profile;
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

  return {
    user,
    setUser,
    profile,
    setProfile,
    isAdmin,
    setIsAdmin,
    isOnboarded,
    setIsOnboarded,
    loading,
    setLoading,
    initializationComplete,
    setInitializationComplete,
    handleRefreshProfile,
    handleSignIn,
    handleSignUp,
    handleSignOut
  };
}

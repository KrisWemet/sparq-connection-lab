
import React, { createContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContext } from './auth-context';
import { useAuthOperations } from './hooks/use-auth-operations';
import { useInitialSession } from './hooks/use-initial-session';
import { useAuthSubscription } from './hooks/use-auth-subscription';
import { cachedAuthState } from './auth-state';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
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
  } = useAuthOperations();

  // Initialize session from localStorage and Supabase
  useInitialSession({
    setUser,
    setProfile,
    setIsAdmin,
    setIsOnboarded,
    setLoading,
    setInitializationComplete
  });

  // Set up auth state change subscription
  useAuthSubscription({
    setUser,
    setProfile,
    setIsAdmin,
    setIsOnboarded,
    setLoading
  });

  // Log auth state for debugging
  useEffect(() => {
    console.log("Auth Provider State:", { 
      isInitialized: initializationComplete,
      user: !!user, 
      profile: !!profile,
      isAdmin, 
      isOnboarded,
      loading 
    });
  }, [user, profile, isAdmin, isOnboarded, loading, initializationComplete]);

  // Make auth state available to app
  const value = {
    user,
    profile,
    isAdmin,
    isOnboarded,
    loading,
    handleRefreshProfile,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

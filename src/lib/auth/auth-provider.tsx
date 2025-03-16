
import React from 'react';
import { AuthContext } from './auth-context';
import { useAuthOperations } from './hooks/use-auth-operations';
import { useInitialSession } from './hooks/use-initial-session';
import { useAuthSubscription } from './hooks/use-auth-subscription';

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

  // Initialize session
  useInitialSession({
    setUser,
    setProfile,
    setIsOnboarded,
    setInitializationComplete,
    setLoading
  });

  // Subscribe to auth changes
  useAuthSubscription({
    setUser,
    setProfile,
    setIsAdmin,
    setIsOnboarded
  });

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

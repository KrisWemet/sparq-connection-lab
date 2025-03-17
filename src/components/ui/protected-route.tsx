
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { LoadingIndicator } from './loading-indicator';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  requiresOnboarding?: boolean;
}

/**
 * A wrapper component that protects routes from unauthenticated access
 */
export function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  requiresOnboarding = false
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isOnboarded } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log("Protected route state:", { 
      path: location.pathname,
      user: !!user, 
      loading, 
      isAdmin, 
      isOnboarded
    });
  }, [user, loading, isAdmin, isOnboarded, location.pathname]);

  // Set a timeout to prevent infinite loading - significantly reduced for better UX
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (loading && !loadingTimeout) {
      timeoutId = setTimeout(() => {
        console.log("Loading timeout reached for protected route");
        setLoadingTimeout(true);
      }, 800); // Reduced from 1500ms to 800ms for faster fallback
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, loadingTimeout]);

  // If we have a user, render the content immediately - don't wait for other checks
  if (user) {
    // For admin-only routes, check admin status
    if (adminOnly && !isAdmin) {
      console.log("Protected route: User not admin, redirecting to dashboard");
      return <Navigate to="/dashboard" replace />;
    }

    // Temporarily disable onboarding redirect
    // if (requiresOnboarding && !isOnboarded && location.pathname !== '/onboarding') {
    //   console.log("Protected route: User not onboarded, redirecting to onboarding");
    //   return <Navigate to="/onboarding" replace />;
    // }

    // If all checks passed, render the protected content
    console.log("Protected route: Rendering protected content");
    return <>{children}</>;
  }

  // If still loading but timeout not reached, show extremely lightweight loading state
  if (loading && !loadingTimeout) {
    console.log("Protected route: Still loading, waiting...");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingIndicator 
          size="sm"
          label="Loading..."
        />
      </div>
    );
  }

  // If loading timed out or no user found, redirect to login page
  console.log("Protected route: No user, redirecting to auth");
  // Save the attempted URL for redirecting after login
  sessionStorage.setItem('redirectUrl', location.pathname);
  return <Navigate to="/auth" replace />;
}

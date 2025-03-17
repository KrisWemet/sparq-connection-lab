
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

  // Set a timeout to prevent infinite loading - reduced to improve perceived performance
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (loading && !loadingTimeout) {
      timeoutId = setTimeout(() => {
        console.log("Loading timeout reached for protected route");
        setLoadingTimeout(true);
      }, 1500); // Reduced from 2000ms to 1500ms for faster fallback
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, loadingTimeout]);

  // If still loading but timeout not reached, show loading state
  if (loading && !loadingTimeout) {
    console.log("Protected route: Still loading, waiting...");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingIndicator 
          size="md"
          label="Almost ready..."
        />
      </div>
    );
  }

  // If loading timed out but we have a user, continue to render the page to prevent getting stuck
  if (loadingTimeout && user) {
    console.log("Protected route: Loading timeout reached, but user exists. Continuing to render.");
    return <>{children}</>;
  }

  // If not authenticated, redirect to login page
  if (!user) {
    console.log("Protected route: No user, redirecting to auth");
    // Save the attempted URL for redirecting after login
    sessionStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/auth" replace />;
  }

  // For admin-only routes, check admin status
  if (adminOnly && !isAdmin) {
    console.log("Protected route: User not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If onboarding is required and the user is not onboarded yet,
  // redirect to the onboarding page (but don't redirect if we're already on the onboarding page)
  if (requiresOnboarding && !isOnboarded && location.pathname !== '/onboarding') {
    console.log("Protected route: User not onboarded, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated, render the protected content
  console.log("Protected route: Rendering protected content");
  return <>{children}</>;
}

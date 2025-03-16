
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

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
  requiresOnboarding = true 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isOnboarded } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Add a timeout to prevent infinite loading - reduced to 1000ms (1 second)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("Protected route loading timeout reached");
        setLoadingTimeout(true);
      }
    }, 1000); // Very short timeout for faster experience
    
    return () => clearTimeout(timer);
  }, [loading]);

  // If loading times out, redirect to auth page
  if (loadingTimeout && !user) {
    console.log("Loading timed out, redirecting to auth page");
    sessionStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/auth" replace />;
  }

  // Only show loading state for a very brief moment
  if (loading && !loadingTimeout && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full inline-block"></div>
          <p className="text-gray-400 text-xs mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!user) {
    // Save the attempted URL for redirecting after login
    sessionStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/auth" replace />;
  }

  // For admin-only routes, check admin status
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If onboarding is required and the user is not onboarded yet,
  // redirect to the onboarding page (but don't redirect if we're already on the onboarding page)
  if (requiresOnboarding && !isOnboarded && location.pathname !== '/onboarding') {
    console.log("User not onboarded, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}

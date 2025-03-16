
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
  
  // Add a timeout to prevent infinite loading - reduced to 700ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("Protected route loading timeout reached");
        setLoadingTimeout(true);
      }
    }, 700); // Very short timeout for faster experience
    
    return () => clearTimeout(timer);
  }, [loading]);

  // If loading times out, redirect to auth page
  if ((loadingTimeout || loading) && !user) {
    console.log("Auth loading, redirecting to auth page");
    sessionStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/auth" replace />;
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

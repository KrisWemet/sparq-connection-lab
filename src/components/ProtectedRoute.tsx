
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
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false, 
  requiresOnboarding = false
}) => {
  const { user, loading, isAdmin, isOnboarded } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (loading && !loadingTimeout) {
      timeoutId = setTimeout(() => {
        console.log("Loading timeout reached for protected route");
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, loadingTimeout]);

  // If still loading but timeout not reached, show loading state
  if (loading && !loadingTimeout) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
          <p className="text-xs text-gray-400 mt-2">If this takes too long, try refreshing the page</p>
        </div>
      </div>
    );
  }

  // If loading timed out but we have a user, continue to render the page to prevent getting stuck
  if (loadingTimeout && user) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to login page
  if (!user) {
    sessionStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/auth" replace />;
  }

  // For admin-only routes, check admin status
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect non-onboarded users to onboarding (except the onboarding route itself)
  if (!isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;

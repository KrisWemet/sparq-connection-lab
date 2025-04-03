import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

/**
 * A wrapper component that protects routes from unauthenticated access
 */
export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin, profile } = useAuth();
  const location = useLocation();
  const isOnboardingRoute = location.pathname === '/onboarding';

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full inline-block mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to /auth");
    // Save the attempted URL for redirecting after login
    sessionStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/auth" replace />;
  }

  // Special case - if this is the onboarding route, allow access regardless of profile
  if (isOnboardingRoute) {
    console.log("ProtectedRoute: Allowing access to onboarding route");
    return <>{children}</>;
  }
  
  // If user has no profile, redirect to signup unless this is the onboarding route
  if (user && !profile) {
    console.log("ProtectedRoute: User exists but no profile, redirecting to /signup");
    return <Navigate to="/signup" replace />;
  }

  // For admin-only routes, check admin status
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
} 
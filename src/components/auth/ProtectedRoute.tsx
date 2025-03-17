
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      console.log('Protected route: No user found, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state with persuasive language
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-indigo-700 mb-2">Just a moment...</h2>
        <p className="text-gray-600 max-w-md text-center">
          Preparing your relationship journey
        </p>
      </div>
    );
  }

  // If no user and not loading, this will be briefly shown before redirect
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  console.log('Protected route: Rendering protected content');
  return <>{children}</>;
}

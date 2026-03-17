import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (loading && !loadingTimeout) {
      timeoutId = setTimeout(() => setLoadingTimeout(true), 800);
    }
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [loading, loadingTimeout]);

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectUrl', router.pathname);
      router.push('/login');
    }
  }, [user, loading, router]);

  if (user) return <>{children}</>;

  if (loading && !loadingTimeout) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return null;
}

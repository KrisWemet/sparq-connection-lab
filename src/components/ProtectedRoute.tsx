import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (loading && !loadingTimeout) {
      timeoutId = setTimeout(() => setLoadingTimeout(true), 5000);
    }
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [loading, loadingTimeout]);

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectUrl', router.pathname);
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading && !loadingTimeout) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (loadingTimeout && user) return <>{children}</>;
  if (!user) return null;

  return <>{children}</>;
};

export default ProtectedRoute;

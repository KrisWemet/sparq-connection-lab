import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';
import { PeterLoading } from '@/components/PeterLoading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  void adminOnly;
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
      <PeterLoading isLoading />
    );
  }

  if (loadingTimeout && user) return <>{children}</>;
  if (!user) return null;

  return <>{children}</>;
};

export default ProtectedRoute;

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export function useOnboardingRedirect(skipCheck = true) {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(!skipCheck);

  useEffect(() => {
    if (skipCheck || loading || !user) {
      setIsChecking(false);
      return;
    }

    // Deprecated compatibility hook: the real onboarding route now owns redirect decisions.
    setIsChecking(false);
  }, [skipCheck, loading, user]);

  return { isChecking };
}

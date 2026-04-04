import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { useAuth } from "@/lib/auth-context";

export function useAuthRedirect(redirectPath = "/dashboard") {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(authLoading);

  useEffect(() => {
    if (user) {
      router.replace(redirectPath);
    } else {
      setIsLoading(authLoading);
    }
  }, [authLoading, redirectPath, router, user]);

  return { isAuthLoading: authLoading || isLoading };
}

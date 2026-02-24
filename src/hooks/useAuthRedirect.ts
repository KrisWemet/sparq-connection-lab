
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function useAuthRedirect(redirectPath = "/dashboard") {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
      return;
    }

    // Only run the direct session check once, after auth finishes loading
    if (authLoading || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          navigate(redirectPath, { replace: true });
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate, redirectPath, user, authLoading]);

  return { isAuthLoading: authLoading || isLoading };
}

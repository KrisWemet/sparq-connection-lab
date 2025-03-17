
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function useAuthRedirect(redirectPath = "/dashboard") {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Debug auth state on each render
  console.log("Auth redirect hook - Auth state:", { 
    user, 
    authLoading, 
    isLoading 
  });
  
  // Check Supabase session directly - highly optimized
  useEffect(() => {
    // Immediately redirect if user is available - don't wait for any checks
    if (user) {
      console.log("User authenticated, redirecting immediately", user);
      navigate(redirectPath, { replace: true });
      return;
    }
    
    // Only proceed with session check if we're not already loading
    if (isLoading || authLoading) return;
    
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        console.log("Direct session check result:", !!data.session);
        
        if (data.session?.user) {
          console.log("Session exists, redirecting");
          navigate(redirectPath, { replace: true });
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Run immediately for faster response
    checkSession();
  }, [navigate, redirectPath, user, isLoading, authLoading]);

  return { isAuthLoading: authLoading || isLoading };
}

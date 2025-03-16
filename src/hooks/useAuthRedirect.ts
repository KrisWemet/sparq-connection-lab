
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { debugSupabaseInfo } from "@/lib/supabase";

export function useAuthRedirect(redirectPath = "/dashboard") {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Debug auth state on each render
  console.log("Auth redirect hook - Debug Supabase info:", debugSupabaseInfo);
  console.log("Auth redirect hook - Auth state:", { 
    user, 
    authLoading, 
    isLoading 
  });
  
  // Check Supabase session directly
  useEffect(() => {
    const checkSession = async () => {
      if (isLoading || authLoading) return; // Don't check if we're already loading
      
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Direct session check result:", !!data.session);
        
        if (data.session?.user) {
          console.log("Session exists, redirecting");
          // Always redirect to dashboard after login, not onboarding
          navigate(redirectPath, { replace: true });
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    
    checkSession();
  }, []);
  
  // Redirect if user is authenticated
  useEffect(() => {
    if (user) {
      console.log("User authenticated in useEffect, redirecting", user);
      // Always redirect to dashboard after login
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  return { isAuthLoading: authLoading || isLoading };
}

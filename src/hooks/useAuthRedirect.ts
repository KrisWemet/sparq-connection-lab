
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
  
  // Check Supabase session directly - highly optimized
  useEffect(() => {
    const checkSession = async () => {
      if (isLoading || authLoading) return; // Don't check if we're already loading
      
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Direct session check result:", !!data.session);
        
        if (data.session?.user) {
          console.log("Session exists, redirecting");
          // Navigate immediately without setting loading state to minimize delay
          navigate(redirectPath, { replace: true });
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    
    // Run immediately for faster response
    checkSession();
  }, [navigate, redirectPath, isLoading, authLoading]);
  
  // Redirect if user is authenticated - separate effect for better performance
  useEffect(() => {
    if (user) {
      console.log("User authenticated in useEffect, redirecting", user);
      // Always redirect to dashboard after login - immediate navigation
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  return { isAuthLoading: authLoading || isLoading };
}

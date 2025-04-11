import { supabase } from "@/integrations/supabase/client";

/**
 * Utility functions for authentication and authorization
 */

/**
 * Check if the current user has admin role
 * In development, this checks localStorage
 * In production, this would check Supabase user_roles
 */
export const isAdmin = async (): Promise<boolean> => {
  // For development, check localStorage first
  const localRole = localStorage.getItem("userRole");
  if (localRole === "admin") {
    return true;
  }
  
  // For production with Supabase integration
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // This would call the Supabase function is_admin in production
    // const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
    // if (error) throw error;
    // return !!data;
    
    // For demo, always use localStorage
    return localRole === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Get current authenticated user (or null if not authenticated)
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}; 

import { supabase } from '@/lib/supabase';
import { authService } from '@/services/supabaseService';

export async function signIn(email: string, password: string) {
  try {
    console.log("Attempting to sign in with email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Supabase sign in error:", error);
      throw error;
    }
    
    console.log("Sign in successful, got user:", !!data.user);
    
    // For development, also set localStorage values
    const isAdminUser = email.includes('admin@');
    localStorage.setItem('userRole', isAdminUser ? 'admin' : 'user');
    
    return data;
  } catch (error: any) {
    console.error('Error signing in:', error.message);
    throw error;
  }
}

export async function signUp(
  email: string, 
  password: string, 
  fullName: string, 
  gender = 'prefer-not-to-say', 
  relationshipType = 'monogamous'
): Promise<void> {
  try {
    await authService.signUp({
      email,
      password,
      fullName,
      gender: gender as any,
      relationshipType: relationshipType as any
    });
    
    // For development, also set localStorage values
    const isAdminUser = email.includes('admin@');
    localStorage.setItem('userRole', isAdminUser ? 'admin' : 'user');
  } catch (error: any) {
    console.error('Error signing up:', error.message);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
    
    // Clear localStorage values
    localStorage.removeItem('userRole');
  } catch (error: any) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}

export async function refreshProfile(userId: string) {
  try {
    console.log("Refreshing profile data for user:", userId);
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    console.log("Fetched profile:", profile);
    return profile;
  } catch (error) {
    console.error('Error refreshing profile:', error);
    throw error;
  }
}

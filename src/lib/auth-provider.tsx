
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService, UserProfile } from '@/services/supabaseService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, gender?: string, relationshipType?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    console.log("Auth provider initialized");
    // Check for existing session on mount
    const getInitialSession = async () => {
      try {
        setLoading(true);
        console.log("Getting initial session...");
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session retrieved:", !!session);
        
        if (session?.user) {
          console.log("User found in session");
          setUser(session.user);
          
          // Get user profile
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profile) {
              console.log("Profile found");
              setProfile(profile as UserProfile);
            }
            
            // Check if user is admin
            const adminStatus = await authService.isAdmin();
            setIsAdmin(adminStatus);
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        } else {
          console.log("No user in session");
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
        setInitializationComplete(true);
        console.log("Auth initialization complete");
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setLoading(true);
        
        if (session?.user) {
          console.log("User found in auth change");
          setUser(session.user);
          
          // Get user profile on auth change
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profile) {
              setProfile(profile as UserProfile);
            }
            
            // Check if user is admin
            const adminStatus = await authService.isAdmin();
            setIsAdmin(adminStatus);
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // For development, also set localStorage values
      const isAdminUser = email.includes('admin@');
      localStorage.setItem('userRole', isAdminUser ? 'admin' : 'user');
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    gender = 'prefer-not-to-say', 
    relationshipType = 'monogamous'
  ) => {
    try {
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      
      // Clear localStorage values
      localStorage.removeItem('userRole');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading: loading && !initializationComplete, // Only consider loading if initialization isn't complete
      signIn, 
      signUp, 
      signOut,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

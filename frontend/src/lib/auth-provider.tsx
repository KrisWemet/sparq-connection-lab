import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService, profileService, UserProfile } from '@/services/supabaseService';

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
  const navigate = useNavigate();

  // Helper function to force redirect to signup
  const redirectToSignup = () => {
    console.log('Forcing redirect to /signup');
    // Clear any existing user/profile state to prevent race conditions
    setUser(null);
    setProfile(null);
    // Use navigate instead of window.location.href to prevent full page reload
    navigate('/signup');
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Starting sign in process...');

      // Proceed with sign-in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Sign in failed:', error);
        throw error;
      }

      console.log('Sign in successful, checking for profile...');

      // Check if the user has a profile
      if (data.user) {
        // For development, set localStorage values
        const isAdminUser = email.includes('admin@');
        localStorage.setItem('userRole', isAdminUser ? 'admin' : 'user');

        const profile = await profileService.getProfileById(data.user.id);
        console.log('Profile check result:', profile ? 'Profile found' : 'No profile found');
        
        if (!profile) {
          // No profile found, redirect to signup
          console.log('No profile found during sign in, redirecting to /signup');
          // Clear any user data to prevent the Auth component from redirecting elsewhere
          setTimeout(() => {
            redirectToSignup();
          }, 100);
          return;
        }

        console.log('Profile exists, setting user state');
        // Only set the user state if we have a profile
        setProfile(profile);
        setUser(data.user);
        
        // Update admin status
        const adminStatus = await authService.isAdmin();
        setIsAdmin(adminStatus);
      }

      return;
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
      console.log('Starting signup process for:', email);

      let userId = null;
      let isNewUser = false;
      
      // First, try to authenticate with given credentials 
      console.log('Attempting to sign in to check if user exists...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error && data.user) {
        // User exists, we'll create a profile
        userId = data.user.id;
        console.log('User exists with id:', userId);
      } else {
        // Create new user
        console.log('Creating new user account...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (authError) {
          console.error('Error during auth signup:', authError);
          
          // If user already exists but wrong password
          if (authError.message.includes('already registered')) {
            throw new Error('This email is already registered. Please sign in with correct password or use the password reset feature.');
          }
          
          throw authError;
        }
        
        if (authData?.user) {
          userId = authData.user.id;
          isNewUser = true;
          // Set user state immediately to allow navigation
          setUser(authData.user);
          console.log('New user created with id:', userId);
        } else {
          console.error('No user data returned from signup');
          throw new Error('Account creation failed');
        }
      }
      
      // At this point, we have a userId, so we can create a profile
      if (userId) {
        try {
          console.log('Creating profile for user ID:', userId);
          
          // Create profile with all possible field names
          const profileData: any = {
            id: userId,
            email: email,
            full_name: fullName,
            name: fullName,
            username: fullName.toLowerCase().replace(/\s+/g, '.'),
            gender: gender,
            relationship_type: relationshipType
          };
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(profileData);
            
          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Continue anyway - we'll allow the onboarding to proceed
          } else {
            console.log('Profile created successfully');
          }
          
          // Try to create user role
          try {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: userId,
                role: 'user'
              });
              
            if (roleError) {
              console.error('Error creating user role:', roleError);
            } else {
              console.log('User role created successfully');
            }
          } catch (roleErr) {
            console.error('Error in role creation:', roleErr);
          }
        } catch (profileErr) {
          console.error('Error in profile creation process:', profileErr);
          // We'll continue anyway - don't block the flow
        }
        
        // For new users, we need to set the user state
        if (isNewUser) {
          // We already set the user state above for new users
          console.log('New user created, profile process attempted');
        } else {
          // For existing users, set the user state
          setUser(data.user);
          console.log('Existing user, profile process attempted');
        }
        
        // We'll set a minimal profile to allow navigation even if DB creation failed
        const minimalProfile: UserProfile = {
          id: userId,
          username: fullName.toLowerCase().replace(/\s+/g, '.'),
          email: email,
          gender: gender as any,
          relationshipType: relationshipType as any,
          subscriptionTier: 'free',
          isOnboarded: false,
          lastActive: new Date()
        };
        
        setProfile(minimalProfile);
        console.log('Setting minimal profile to allow navigation');
        
        // Set localStorage values for development
        const isAdminUser = email.includes('admin@');
        localStorage.setItem('userRole', isAdminUser ? 'admin' : 'user');
        
        console.log('Signup process completed, returning to caller');
        return;
      }
      
      throw new Error('Failed to create or identify user');
    } catch (error: any) {
      // Special handling for "User already registered" error
      if (error.message === 'User already registered' || error.message?.includes('already registered')) {
        console.log('User exists in auth but password may be wrong. Try password reset.');
        throw new Error('This email is already registered. Please use the password reset feature if you cannot remember your password.');
      }
      
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
      loading, 
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
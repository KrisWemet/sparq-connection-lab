import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getProfile, updateProfile, Profile as SupabaseProfile } from './supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

interface AuthUser extends User {
  profile?: SupabaseProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: SupabaseProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, userData: { name: string; partner_name?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<SupabaseProfile>) => Promise<boolean>;
  updateProfile: (profileData: Partial<SupabaseProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initial session and user fetch
  useEffect(() => {
    async function getInitialSession() {
      setLoading(true);

      // Get the current session
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      if (initialSession) {
        setSession(initialSession);
        await fetchUserData(initialSession.user);
      }

      setLoading(false);

      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('Auth state change:', event);
        setSession(newSession);

        if (newSession?.user) {
          await fetchUserData(newSession.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }

    getInitialSession();
  }, []);

  // Fetch user profile data
  async function fetchUserData(authUser: User) {
    if (!authUser?.id) return;

    try {
      // Fetch user profile
      const userProfile = await getProfile(authUser.id);
      
      if (userProfile) {
        // Create enhanced user object with profile
        const enhancedUser = {
          ...authUser,
          profile: userProfile
        };
        
        setUser(enhancedUser);
        setProfile(userProfile);
      } else {
        setUser(authUser);
        // If no profile exists but user is authenticated, create a basic profile
        const newProfile: Partial<SupabaseProfile> & { user_id: string } = {
          user_id: authUser.id,
          name: authUser.email?.split('@')[0] || 'User',
          streak_count: 0,
          last_activity_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        
        const profileSuccess = await updateProfile(newProfile);
        if (profileSuccess) {
          const createdProfile = await getProfile(authUser.id);
          if (createdProfile) {
            setProfile(createdProfile);
            setUser({
              ...authUser,
              profile: createdProfile
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUser(authUser);
    }
  }

  // Login with email and password
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        setError(signInError.message);
        console.error('Login error:', signInError);
        setLoading(false);
        return { success: false, error: signInError.message };
      }

      // Fetch user profile if sign-in successful
      if (data.user) {
        await fetchUserData(data.user);
      }
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during login';
      setError(errorMessage);
      console.error('Login error:', err);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Register a new user
  const register = async (
    email: string, 
    password: string, 
    userData: { name: string; partner_name?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (signUpError) {
        setError(signUpError.message);
        console.error('Registration error:', signUpError);
        setLoading(false);
        return { success: false, error: signUpError.message };
      }

      // Create user profile if sign-up successful
      if (data.user) {
        const newProfile: Partial<SupabaseProfile> & { user_id: string } = {
          user_id: data.user.id,
          name: userData.name,
          partner_name: userData.partner_name,
          streak_count: 0,
          last_activity_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          notification_preferences: {
            dailyReminders: true,
            weeklyRecap: true,
            achievementAlerts: true,
            partnerUpdates: false
          },
          preferred_activities: ['communication', 'quality-time']
        };

        const profileSuccess = await updateProfile(newProfile);
        
        if (profileSuccess) {
          // Get the complete profile
          const createdProfile = await getProfile(data.user.id);
          
          if (createdProfile) {
            // Create enhanced user object with profile
            const enhancedUser = {
              ...data.user,
              profile: createdProfile
            };
            
            setUser(enhancedUser);
            setProfile(createdProfile);
          } else {
            setUser(data.user);
          }
        } else {
          // Still set the user even if profile creation failed
          setUser(data.user);
          console.error('Failed to create user profile');
        }
      }
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during registration';
      setError(errorMessage);
      console.error('Registration error:', err);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile - Keeping the old method for backward compatibility
  const updateUserProfile = async (profileData: Partial<SupabaseProfile>): Promise<boolean> => {
    return updateProfileImpl(profileData);
  };
  
  // New method with clearer naming
  const updateProfileMethod = async (profileData: Partial<SupabaseProfile>): Promise<boolean> => {
    return updateProfileImpl(profileData);
  };
  
  // Implementation of profile update
  const updateProfileImpl = async (profileData: Partial<SupabaseProfile>): Promise<boolean> => {
    if (!user?.id) {
      setError('You must be logged in to update your profile');
      return false;
    }
    
    setLoading(true);
    
    try {
      const updateData = {
        ...profileData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };
      
      const success = await updateProfile(updateData);
      
      if (success) {
        // Fetch updated profile
        const updatedProfile = await getProfile(user.id);
        
        if (updatedProfile) {
          // Update local state
          setProfile(updatedProfile);
          setUser(current => current ? { ...current, profile: updatedProfile } : null);
        }
        
        setLoading(false);
        return true;
      } else {
        console.error('Failed to update profile');
        setError('Failed to update profile');
        setLoading(false);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while updating profile';
      setError(errorMessage);
      console.error('Profile update error:', err);
      setLoading(false);
      return false;
    }
  };

  // Check for and update streak count (call this when user completes an activity)
  const checkAndUpdateStreak = async () => {
    if (!user?.id || !profile) return;

    try {
      const today = new Date();
      const lastActivity = profile.last_activity_date ? new Date(profile.last_activity_date) : null;
      
      // Initialize or update streak count
      let newStreakCount = profile.streak_count || 0;
      
      if (!lastActivity) {
        // First activity ever - start streak at 1
        newStreakCount = 1;
      } else {
        // Calculate days between last activity and today
        const timeDiff = today.getTime() - lastActivity.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff === 0) {
          // Already did an activity today, no streak change
        } else if (daysDiff === 1) {
          // Consecutive day - increase streak
          newStreakCount += 1;
        } else if (daysDiff > 1) {
          // Streak broken - reset to 1
          newStreakCount = 1;
        }
      }
      
      // Update profile with new streak and last activity date
      await updateProfileImpl({
        streak_count: newStreakCount,
        last_activity_date: today.toISOString()
      });
      
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  };

  const contextValue: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    updateProfile: updateProfileMethod
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
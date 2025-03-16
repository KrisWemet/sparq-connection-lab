import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateUniqueCode } from '@/lib/utils';

// Type definitions for authentication
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  fullName: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  relationshipType?: 'monogamous' | 'polyamorous' | 'open' | 'long-distance';
}

// Update the UserProfile type to include the additional properties needed in the Profile component
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  partnerName?: string;
  anniversaryDate?: string;
  sexualOrientation?: string;
  relationshipStructure?: string;
  partnerId?: string;
  subscriptionTier: 'free' | 'premium' | 'platinum';
  subscriptionExpiry?: Date;
  isOnboarded: boolean;
  lastActive: Date;
  gender?: string;
}

export interface PartnerInvitation {
  id: string;
  recipientEmail: string;
  inviteCode: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
}

// Authentication Methods
export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: AuthCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  },

  /**
   * Sign up with email, password and profile data
   */
  async signUp(signUpData: SignUpData) {
    const { email, password, fullName, gender, relationshipType } = signUpData;
    
    try {
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData?.user) {
        // Create the user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: fullName,
            email,
            gender: gender || 'prefer-not-to-say',
            relationship_type: relationshipType || 'monogamous',
          });
          
        if (profileError) throw profileError;
        
        // Create user role (default to 'user')
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'user'
          });
          
        if (roleError) throw roleError;
      }
      
      return authData;
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
  },

  /**
   * Get the current logged in user
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error: any) {
      console.error('Error getting current user:', error.message);
      return null;
    }
  },

  /**
   * Check if the current user is an admin
   */
  async isAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      if (error) throw error;
      
      return !!data;
    } catch (error: any) {
      console.error('Error checking admin status:', error.message);
      return false;
    }
  },

  /**
   * Reset password for a user
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      console.error('Error resetting password:', error.message);
      toast.error(error.message || 'Failed to reset password');
      throw error;
    }
  },

  /**
   * Update password for the current user
   */
  async updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error.message);
      toast.error(error.message || 'Failed to update password');
      throw error;
    }
  }
};

// Profile Management Services
export const profileService = {
  /**
   * Get the current user's profile
   */
  async getCurrentProfile() {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      return transformProfile(data);
    } catch (error: any) {
      console.error('Error getting profile:', error.message);
      return null;
    }
  },
  
  /**
   * Update the current user's profile
   */
  async updateProfile(profile: Partial<UserProfile>) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName,
          gender: profile.gender,
          relationship_type: profile.relationshipType,
          avatar_url: profile.avatarUrl
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  },
  
  /**
   * Get a user's profile by ID
   */
  async getProfileById(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      return transformProfile(data);
    } catch (error: any) {
      console.error('Error getting profile by ID:', error.message);
      return null;
    }
  },
  
  /**
   * Get the partner's profile for the current user
   */
  async getPartnerProfile() {
    try {
      const profile = await this.getCurrentProfile();
      if (!profile || !profile.partnerId) return null;
      
      return this.getProfileById(profile.partnerId);
    } catch (error: any) {
      console.error('Error getting partner profile:', error.message);
      return null;
    }
  }
};

// Partner Connection Services
export const partnerService = {
  /**
   * Send a partner invitation
   */
  async sendInvitation(recipientEmail: string) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Generate a unique invite code
      const inviteCode = generateUniqueCode(8);
      
      const { error } = await supabase
        .from('partner_invitations')
        .insert({
          sender_id: user.id,
          recipient_email: recipientEmail,
          invite_code: inviteCode,
        });
        
      if (error) throw error;
      
      // In a real app, we would send an email here with the invite code
      toast.success(`Invitation sent to ${recipientEmail}`);
      return inviteCode;
    } catch (error: any) {
      console.error('Error sending invitation:', error.message);
      toast.error(error.message || 'Failed to send invitation');
      throw error;
    }
  },
  
  /**
   * Accept a partner invitation using an invite code
   */
  async acceptInvitation(inviteCode: string) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get the invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();
        
      if (inviteError || !invitation) throw new Error('Invalid or expired invitation code');
      
      // Update invitation status
      const { error: updateError } = await supabase
        .from('partner_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);
        
      if (updateError) throw updateError;
      
      // Get the sender profile
      const { data: senderProfile, error: senderError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', invitation.sender_id)
        .single();
        
      if (senderError || !senderProfile) throw new Error('Could not find partner profile');
      
      // Update both profiles to connect them
      const transactions = [];
      
      // Update current user's profile
      transactions.push(
        supabase
          .from('profiles')
          .update({ partner_id: invitation.sender_id })
          .eq('id', user.id)
      );
      
      // Update sender's profile
      transactions.push(
        supabase
          .from('profiles')
          .update({ partner_id: user.id })
          .eq('id', invitation.sender_id)
      );
      
      // Execute transactions
      const results = await Promise.all(transactions);
      
      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error;
      }
      
      toast.success('Successfully connected with your partner!');
      return true;
    } catch (error: any) {
      console.error('Error accepting invitation:', error.message);
      toast.error(error.message || 'Failed to connect with partner');
      throw error;
    }
  },
  
  /**
   * Get pending invitations for the current user
   */
  async getPendingInvitations() {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());
        
      if (error) throw error;
      
      return data.map(transformInvitation);
    } catch (error: any) {
      console.error('Error getting pending invitations:', error.message);
      return [];
    }
  }
};

// Journey Services
export const journeyService = {
  /**
   * Get all available journeys
   */
  async getAllJourneys() {
    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .order('title');
        
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error getting journeys:', error.message);
      return [];
    }
  },
  
  /**
   * Get a specific journey by ID
   */
  async getJourneyById(journeyId: string) {
    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .eq('id', journeyId)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error getting journey by ID:', error.message);
      return null;
    }
  },
  
  /**
   * Start a journey for the current user
   */
  async startJourney(journeyId: string) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Check if user already has this journey
      const { data: existingJourney } = await supabase
        .from('user_journeys')
        .select('*')
        .eq('user_id', user.id)
        .eq('journey_id', journeyId)
        .maybeSingle();
        
      if (existingJourney) {
        // If journey exists but is not active, reactivate it
        if (!existingJourney.is_active) {
          const { error } = await supabase
            .from('user_journeys')
            .update({ is_active: true })
            .eq('id', existingJourney.id);
            
          if (error) throw error;
          
          toast.success('Journey reactivated successfully!');
          return existingJourney.id;
        }
        
        // Journey already exists and is active
        toast.info('You have already started this journey');
        return existingJourney.id;
      }
      
      // Start a new journey
      const { data, error } = await supabase
        .from('user_journeys')
        .insert({
          user_id: user.id,
          journey_id: journeyId,
          progress: 0,
          is_active: true,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Journey started successfully!');
      return data.id;
    } catch (error: any) {
      console.error('Error starting journey:', error.message);
      toast.error(error.message || 'Failed to start journey');
      throw error;
    }
  },
  
  /**
   * Get questions for a specific journey
   */
  async getJourneyQuestions(journeyId: string) {
    try {
      const { data, error } = await supabase
        .from('journey_questions')
        .select('*')
        .eq('journey_id', journeyId)
        .order('sequence_number');
        
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error getting journey questions:', error.message);
      return [];
    }
  },
  
  /**
   * Submit a response to a journey question
   */
  async submitJourneyResponse(journeyId: string, questionId: string, answer: string, reflection?: string) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Save the response
      const { error } = await supabase
        .from('journey_responses')
        .insert({
          user_id: user.id,
          journey_id: journeyId,
          question_id: questionId,
          answer,
          reflection
        });
        
      if (error) throw error;
      
      // Update progress
      await this.updateJourneyProgress(journeyId);
      
      return true;
    } catch (error: any) {
      console.error('Error submitting journey response:', error.message);
      toast.error(error.message || 'Failed to submit response');
      throw error;
    }
  },
  
  /**
   * Update the progress of a journey
   */
  async updateJourneyProgress(journeyId: string) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get total questions for this journey
      const { data: questions, error: questionsError } = await supabase
        .from('journey_questions')
        .select('id')
        .eq('journey_id', journeyId);
        
      if (questionsError) throw questionsError;
      
      // Get answered questions
      const { data: responses, error: responsesError } = await supabase
        .from('journey_responses')
        .select('question_id')
        .eq('journey_id', journeyId)
        .eq('user_id', user.id);
        
      if (responsesError) throw responsesError;
      
      // Calculate progress
      const totalQuestions = questions.length;
      const answeredQuestions = new Set(responses.map(r => r.question_id)).size;
      const progress = totalQuestions > 0 
        ? Math.floor((answeredQuestions / totalQuestions) * 100)
        : 0;
      
      // Update user journey progress
      const { error } = await supabase
        .from('user_journeys')
        .update({ 
          progress,
          completed_at: progress === 100 ? new Date().toISOString() : null
        })
        .eq('user_id', user.id)
        .eq('journey_id', journeyId);
        
      if (error) throw error;
      
      // Log activity
      await logUserActivity('journey_progress_update', {
        journeyId,
        progress
      });
      
      return progress;
    } catch (error: any) {
      console.error('Error updating journey progress:', error.message);
      return null;
    }
  },
  
  /**
   * Get the current user's active journeys
   */
  async getUserActiveJourneys() {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_journeys')
        .select(`
          *,
          journey:journeys(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error getting user active journeys:', error.message);
      return [];
    }
  }
};

// Goals Service
export const goalService = {
  /**
   * Get goals for the current user
   */
  async getUserGoals() {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          milestones:goal_milestones(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error getting user goals:', error.message);
      return [];
    }
  },
  
  /**
   * Create a new goal
   */
  async createGoal(goal: {
    title: string;
    description?: string;
    category: string;
    dueDate?: string;
    milestones?: { title: string }[];
  }) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Create the goal
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          due_date: goal.dueDate,
          progress: 0,
          is_completed: false
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add milestones if provided
      if (goal.milestones && goal.milestones.length > 0) {
        const milestonesData = goal.milestones.map((milestone, index) => ({
          goal_id: data.id,
          title: milestone.title,
          sequence_number: index + 1,
          is_completed: false
        }));
        
        const { error: milestoneError } = await supabase
          .from('goal_milestones')
          .insert(milestonesData);
          
        if (milestoneError) throw milestoneError;
      }
      
      // Log activity
      await logUserActivity('goal_created', {
        goalId: data.id,
        title: goal.title,
        category: goal.category
      });
      
      toast.success('Goal created successfully!');
      return data.id;
    } catch (error: any) {
      console.error('Error creating goal:', error.message);
      toast.error(error.message || 'Failed to create goal');
      throw error;
    }
  },
  
  /**
   * Update a goal's progress
   */
  async updateGoalProgress(goalId: string, progress: number) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          progress,
          is_completed: progress === 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success('Goal progress updated!');
      return true;
    } catch (error: any) {
      console.error('Error updating goal progress:', error.message);
      toast.error(error.message || 'Failed to update goal progress');
      throw error;
    }
  },
  
  /**
   * Toggle a milestone's completion status
   */
  async toggleMilestone(milestoneId: string, isCompleted: boolean) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Update the milestone
      const { data, error } = await supabase
        .from('goal_milestones')
        .update({ is_completed: isCompleted })
        .eq('id', milestoneId)
        .select('goal_id')
        .single();
        
      if (error) throw error;
      
      // Update the goal's progress based on milestone completion
      const goalId = data.goal_id;
      
      // Get all milestones for this goal
      const { data: milestones, error: milestonesError } = await supabase
        .from('goal_milestones')
        .select('is_completed')
        .eq('goal_id', goalId);
        
      if (milestonesError) throw milestonesError;
      
      // Calculate progress percentage
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter(m => m.is_completed).length;
      const progress = Math.round((completedMilestones / totalMilestones) * 100);
      
      // Update goal progress
      await this.updateGoalProgress(goalId, progress);
      
      return true;
    } catch (error: any) {
      console.error('Error toggling milestone:', error.message);
      toast.error(error.message || 'Failed to update milestone');
      throw error;
    }
  }
};

// Admin Services
export const adminService = {
  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    try {
      const isAdminUser = await authService.isAdmin();
      if (!isAdminUser) throw new Error('Unauthorized access');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles:user_roles(role)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map((user: any) => ({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        gender: user.gender,
        relationshipType: user.relationship_type,
        subscriptionTier: user.subscription_tier,
        isOnboarded: user.is_onboarded,
        lastActive: user.last_active,
        role: user.roles?.[0]?.role || 'user',
        createdAt: user.created_at
      }));
    } catch (error: any) {
      console.error('Error getting all users:', error.message);
      toast.error(error.message || 'Failed to retrieve users');
      throw error;
    }
  },
  
  /**
   * Get system settings (admin only)
   */
  async getSystemSettings() {
    try {
      const isAdminUser = await authService.isAdmin();
      if (!isAdminUser) throw new Error('Unauthorized access');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
        
      if (error) throw error;
      
      // Transform to key-value object
      return data.reduce((acc: any, setting: any) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {});
    } catch (error: any) {
      console.error('Error getting system settings:', error.message);
      return {};
    }
  },
  
  /**
   * Update system settings (admin only)
   */
  async updateSystemSettings(settings: Record<string, any>) {
    try {
      const isAdminUser = await authService.isAdmin();
      if (!isAdminUser) throw new Error('Unauthorized access');
      
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .update({ setting_value: update.setting_value })
          .eq('setting_key', update.setting_key);
          
        if (error) throw error;
      }
      
      toast.success('System settings updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating system settings:', error.message);
      toast.error(error.message || 'Failed to update system settings');
      throw error;
    }
  },
  
  /**
   * Get user statistics for the admin dashboard
   */
  async getUserStats() {
    try {
      const isAdminUser = await authService.isAdmin();
      if (!isAdminUser) throw new Error('Unauthorized access');
      
      // Get total users count
      const { count: totalUsers, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
      // Get active users (active in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', sevenDaysAgo.toISOString());
        
      if (activeError) throw activeError;
      
      // Get premium users count
      const { count: premiumUsers, error: premiumError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('subscription_tier', ['premium', 'platinum']);
        
      if (premiumError) throw premiumError;
      
      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        premiumUsers: premiumUsers || 0
      };
    } catch (error: any) {
      console.error('Error getting user stats:', error.message);
      return {
        totalUsers: 0,
        activeUsers: 0,
        premiumUsers: 0
      };
    }
  }
};

// Helper function to log user activity
export async function logUserActivity(activityType: string, details: any = {}) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) return;
    
    await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        details,
        session_id: generateSessionId()
      });
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
}

// Helper function to generate a session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper functions to transform database records to frontend models
// Update the transformProfile function to properly map database fields to the UserProfile interface
function transformProfile(data: any): UserProfile {
  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    avatarUrl: data.avatar_url,
    gender: data.gender,
    relationshipStructure: data.relationship_structure,
    partnerId: data.partner_id,
    partnerName: data.partner_name,
    anniversaryDate: data.anniversary_date,
    sexualOrientation: data.sexual_orientation,
    subscriptionTier: data.subscription_tier || 'free',
    subscriptionExpiry: data.subscription_expiry ? new Date(data.subscription_expiry) : undefined,
    isOnboarded: !!data.isOnboarded,
    lastActive: new Date(data.last_active || data.updated_at || data.created_at || Date.now())
  };
}

function transformInvitation(data: any): PartnerInvitation {
  return {
    id: data.id,
    recipientEmail: data.recipient_email,
    inviteCode: data.invite_code,
    status: data.status,
    expiresAt: new Date(data.expires_at)
  };
}

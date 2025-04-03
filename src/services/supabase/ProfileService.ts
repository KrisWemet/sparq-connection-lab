import { BaseService } from './BaseService';
import { UserProfile, transformProfile } from './types';
import { ProfileUpdate } from '@/integrations/supabase/types';
import { authService } from './AuthService';

/**
 * Service for handling user profile operations
 */
export class ProfileService extends BaseService {
  /**
   * Get the current user's profile
   */
  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return null;
      
      // Use the same approach as getProfileById to avoid recursion
      return this.getProfileById(user.id);
    } catch (error: unknown) {
      console.error('Error getting profile:', error);
      return null;
    }
  }
  
  /**
   * Update the current user's profile
   */
  async updateProfile(username: string): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await this.supabase
        .from('profiles')
        .update<ProfileUpdate>({ username: username })
        .eq('id', user.id);
        
      if (error) throw error;
      
      return true;
    } catch (error: unknown) {
      console.error("Failed to update profile", error);
      return false;
    }
  }
  
  /**
   * Get a user's profile by ID
   */
  async getProfileById(userId: string, retryCount = 0): Promise<UserProfile | null> {
    try {
      console.log('Fetching profile for user ID:', userId);
      
      // First, check what columns are available in the profiles table
      // This makes our code resilient to schema changes
      const { data: profileData, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          console.log('No profile found for user ID:', userId);
          
          // Retry up to 3 times with exponential backoff if this is a new account
          if (retryCount < 3) {
            console.log(`Retrying profile fetch (attempt ${retryCount + 1} of 3)...`);
            const delay = 500 * Math.pow(2, retryCount);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.getProfileById(userId, retryCount + 1);
          }
          
          return null;
        }
        throw error;
      }
      
      if (!profileData) {
        console.log('No profile data returned for user ID:', userId);
        return null;
      }
      
      console.log('Profile data found:', profileData);
      return transformProfile(profileData);
    } catch (error: unknown) {
      console.error("Error getting profile by ID", error);
      // Retry on errors if this isn't the last retry
      if (retryCount < 2) {
        console.log(`Retrying profile fetch after error (attempt ${retryCount + 1} of 3)...`);
        const delay = 500 * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.getProfileById(userId, retryCount + 1);
      }
      return null;
    }
  }
  
  /**
   * Get the partner's profile for the current user
   */
  async getPartnerProfile(): Promise<UserProfile | null> {
    try {
      const profile = await this.getCurrentProfile();
      if (!profile || !profile.partnerId) return null;
      
      return this.getProfileById(profile.partnerId);
    } catch (error: unknown) {
      console.error("Error getting partner profile", error);
      return null;
    }
  }
}

// Export a singleton instance
export const profileService = new ProfileService();
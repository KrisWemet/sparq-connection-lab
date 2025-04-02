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
  async getProfileById(userId: string): Promise<UserProfile | null> {
    try {
      // Use direct query with absolute minimum fields to avoid errors
      // Only select the most basic columns that must exist
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      return transformProfile(data);
    } catch (error: unknown) {
      console.error("Error getting profile by ID", error);
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
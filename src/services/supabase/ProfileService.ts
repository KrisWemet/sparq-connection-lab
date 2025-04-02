import { BaseService } from './BaseService';
import { UserProfile, transformProfile } from './types';
import { authService } from './AuthService';

/**
 * Service for handling user profile operations
 */
export class ProfileService extends BaseService {
  /**
   * Get the current user's profile
   */
  async getCurrentProfile() {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return null;
      
      // Use the same approach as getProfileById to avoid recursion
      return this.getProfileById(user.id);
    } catch (error: any) {
      console.error('Error getting profile:', error.message);
      return null;
    }
  }
  
  /**
   * Update the current user's profile
   */
  async updateProfile(profile: Partial<UserProfile>) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Ultra-minimal approach: only update the name field
      // This should work as long as the profiles table exists and has a name column
      const { error } = await this.supabase
        .from('profiles')
        .update({
          full_name: profile.fullName
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      return this.handleError(error, 'Failed to update profile');
    }
  }
  
  /**
   * Get a user's profile by ID
   */
  async getProfileById(userId: string) {
    try {
      // Use direct query with absolute minimum fields to avoid errors
      // Only select the most basic columns that must exist
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      return transformProfile(data);
    } catch (error: any) {
      console.error('Error getting profile by ID:', error.message);
      return null;
    }
  }
  
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
}

// Export a singleton instance
export const profileService = new ProfileService();
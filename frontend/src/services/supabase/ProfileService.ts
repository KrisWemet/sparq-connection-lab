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
  async updateProfile(profileData: {
    name: string, 
    anniversary_date?: string | null, 
    phone_number?: string | null
  }): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      console.log('Updating profile with data:', profileData);

      // Map the frontend field names to database column names
      const dbProfileData: Record<string, any> = {};
      
      // Handle the name field - map to full_name or username depending on schema
      if (profileData.name) {
        dbProfileData.full_name = profileData.name;
        dbProfileData.username = profileData.name; // Update both for compatibility
      }
      
      // Handle anniversary date if provided
      if (profileData.anniversary_date !== undefined) {
        dbProfileData.anniversary_date = profileData.anniversary_date;
      }
      
      // Handle phone number if provided
      if (profileData.phone_number !== undefined) {
        dbProfileData.phone_number = profileData.phone_number;
      }
      
      console.log('Mapped to database fields:', dbProfileData);

      // Update the profile fields
      const { error } = await this.supabase
        .from('profiles')
        .update(dbProfileData)
        .eq('id', user.id);
        
      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      
      console.log('Profile updated successfully');
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
      
      // Try to create a profile if it doesn't exist
      if (retryCount === 2) {
        try {
          console.log('Attempting to create profile for user ID:', userId);
          const { error: insertError } = await this.supabase
            .from('profiles')
            .insert({
              id: userId,
              name: 'Default Name',
              email: 'user@example.com',
              created_at: new Date(),
              updated_at: new Date(),
              isonboarded: true,
              relationship_level: 'beginner',
              relationship_points: 0,
              streak_count: 0
            });
            
          if (insertError) {
            console.log('Failed to create profile:', insertError);
          } else {
            console.log('Created new profile for user');
          }
        } catch (insertErr) {
          console.error('Error creating profile:', insertErr);
        }
      }
      
      // Modified query to handle potential issues
      const { data: profileData, error } = await this.supabase
        .from('profiles')
        .select('*')
        .filter('id', 'eq', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Profile fetch error:', error);
        
        // Retry up to 3 times with exponential backoff if this is a new account
        if (retryCount < 3) {
          console.log(`Retrying profile fetch (attempt ${retryCount + 1} of 3)...`);
          const delay = 500 * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.getProfileById(userId, retryCount + 1);
        }
        
        return null;
      }
      
      if (!profileData) {
        console.log('No profile data returned for user ID:', userId);
        
        // Create minimal profile when all attempts fail
        if (retryCount === 2) {
          console.log('Creating minimal profile object for UI');
          const minimalProfile: UserProfile = {
            id: userId,
            username: 'Default Name',
            email: 'user@example.com',
            gender: 'prefer-not-to-say',
            relationshipType: 'monogamous',
            subscriptionTier: 'free',
            isOnboarded: true,
            lastActive: new Date()
          };
          return minimalProfile;
        }
        
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
      
      // Create minimal profile when all attempts fail
      console.log('Creating minimal profile object after errors');
      const minimalProfile: UserProfile = {
        id: userId,
        username: 'Default Name',
        email: 'user@example.com',
        gender: 'prefer-not-to-say',
        relationshipType: 'monogamous',
        subscriptionTier: 'free',
        isOnboarded: true,
        lastActive: new Date()
      };
      return minimalProfile;
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
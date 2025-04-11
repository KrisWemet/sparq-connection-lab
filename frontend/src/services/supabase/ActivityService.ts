import { BaseService } from './BaseService';
import { authService } from './AuthService';

/**
 * Service for handling user activity logging
 */
export class ActivityService extends BaseService {
  /**
   * Log a user activity
   */
  async logUserActivity(activityType: string, details: any = {}) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;
      
      await this.supabase
        .from('activities')
        .insert({
          user_id: user.id,
          type: activityType,
          content_id: this.generateSessionId(),
          notes: JSON.stringify(details)
        });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }
}

// Export a singleton instance
export const activityService = new ActivityService();
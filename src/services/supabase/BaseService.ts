import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Base service class that provides common functionality for all Supabase services
 */
export class BaseService {
  protected supabase = supabase;
  
  /**
   * Handle errors consistently across services
   */
  protected handleError(error: any, customMessage?: string): never {
    const errorMessage = error.message || customMessage || 'An unexpected error occurred';
    console.error(`Service error: ${errorMessage}`, error);
    toast.error(errorMessage);
    throw error;
  }
  
  /**
   * Log user activity
   */
  protected async logActivity(userId: string, activityType: string, details: any = {}) {
    try {
      await this.supabase
        .from('activities')
        .insert({
          user_id: userId,
          type: activityType,
          title: `${activityType} activity`,
          description: JSON.stringify(details),
          content_id: this.generateSessionId()
        });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }
  
  /**
   * Generate a random session ID
   */
  protected generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
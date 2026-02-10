import { BaseService } from './BaseService';
import { authService } from './AuthService';
import type { UserStreak } from '@/types/streaks';

/**
 * Service for handling streak tracking operations
 */
export class StreakService extends BaseService {
  /**
   * Get or create streak record for current user
   */
  async getUserStreak(): Promise<UserStreak | null> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return null;

      const { data, error } = await this.supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no record found, create one
        if (error.code === 'PGRST116') {
          return this.createStreakRecord(user.id);
        }
        throw error;
      }

      return this.transformStreakData(data);
    } catch (error: any) {
      console.error('Error getting user streak:', error.message);
      return null;
    }
  }

  /**
   * Create a new streak record for user
   */
  private async createStreakRecord(userId: string): Promise<UserStreak | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: null,
          streak_start_date: null,
        })
        .select()
        .single();

      if (error) throw error;

      return data ? this.transformStreakData(data) : null;
    } catch (error: any) {
      console.error('Error creating streak record:', error.message);
      return null;
    }
  }

  /**
   * Update streak after activity
   */
  async updateStreak(): Promise<{ streak: UserStreak | null; streakIncreased: boolean }> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Get current streak
      let streak = await this.getUserStreak();
      if (!streak) {
        streak = await this.createStreakRecord(user.id);
      }
      if (!streak) throw new Error('Failed to get or create streak');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
      if (lastActivity) {
        lastActivity.setHours(0, 0, 0, 0);
      }

      let newStreak = streak.currentStreak;
      let streakIncreased = false;
      let streakStartDate = streak.streakStartDate;

      if (!lastActivity) {
        // First activity ever
        newStreak = 1;
        streakIncreased = true;
        streakStartDate = today.toISOString();
      } else {
        const diffTime = today.getTime() - lastActivity.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Already logged today, no change
          newStreak = streak.currentStreak;
        } else if (diffDays === 1) {
          // Consecutive day - streak continues
          newStreak = streak.currentStreak + 1;
          streakIncreased = true;
        } else {
          // Streak broken - start over
          newStreak = 1;
          streakIncreased = true;
          streakStartDate = today.toISOString();
        }
      }

      const newLongestStreak = Math.max(streak.longestStreak, newStreak);

      // Update in database
      const { data, error } = await this.supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today.toISOString(),
          streak_start_date: streakStartDate,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return {
        streak: data ? this.transformStreakData(data) : null,
        streakIncreased,
      };
    } catch (error: any) {
      console.error('Error updating streak:', error.message);
      return { streak: null, streakIncreased: false };
    }
  }

  /**
   * Transform database record to UserStreak type
   */
  private transformStreakData(data: any): UserStreak {
    return {
      id: data.id,
      userId: data.user_id,
      currentStreak: data.current_streak || 0,
      longestStreak: data.longest_streak || 0,
      lastActivityDate: data.last_activity_date,
      streakStartDate: data.streak_start_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// Export singleton instance
export const streakService = new StreakService();

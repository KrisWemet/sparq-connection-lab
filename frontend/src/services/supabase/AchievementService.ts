import { BaseService } from './BaseService';
import { authService } from './AuthService';
import { streakService } from './StreakService';
import type { 
  Achievement, 
  AchievementDefinition, 
  AchievementCheckData 
} from '@/types/streaks';
import { ACHIEVEMENT_DEFINITIONS } from '@/types/streaks';

/**
 * Service for handling achievement operations
 */
export class AchievementService extends BaseService {
  /**
   * Get all achievements for current user
   */
  async getUserAchievements(): Promise<Achievement[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return [];

      const { data, error } = await this.supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('awarded_at', { ascending: false });

      if (error) throw error;

      return data ? data.map(this.transformAchievementData) : [];
    } catch (error: any) {
      console.error('Error getting user achievements:', error.message);
      return [];
    }
  }

  /**
   * Check if user has a specific achievement
   */
  async hasAchievement(achievementId: string): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return false;

      const { data, error } = await this.supabase
        .from('achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('id', achievementId)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    } catch (error: any) {
      console.error('Error checking achievement:', error.message);
      return false;
    }
  }

  /**
   * Award an achievement to the current user
   */
  async awardAchievement(achievementId: string): Promise<Achievement | null> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already awarded
      const hasIt = await this.hasAchievement(achievementId);
      if (hasIt) return null;

      // Get achievement definition
      const definition = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
      if (!definition) throw new Error('Achievement definition not found');

      // Award the achievement
      const { data, error } = await this.supabase
        .from('achievements')
        .insert({
          id: achievementId,
          user_id: user.id,
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          type: definition.category,
          awarded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data ? this.transformAchievementData(data) : null;
    } catch (error: any) {
      console.error('Error awarding achievement:', error.message);
      return null;
    }
  }

  /**
   * Check and award achievements based on current data
   */
  async checkAndAwardAchievements(data: AchievementCheckData): Promise<Achievement[]> {
    const newlyAwarded: Achievement[] = [];

    for (const definition of ACHIEVEMENT_DEFINITIONS) {
      const hasIt = await this.hasAchievement(definition.id);
      if (!hasIt && definition.condition(data)) {
        const awarded = await this.awardAchievement(definition.id);
        if (awarded) {
          newlyAwarded.push(awarded);
        }
      }
    }

    return newlyAwarded;
  }

  /**
   * Get achievement progress for all achievements
   */
  async getAchievementProgress(data: AchievementCheckData): Promise<{
    definition: AchievementDefinition;
    earned: boolean;
    progress: number;
    awardedAt: string | null;
  }[]> {
    const user = await authService.getCurrentUser();
    if (!user) return [];

    const userAchievements = await this.getUserAchievements();
    const achievementMap = new Map(userAchievements.map(a => [a.id, a]));

    return ACHIEVEMENT_DEFINITIONS.map(definition => {
      const earned = achievementMap.has(definition.id);
      const userAchievement = achievementMap.get(definition.id);
      
      return {
        definition,
        earned,
        progress: definition.progress ? definition.progress(data) : (earned ? 1 : 0),
        awardedAt: userAchievement?.awardedAt || null,
      };
    });
  }

  /**
   * Award achievement after session completion
   */
  async checkSessionAchievements(sessionCount: number, categoriesCompleted: string[]): Promise<Achievement[]> {
    const streak = await streakService.getUserStreak();
    
    const data: AchievementCheckData = {
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      sessionsCompleted: sessionCount,
      categoriesCompleted,
      day14Viewed: false, // Will be updated separately
      answersShared: 0, // Will be updated separately
      phasesCompleted: [], // Will be updated separately
    };

    return this.checkAndAwardAchievements(data);
  }

  /**
   * Transform database record to Achievement type
   */
  private transformAchievementData(data: any): Achievement {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      type: data.type,
      awardedAt: data.awarded_at,
      createdAt: data.created_at,
    };
  }
}

// Export singleton instance
export const achievementService = new AchievementService();

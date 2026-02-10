import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { achievementService } from '@/services/supabase';
import type { 
  Achievement, 
  AchievementDefinition, 
  AchievementCheckData 
} from '@/types/streaks';
import { ACHIEVEMENT_DEFINITIONS } from '@/types/streaks';
import { toast } from '@/hooks/use-toast';

interface AchievementProgress {
  definition: AchievementDefinition;
  earned: boolean;
  progress: number;
  awardedAt: string | null;
}

interface UseAchievementsReturn {
  achievements: Achievement[];
  progress: AchievementProgress[];
  loading: boolean;
  error: string | null;
  refetchAchievements: () => Promise<void>;
  awardAchievement: (achievementId: string) => Promise<Achievement | null>;
  checkAchievements: (data: AchievementCheckData) => Promise<Achievement[]>;
  getProgressByCategory: (category: string) => AchievementProgress[];
}

/**
 * Custom hook to fetch and manage user achievements
 */
export function useAchievements(): UseAchievementsReturn {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setAchievements([]);
      setProgress([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const achievementsData = await achievementService.getUserAchievements();
      setAchievements(achievementsData);

      // Initialize progress for all achievements
      const initialProgress = ACHIEVEMENT_DEFINITIONS.map(def => ({
        definition: def,
        earned: achievementsData.some(a => a.id === def.id),
        progress: 0,
        awardedAt: achievementsData.find(a => a.id === def.id)?.awardedAt || null,
      }));
      setProgress(initialProgress);
    } catch (err: any) {
      console.error('Error fetching achievements:', err);
      setError(err.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const awardAchievement = useCallback(async (achievementId: string): Promise<Achievement | null> => {
    if (!user) return null;

    try {
      const awarded = await achievementService.awardAchievement(achievementId);
      if (awarded) {
        setAchievements(prev => [awarded, ...prev]);
        setProgress(prev => prev.map(p => 
          p.definition.id === achievementId 
            ? { ...p, earned: true, progress: p.definition.maxProgress || 1, awardedAt: awarded.awardedAt }
            : p
        ));
        
        toast({
          title: '🏆 Achievement Unlocked!',
          description: `${awarded.title}: ${awarded.description}`,
        });
      }
      return awarded;
    } catch (err: any) {
      console.error('Error awarding achievement:', err);
      return null;
    }
  }, [user]);

  const checkAchievements = useCallback(async (data: AchievementCheckData): Promise<Achievement[]> => {
    if (!user) return [];

    try {
      const newlyAwarded = await achievementService.checkAndAwardAchievements(data);
      
      if (newlyAwarded.length > 0) {
        setAchievements(prev => [...newlyAwarded, ...prev]);
        
        // Show toast for each new achievement
        newlyAwarded.forEach(achievement => {
          toast({
            title: '🏆 Achievement Unlocked!',
            description: `${achievement.title}: ${achievement.description}`,
          });
        });
      }

      // Update progress
      const updatedProgress = await achievementService.getAchievementProgress(data);
      setProgress(updatedProgress);

      return newlyAwarded;
    } catch (err: any) {
      console.error('Error checking achievements:', err);
      return [];
    }
  }, [user]);

  const getProgressByCategory = useCallback((category: string): AchievementProgress[] => {
    return progress.filter(p => p.definition.category === category);
  }, [progress]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    progress,
    loading,
    error,
    refetchAchievements: fetchAchievements,
    awardAchievement,
    checkAchievements,
    getProgressByCategory,
  };
}

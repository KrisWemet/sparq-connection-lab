import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { streakService } from '@/services/supabase';
import type { UserStreak } from '@/types/streaks';
import { toast } from '@/hooks/use-toast';

interface UseStreaksReturn {
  streak: UserStreak | null;
  loading: boolean;
  error: string | null;
  refetchStreak: () => Promise<void>;
  updateStreak: () => Promise<{ streak: UserStreak | null; streakIncreased: boolean }>;
}

/**
 * Custom hook to fetch and manage user streaks
 */
export function useStreaks(): UseStreaksReturn {
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = useCallback(async () => {
    if (!user) {
      setStreak(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const streakData = await streakService.getUserStreak();
      setStreak(streakData);
    } catch (err: any) {
      console.error('Error fetching streak:', err);
      setError(err.message || 'Failed to load streak data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateStreak = useCallback(async () => {
    if (!user) {
      return { streak: null, streakIncreased: false };
    }

    try {
      const result = await streakService.updateStreak();
      if (result.streak) {
        setStreak(result.streak);
        
        if (result.streakIncreased) {
          toast({
            title: '🔥 Streak Updated!',
            description: `You're on a ${result.streak.currentStreak}-day streak! Keep it up!`,
          });
        }
      }
      return result;
    } catch (err: any) {
      console.error('Error updating streak:', err);
      toast({
        title: 'Error',
        description: 'Failed to update streak',
        variant: 'destructive',
      });
      return { streak: null, streakIncreased: false };
    }
  }, [user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streak,
    loading,
    error,
    refetchStreak: fetchStreak,
    updateStreak,
  };
}

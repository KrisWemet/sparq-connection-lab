import { useState, useEffect, useCallback } from 'react';
import {
  profileService,
  sharedEventService,
  goalService,
  promptService,
} from '@/services/supabase';
import type {
  UserProfile,
  SharedEvent,
  Goal,
  CommunicationPrompt,
} from '@/services/supabase/types';

interface UseDashboardDataReturn {
  profile: UserProfile | null;
  events: SharedEvent[];
  goals: Goal[];
  dailyPrompt: CommunicationPrompt | null;
  loading: boolean;
  error: Error | null;
  refetchData: () => void;
}

/**
 * Custom hook to fetch and manage core dashboard data.
 * Fetches profile, events, goals, and a daily prompt.
 * Manages loading and error states.
 */
export const useDashboardData = (): UseDashboardDataReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<SharedEvent[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dailyPrompt, setDailyPrompt] = useState<CommunicationPrompt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile, events, goals, and a random prompt concurrently
      const [profileData, eventsData, goalsData, promptResult] = await Promise.all([
        profileService.getCurrentProfile(),
        sharedEventService.getSharedEvents(),
        goalService.getUserGoals(),
        promptService.getRandomPrompt(),
      ]);

      setProfile(profileData || null); // Ensure profile is null if not found
      setEvents(eventsData || []);
      setGoals(goalsData || []);
      setDailyPrompt(promptResult || null);

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      // Set the error state with the actual error object
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      // Optionally, use toast notifications here if desired, but keep hook logic clean
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies, fetchData itself doesn't change

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run fetchData on mount and if fetchData identity changes (though it shouldn't here)

  return {
    profile,
    events,
    goals,
    dailyPrompt,
    loading,
    error,
    refetchData: fetchData, // Expose the fetchData function for manual refetching
  };
};
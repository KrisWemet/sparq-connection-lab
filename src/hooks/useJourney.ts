import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Journey, UserJourneyProgress, JourneyActivity } from '../types/journey';
import { 
  getJourneyById, 
  getUserJourneyProgress, 
  updateUserJourneyProgress,
  saveActivityResponse 
} from '../services/supabase';
import { useAuth } from './useAuth';

interface UseJourneyReturn {
  journey: Journey | null;
  progress: UserJourneyProgress | null;
  currentActivity: JourneyActivity | null;
  loading: boolean;
  error: string | null;
  completeActivity: (activityId: string) => Promise<void>;
  saveResponse: (questionId: string, answer: string, answeredBy: 'user' | 'partner') => Promise<void>;
  moveToNextDay: () => Promise<void>;
}

export function useJourney(journeyId: string): UseJourneyReturn {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [progress, setProgress] = useState<UserJourneyProgress | null>(null);
  const [currentActivity, setCurrentActivity] = useState<JourneyActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function loadJourneyData() {
      if (!journeyId || !user) return;

      try {
        setLoading(true);
        
        // Load journey data
        const journeyData = await getJourneyById(journeyId);
        if (!journeyData) {
          setError('Journey not found');
          return;
        }
        setJourney(journeyData);

        // Load user's progress
        const progressData = await getUserJourneyProgress(user.id, journeyId);
        if (progressData) {
          setProgress(progressData);
          
          // Find current activity based on progress
          const currentPhase = journeyData.phases.find(phase => {
            const [start, end] = phase.days.match(/\d+/g)?.map(Number) || [1, 1];
            return progressData.currentDay >= start && progressData.currentDay <= end;
          });
          
          if (currentPhase) {
            setCurrentActivity(currentPhase.activities[0]); // For now, just get first activity
          }
        } else {
          // Initialize new progress
          const newProgress: UserJourneyProgress = {
            userId: user.id,
            journeyId,
            currentDay: 1,
            completedActivities: [],
            startedAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString()
          };
          await updateUserJourneyProgress(user.id, journeyId, newProgress);
          setProgress(newProgress);
          
          // Set first activity
          if (journeyData.phases[0]) {
            setCurrentActivity(journeyData.phases[0].activities[0]);
          }
        }
      } catch (err) {
        console.error('Error loading journey:', err);
        setError('Failed to load journey data');
      } finally {
        setLoading(false);
      }
    }

    loadJourneyData();
  }, [journeyId, user]);

  const completeActivity = async (activityId: string) => {
    if (!user || !progress) return;

    try {
      const updatedProgress = {
        ...progress,
        completedActivities: [
          ...progress.completedActivities,
          {
            day: progress.currentDay,
            activityId,
            completedAt: new Date().toISOString()
          }
        ]
      };

      await updateUserJourneyProgress(user.id, journeyId, updatedProgress);
      setProgress(updatedProgress);
      toast.success('Activity completed!');
    } catch (err) {
      console.error('Error completing activity:', err);
      toast.error('Failed to save progress');
    }
  };

  const saveResponse = async (questionId: string, answer: string, answeredBy: 'user' | 'partner') => {
    if (!user || !progress || !currentActivity) return;

    try {
      await saveActivityResponse(
        user.id,
        journeyId,
        progress.currentDay,
        currentActivity.title,
        {
          questionId,
          answer,
          answeredBy
        }
      );
      toast.success('Response saved!');
    } catch (err) {
      console.error('Error saving response:', err);
      toast.error('Failed to save response');
    }
  };

  const moveToNextDay = async () => {
    if (!user || !progress || !journey) return;

    try {
      const updatedProgress = {
        ...progress,
        currentDay: progress.currentDay + 1,
        lastAccessedAt: new Date().toISOString()
      };

      await updateUserJourneyProgress(user.id, journeyId, updatedProgress);
      setProgress(updatedProgress);
      
      // Navigate to next day
      navigate(`/journey/${journeyId}/start?day=${updatedProgress.currentDay}`);
      toast.success('Moving to next day!');
    } catch (err) {
      console.error('Error moving to next day:', err);
      toast.error('Failed to progress to next day');
    }
  };

  return {
    journey,
    progress,
    currentActivity,
    loading,
    error,
    completeActivity,
    saveResponse,
    moveToNextDay
  };
} 
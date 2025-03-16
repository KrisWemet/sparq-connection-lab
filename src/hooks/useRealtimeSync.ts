
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserJourneyProgress } from '@/types/journey';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSyncReturn {
  partnerProgress: UserJourneyProgress | null;
  partnerIsOnline: boolean;
  lastSyncTime: string | null;
}

interface ProgressPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: UserJourneyProgress;
  old?: UserJourneyProgress;
}

export function useRealtimeSync(
  journeyId: string,
  partnerId?: string
): UseRealtimeSyncReturn {
  const [partnerProgress, setPartnerProgress] = useState<UserJourneyProgress | null>(null);
  const [partnerIsOnline, setPartnerIsOnline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !partnerId) return;

    // Subscribe to partner's presence
    const presenceChannel = supabase.channel(`presence:${partnerId}`) as RealtimeChannel;

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setPartnerIsOnline(Object.keys(state).length > 0);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: user.id });
        }
      });

    // Subscribe to partner's progress updates
    const progressChannel = supabase
      .channel('journey_progress')
      .on(
        'postgres_changes', // Fixed: this is the correct event type for supabase
        {
          event: '*',
          schema: 'public',
          table: 'user_journey_progress',
          filter: `user_id=eq.${partnerId} AND journey_id=eq.${journeyId}`,
        },
        (payload: ProgressPayload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setPartnerProgress(payload.new);
            setLastSyncTime(new Date().toISOString());

            // Show notification for partner's progress
            if (payload.old && payload.new.currentDay > payload.old.currentDay) {
              toast.info('Your partner has moved to the next day!');
            } else if (
              payload.old &&
              payload.new.completedActivities.length > payload.old.completedActivities.length
            ) {
              toast.info('Your partner has completed an activity!');
            }
          }
        }
      )
      .subscribe();

    // Subscribe to partner's activity responses
    const responsesChannel = supabase
      .channel('activity_responses')
      .on(
        'postgres_changes', // Fixed: this is the correct event type for supabase
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_responses',
          filter: `user_id=eq.${partnerId} AND journey_id=eq.${journeyId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.info('Your partner has submitted a response!');
            setLastSyncTime(new Date().toISOString());
          }
        }
      )
      .subscribe();

    // Initial fetch of partner's progress
    async function fetchPartnerProgress() {
      try {
        const { data, error } = await supabase
          .from('user_journey_progress')
          .select('*')
          .eq('user_id', partnerId)
          .eq('journey_id', journeyId)
          .single();

        if (error) throw error;
        if (data) {
          setPartnerProgress(data as UserJourneyProgress);
          setLastSyncTime(new Date().toISOString());
        }
      } catch (err) {
        console.error('Error fetching partner progress:', err);
      }
    }

    fetchPartnerProgress();

    // Cleanup subscriptions
    return () => {
      presenceChannel.unsubscribe();
      progressChannel.unsubscribe();
      responsesChannel.unsubscribe();
    };
  }, [journeyId, partnerId, user]);

  return {
    partnerProgress,
    partnerIsOnline,
    lastSyncTime
  };
}

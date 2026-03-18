import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSyncReturn {
  partnerIsOnline: boolean;
  lastSyncTime: string | null;
}

/**
 * Realtime sync hook for dashboard partner presence + daily session notifications.
 */
export function useRealtimeSync(partnerId?: string | null): UseRealtimeSyncReturn {
  const [partnerIsOnline, setPartnerIsOnline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !partnerId) return;

    const channels: RealtimeChannel[] = [];

    // Presence channel — track if partner is online
    const presenceChannel = supabase.channel(`presence:${partnerId}`);
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
    channels.push(presenceChannel);

    // Listen for partner completing daily sessions
    const sessionChannel = supabase
      .channel(`partner_sessions:${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'daily_sessions',
          filter: `user_id=eq.${partnerId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).status === 'completed') {
            toast.info('Your partner just finished their daily reflection!');
            setLastSyncTime(new Date().toISOString());
          }
        }
      )
      .subscribe();
    channels.push(sessionChannel);

    return () => {
      channels.forEach(ch => ch.unsubscribe());
    };
  }, [partnerId, user]);

  return { partnerIsOnline, lastSyncTime };
}

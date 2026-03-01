// usePeterCheckin — Fetches proactive check-ins and routes them through Peter
// Mount this once in a layout or page that has auth context.

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { routeToPeter } from '@/components/peter';
import type { PeterEvent } from '@/components/peter';

const CHECKIN_DELAY_MS = 3000; // wait 3s after mount before checking
const RECHECK_INTERVAL_MS = 10 * 60 * 1000; // re-check every 10 minutes

export function usePeterCheckin() {
  const { user } = useAuth();
  const lastCheckinRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    let timer: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    async function fetchCheckin() {
      try {
        const res = await fetch('/api/peter/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user!.id }),
        });

        if (!res.ok) return;
        const data = await res.json();

        if (!data.checkin) return;

        // Don't show the same checkin type twice in one session
        if (lastCheckinRef.current === data.checkin.type) return;
        lastCheckinRef.current = data.checkin.type;

        // Build action buttons from quick replies
        const actions = (data.checkin.quickReplies ?? []).map(
          (reply: string): { label: string; event: PeterEvent } => ({
            label: reply,
            event: { type: 'DISMISS_BUBBLE' },
          })
        );

        // Route through Peter's message system
        routeToPeter({
          kind: data.checkin.type === 'milestone_celebration' ? 'success' : 'tip',
          text: data.checkin.message,
          priority: data.checkin.priority ?? 'low',
          autoHideMs: 0, // proactive messages stay until dismissed
          actions: actions.length > 0 ? actions : undefined,
        });
      } catch {
        // Silently fail — proactive checkins are non-critical
      }
    }

    // Initial check after a short delay
    timer = setTimeout(fetchCheckin, CHECKIN_DELAY_MS);

    // Re-check periodically (e.g. user leaves tab open, comes back later)
    interval = setInterval(fetchCheckin, RECHECK_INTERVAL_MS);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user]);
}

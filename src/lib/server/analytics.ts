import type { SupabaseClient } from '@supabase/supabase-js';

export async function trackEvent(
  supabase: SupabaseClient,
  userId: string,
  eventName: string,
  eventProps: Record<string, unknown> = {}
): Promise<void> {
  try {
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_name: eventName,
      event_props: eventProps,
    });
  } catch {
    // Best-effort tracking; never block product flow.
  }
}


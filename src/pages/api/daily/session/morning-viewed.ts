import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';

type MorningViewedBody = {
  session_id?: string;
  trigger_moment?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as MorningViewedBody;
  if (!body.session_id) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  const updatePayload: Record<string, unknown> = {
    status: 'morning_viewed',
    phase: 'evening',
    morning_viewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (body.trigger_moment) {
    updatePayload.trigger_moment = body.trigger_moment;
  }

  const { data: updated, error } = await ctx.supabase
    .from('daily_sessions')
    .update(updatePayload)
    .eq('id', body.session_id)
    .eq('user_id', ctx.userId)
    .select('*')
    .single();

  if (error || !updated) {
    return res.status(404).json({ error: 'Session not found' });
  }

  await ctx.supabase.from('daily_entries').upsert(
    {
      user_id: ctx.userId,
      day: updated.day_index,
      morning_story: updated.morning_story,
      morning_action: updated.morning_action,
      morning_viewed_at: updated.morning_viewed_at,
    },
    { onConflict: 'user_id,day' }
  );

  await trackEvent(ctx.supabase, ctx.userId, 'daily_morning_viewed', {
    day_index: updated.day_index,
    session_local_date: updated.session_local_date,
  });

  return res.status(200).json({ session: updated });
}

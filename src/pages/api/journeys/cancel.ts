import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';

type CancelJourneyBody = {
  journey_id?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { journey_id } = (req.body || {}) as CancelJourneyBody;
  if (!journey_id) {
    return res.status(400).json({ error: 'journey_id is required' });
  }

  const { data: updatedRows, error } = await ctx.supabase
    .from('user_journeys')
    .update({ is_active: false })
    .eq('user_id', ctx.userId)
    .eq('journey_id', journey_id)
    .eq('is_active', true)
    .select('id, journey_id');

  if (error) {
    console.error('Journey cancel failed:', error);
    return res.status(500).json({ error: 'Failed to cancel journey' });
  }

  await trackEvent(ctx.supabase, ctx.userId, 'journey_cancelled', {
    journey_id,
    cancelled_early: true,
  });

  return res.status(200).json({
    cancelled: true,
    journey_id,
    updated_count: updatedRows?.length ?? 0,
  });
}

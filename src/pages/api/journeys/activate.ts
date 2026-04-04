// src/pages/api/journeys/activate.ts
// Sets active_journey_id on user_insights for the starter journey system.

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';
import { starterJourneyMap } from '@/data/starter-journeys';
import { trackPrimaryPathServerError } from '@/lib/server/beta-ops';

type ActivateBody = {
  journey_id?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { journey_id } = (req.body || {}) as ActivateBody;
  if (!journey_id) {
    return res.status(400).json({ error: 'journey_id is required' });
  }

  // Validate journey exists in starter journeys
  const journey = starterJourneyMap.get(journey_id);
  if (!journey) {
    return res.status(404).json({ error: 'Starter journey not found' });
  }

  // Set active_journey_id and reset day cursor to 1
  const { error: upsertError } = await ctx.supabase
    .from('user_insights')
    .upsert(
      {
        user_id: ctx.userId,
        active_journey_id: journey_id,
        onboarding_day: 1,
        last_analysis_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (upsertError) {
    await trackPrimaryPathServerError(ctx.supabase, ctx.userId, 'journey_activate', upsertError, {
      journey_id,
    });
    console.error('Failed to activate journey:', upsertError);
    return res.status(500).json({ error: 'Failed to activate journey' });
  }

  await trackEvent(ctx.supabase, ctx.userId, 'starter_journey_activated', {
    journey_id,
    journey_title: journey.title,
    duration: journey.duration,
  });

  return res.status(200).json({
    activated: true,
    journey_id,
    title: journey.title,
    duration: journey.duration,
  });
}

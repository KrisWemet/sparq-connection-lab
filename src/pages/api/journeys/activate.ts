// src/pages/api/journeys/activate.ts
// Start or resume a journey. Kept for existing callers (onboarding, journey
// completion); the logic lives in src/lib/server/journey-state.ts and
// /api/journeys/state is the general route.

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { activateJourney } from '@/lib/server/journey-state';
import { trackPrimaryPathServerError } from '@/lib/server/beta-ops';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const journeyId = typeof req.body?.journey_id === 'string' ? req.body.journey_id : '';
  if (!journeyId) {
    return res.status(400).json({ error: 'journey_id is required' });
  }

  const result = await activateJourney(ctx.supabase, ctx.userId, journeyId);
  if (!result.ok) {
    if (result.error === 'unknown_journey') return res.status(404).json({ error: 'Journey not found' });
    if (result.error === 'journey_limit_reached') {
      return res.status(403).json({
        error: 'starter_quest_limit_reached',
        message: 'You reached your free-plan journey limit.',
        limit: result.limit,
      });
    }
    if (result.error === 'another_journey_active') {
      return res.status(409).json({
        error: 'another_journey_active',
        message: 'Pause or finish the journey you are on first.',
        active_journey_id: result.active?.journey_id ?? null,
        active_title: result.active?.title ?? null,
      });
    }
    await trackPrimaryPathServerError(ctx.supabase, ctx.userId, 'journey_activate', new Error(result.error), {
      journey_id: journeyId,
    });
    return res.status(500).json({ error: 'Failed to activate journey' });
  }

  const { journey } = result.value;
  return res.status(200).json({
    activated: true,
    journey_id: journey.journey_id,
    title: journey.title,
    journey,
  });
}

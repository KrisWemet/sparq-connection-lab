// src/pages/api/journeys/cancel.ts
// Older name for leaving a journey. Leaving keeps the user's place and
// answers; they can come back any time (/api/journeys/state, action 'leave').

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { setJourneyAside } from '@/lib/server/journey-state';

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

  const result = await setJourneyAside(ctx.supabase, ctx.userId, journeyId, 'leave');
  if (!result.ok && result.error !== 'not_found' && result.error !== 'invalid_transition') {
    return res.status(500).json({ error: 'Failed to leave journey' });
  }

  return res.status(200).json({ cancelled: true, journey_id: journeyId });
}

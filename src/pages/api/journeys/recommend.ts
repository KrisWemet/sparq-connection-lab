// src/pages/api/journeys/recommend.ts
// Returns next journey recommendations for between-journey flow.

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { recommendNextJourneys } from '@/lib/server/next-journey-recommender';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  // Fetch user insights for attachment style and completed journeys
  const { data: insights } = await ctx.supabase
    .from('user_insights')
    .select('attachment_style, last_completed_journey_id, active_journey_id')
    .eq('user_id', ctx.userId)
    .maybeSingle();

  // Build list of completed journey IDs from analytics events
  const { data: completedEvents } = await ctx.supabase
    .from('user_activities')
    .select('metadata')
    .eq('user_id', ctx.userId)
    .eq('activity_type', 'journey_completed');

  const completedIds: string[] = (completedEvents || [])
    .map((e: any) => e.metadata?.journey_id)
    .filter(Boolean);

  const result = recommendNextJourneys(
    completedIds,
    insights?.attachment_style,
    insights?.last_completed_journey_id,
  );

  return res.status(200).json({
    recommendations: result.recommendations,
    suggestRest: result.suggestRest,
    hasActiveJourney: !!insights?.active_journey_id,
  });
}

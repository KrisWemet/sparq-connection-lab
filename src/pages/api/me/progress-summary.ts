import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { computeProgressSummary } from '@/lib/server/progress-summary';

/**
 * The user's own progress picture in three separate layers — practice
 * activity, what they reported, and tentative patterns (see
 * lib/server/progress-summary.ts). Replaces /api/me/relationship-score: there
 * is no composite score. Reads only the caller's own rows (RLS).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  try {
    return res.status(200).json(await computeProgressSummary(ctx.supabase, ctx.userId));
  } catch (error) {
    console.error('Progress summary error:', error);
    return res.status(500).json({ error: 'Could not load your progress' });
  }
}

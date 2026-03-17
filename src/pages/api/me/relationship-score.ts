import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { computeRelationshipScore } from '@/lib/server/relationship-score';

// Simple in-memory cache per user (24h TTL)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  // Check cache
  const cached = cache.get(ctx.userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.status(200).json(cached.data);
  }

  try {
    const score = await computeRelationshipScore(ctx.supabase, ctx.userId);

    if (!score) {
      const response = { score: null, building: true, history: [] };
      cache.set(ctx.userId, { data: response, timestamp: Date.now() });
      return res.status(200).json(response);
    }

    // Store the score snapshot
    await ctx.supabase.from('relationship_scores').insert({
      user_id: ctx.userId,
      overall_score: score.overall_score,
      communication_quality: score.communication_quality,
      repair_speed: score.repair_speed,
      emotional_safety: score.emotional_safety,
      ritual_consistency: score.ritual_consistency,
    });

    // Fetch 12-week history
    const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000).toISOString();
    const { data: history } = await ctx.supabase
      .from('relationship_scores')
      .select('overall_score, computed_at')
      .eq('user_id', ctx.userId)
      .gte('computed_at', twelveWeeksAgo)
      .order('computed_at', { ascending: true });

    const response = { score, building: false, history: history || [] };
    cache.set(ctx.userId, { data: response, timestamp: Date.now() });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Relationship score error:', error);
    return res.status(500).json({ error: 'Failed to compute score' });
  }
}

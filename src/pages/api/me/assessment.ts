import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const { milestone, responses } = req.body as {
      milestone: string;
      responses: { question_id: string; score: number }[];
    };

    if (!milestone || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'milestone and responses are required' });
    }

    // Calculate total score (average of all question scores, normalized to 0-100)
    const totalScore = responses.length > 0
      ? (responses.reduce((sum, r) => sum + r.score, 0) / responses.length) * 20 // scores are 1-5, * 20 = 0-100
      : 0;

    const { data, error } = await ctx.supabase
      .from('outcome_assessments')
      .insert({
        user_id: ctx.userId,
        milestone,
        responses,
        total_score: Math.round(totalScore * 100) / 100,
      })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ assessment: data });
  }

  if (req.method === 'GET') {
    const { data, error } = await ctx.supabase
      .from('outcome_assessments')
      .select('*')
      .eq('user_id', ctx.userId)
      .order('completed_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    // Compute improvement if we have baseline + at least one follow-up
    let improvement = null;
    if (data && data.length >= 2) {
      const baseline = data[0].total_score;
      const latest = data[data.length - 1].total_score;
      improvement = Math.round((latest - baseline) * 100) / 100;
    }

    return res.status(200).json({ assessments: data || [], improvement });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

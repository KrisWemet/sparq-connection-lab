import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const { severity, tool_used, notes } = req.body as {
      severity?: number;
      tool_used?: string;
      notes?: string;
    };

    const { data, error } = await ctx.supabase
      .from('conflict_episodes')
      .insert({
        user_id: ctx.userId,
        severity: severity ?? 3,
        tool_used: tool_used || null,
        notes: notes || null,
      })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await trackEvent(ctx.supabase, ctx.userId, 'conflict_episode_started', {
      episode_id: data.id,
      severity,
      tool_used,
    });

    return res.status(201).json({ episode: data });
  }

  if (req.method === 'GET') {
    const limit = parseInt(req.query.limit as string) || 20;

    const { data, error } = await ctx.supabase
      .from('conflict_episodes')
      .select('*')
      .eq('user_id', ctx.userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ episodes: data || [] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

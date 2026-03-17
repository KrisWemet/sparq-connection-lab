import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { episode_id, resolution_method, notes } = req.body as {
    episode_id: string;
    resolution_method?: string;
    notes?: string;
  };

  if (!episode_id) {
    return res.status(400).json({ error: 'episode_id is required' });
  }

  // Fetch the episode to compute repair duration
  const { data: episode, error: fetchError } = await ctx.supabase
    .from('conflict_episodes')
    .select('*')
    .eq('id', episode_id)
    .eq('user_id', ctx.userId)
    .single();

  if (fetchError || !episode) {
    return res.status(404).json({ error: 'Episode not found' });
  }

  if (episode.resolved_at) {
    return res.status(200).json({ episode, already_resolved: true });
  }

  const resolvedAt = new Date();
  const startedAt = new Date(episode.started_at);
  const repairDurationMinutes = (resolvedAt.getTime() - startedAt.getTime()) / (1000 * 60);

  const { data: updated, error: updateError } = await ctx.supabase
    .from('conflict_episodes')
    .update({
      resolved_at: resolvedAt.toISOString(),
      repair_duration_minutes: Math.round(repairDurationMinutes * 100) / 100,
      resolution_method: resolution_method || null,
      notes: notes || episode.notes,
      updated_at: resolvedAt.toISOString(),
    })
    .eq('id', episode_id)
    .eq('user_id', ctx.userId)
    .select('*')
    .single();

  if (updateError) return res.status(500).json({ error: updateError.message });

  await trackEvent(ctx.supabase, ctx.userId, 'conflict_episode_resolved', {
    episode_id,
    repair_duration_minutes: repairDurationMinutes,
    resolution_method,
  });

  return res.status(200).json({ episode: updated });
}

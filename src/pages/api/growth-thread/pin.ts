import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

type PinBody = {
  label: string;
  detail?: string;
  journey_id?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as PinBody;
  if (!body.label) {
    return res.status(400).json({ error: 'label is required' });
  }

  // Limit to 2 user-pinned entries per day
  const today = new Date().toISOString().slice(0, 10);
  const { count } = await ctx.supabase
    .from('growth_thread')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId)
    .eq('date', today)
    .eq('type', 'pinned');

  if ((count ?? 0) >= 2) {
    return res.status(429).json({ error: 'Maximum 2 pinned moments per day' });
  }

  const { data, error } = await ctx.supabase
    .from('growth_thread')
    .insert({
      user_id: ctx.userId,
      date: today,
      label: body.label,
      type: 'pinned',
      journey_id: body.journey_id || null,
      detail: body.detail || null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Growth thread pin error:', error);
    return res.status(500).json({ error: 'Failed to pin moment' });
  }

  return res.status(201).json({ entry: data });
}

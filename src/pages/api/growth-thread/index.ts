import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;

  const { data, error, count } = await ctx.supabase
    .from('growth_thread')
    .select('*', { count: 'exact' })
    .eq('user_id', ctx.userId)
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Growth thread fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch growth thread' });
  }

  return res.status(200).json({ entries: data || [], total: count || 0 });
}

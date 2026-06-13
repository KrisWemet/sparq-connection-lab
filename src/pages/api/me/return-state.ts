import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { getReturnState } from '@/lib/server/return-state';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  const state = await getReturnState(ctx.supabase, ctx.userId);
  return res.status(200).json(state);
}

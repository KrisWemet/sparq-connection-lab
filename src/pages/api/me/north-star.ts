// North Star surface endpoint (spec §5/§6). GET → active line for the
// placecard; POST → graduation boundary actions (reaffirm / shift).

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { getActiveNorthStar } from '@/lib/server/north-star';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const line = await getActiveNorthStar(ctx.supabase, ctx.userId);
    return res.status(200).json({ line });
  }

  if (req.method === 'POST') {
    const { action } = (req.body || {}) as { action?: string };
    if (action !== 'reaffirm' && action !== 'shift') {
      return res.status(400).json({ error: "action must be 'reaffirm' or 'shift'" });
    }
    const update = action === 'reaffirm'
      ? { reaffirmed_at: new Date().toISOString() }
      // Spec §4(b): "attempt counter treated as reset" — each user-initiated
      // shift earns a fresh set of (max 3, cooldown-spaced) re-ladder attempts.
      // Without the reset, a lifetime counter at cap makes this button
      // permanently inert.
      : { needs_reladder: true, attempt_count: 0, last_attempt_at: null };
    const { error } = await ctx.supabase
      .from('north_stars')
      .update(update)
      .eq('user_id', ctx.userId)
      .eq('status', 'active');
    if (error) return res.status(500).json({ error: 'Failed to update' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

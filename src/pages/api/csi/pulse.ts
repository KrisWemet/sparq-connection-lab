// CSI-4 pulse (spec §5.4). GET → due status; POST → submit scores.
// Standard CSI-4: item 1 scored 0-6, items 2-4 scored 0-5. Total 0-21.

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

const ITEM_MAX = [6, 5, 5, 5];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data: pulses } = await ctx.supabase
      .from('csi_pulses')
      .select('context, measured_at')
      .eq('user_id', ctx.userId)
      .order('measured_at', { ascending: false })
      .limit(1);

    if (!pulses || pulses.length === 0) {
      return res.status(200).json({ due: 'baseline' });
    }
    const last = new Date(pulses[0].measured_at).getTime();
    const due = Date.now() - last >= 30 * 86400000 ? 'monthly' : null;
    return res.status(200).json({ due });
  }

  if (req.method === 'POST') {
    const { item_scores } = (req.body || {}) as { item_scores?: number[] };
    if (!Array.isArray(item_scores) || item_scores.length !== 4 ||
        item_scores.some((s, i) => !Number.isInteger(s) || s < 0 || s > ITEM_MAX[i])) {
      return res.status(400).json({ error: 'item_scores must be 4 integers within CSI-4 ranges' });
    }
    const total_score = item_scores.reduce((a, b) => a + b, 0);

    const { data: existing } = await ctx.supabase
      .from('csi_pulses')
      .select('id')
      .eq('user_id', ctx.userId)
      .limit(1);
    const context = !existing || existing.length === 0 ? 'baseline' : 'monthly';

    const { error } = await ctx.supabase.from('csi_pulses').insert({
      user_id: ctx.userId,
      context,
      item_scores,
      total_score,
    });
    if (error) return res.status(500).json({ error: 'Failed to store pulse' });
    return res.status(200).json({ ok: true, context, total_score });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

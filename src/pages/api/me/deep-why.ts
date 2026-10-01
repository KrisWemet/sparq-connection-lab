import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { withSchemaFallback } from '@/lib/server/schema-fallback';

/**
 * Deep Why (constitution v1.2 §5B) — the user's own layers of "why is that
 * important to you?" beneath who they want to become. Their words only.
 * GET   → layers for the active North Star, shallowest first (still-true only).
 * PATCH { id } → "that isn't why anymore": retires the layer. A past reason
 *         is not a permanent contract, and retired reasons are never used.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  const db = ctx.supabase;

  if (req.method === 'GET') {
    const { data: star } = await db.from('north_stars').select('id, line')
      .eq('user_id', ctx.userId).eq('status', 'active').not('line', 'is', null)
      .order('confirmed_at', { ascending: false }).limit(1).maybeSingle();
    if (!star) return res.status(200).json({ line: null, layers: [] });
    const { data } = await withSchemaFallback<any[]>(
      () => db.from('user_reasons').select('id, reason_text, depth, is_bedrock, created_at')
        .eq('user_id', ctx.userId).eq('attached_type', 'north_star').eq('attached_id', star.id).eq('still_true', true)
        .order('created_at', { ascending: true }),
      () => db.from('user_reasons').select('id, reason_text, created_at')
        .eq('user_id', ctx.userId).eq('attached_type', 'north_star').eq('attached_id', star.id).eq('still_true', true)
        .order('created_at', { ascending: true }),
    );
    const layers = (data || []).map((r: any, i: number) => ({
      id: r.id, text: r.reason_text, depth: r.depth ?? i + 1, bedrock: Boolean(r.is_bedrock),
    }));
    return res.status(200).json({ line: star.line, layers });
  }

  if (req.method === 'PATCH') {
    const id = typeof req.body?.id === 'string' ? req.body.id : null;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const { error } = await db.from('user_reasons')
      .update({ still_true: false, revised_at: new Date().toISOString() })
      .eq('id', id).eq('user_id', ctx.userId);
    if (error) return res.status(500).json({ error: 'Could not update' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

/**
 * Interaction cycles (constitution §7): the pattern between two people,
 * named without blame. A cycle is "ours" only once BOTH partners confirm it.
 *
 * POST  → propose { name, description?, what_helps? }
 * PATCH → { id, action: 'confirm' | 'retire', what_helps? }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { data: spaceId } = await ctx.supabase.rpc('ensure_couple_space');
  if (typeof spaceId !== 'string') return res.status(409).json({ error: 'Link with your partner first.' });

  const clean = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

  if (req.method === 'POST') {
    const name = clean(req.body?.name, 120);
    if (!name) return res.status(400).json({ error: 'name is required' });
    const { data, error } = await ctx.supabase
      .from('interaction_cycles')
      .insert({
        couple_space_id: spaceId,
        name,
        description: clean(req.body?.description, 1000),
        what_helps: clean(req.body?.what_helps, 1000),
        proposed_by: ctx.userId,
        confirmed_by: [ctx.userId],
      })
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: 'Could not save that pattern' });
    return res.status(200).json({ cycle: data });
  }

  if (req.method === 'PATCH') {
    const { id, action } = (req.body || {}) as { id?: string; action?: string };
    if (!id || (action !== 'confirm' && action !== 'retire')) {
      return res.status(400).json({ error: 'id and action are required' });
    }
    const { data: cycle } = await ctx.supabase
      .from('interaction_cycles')
      .select('id, confirmed_by, what_helps')
      .eq('id', id)
      .eq('couple_space_id', spaceId)
      .maybeSingle();
    if (!cycle) return res.status(404).json({ error: 'Not found' });

    const confirmedBy: string[] = Array.from(new Set([...(cycle.confirmed_by || []), ctx.userId]));
    const update =
      action === 'retire'
        ? { status: 'retired', updated_at: new Date().toISOString() }
        : {
            confirmed_by: confirmedBy,
            status: confirmedBy.length >= 2 ? 'confirmed' : 'proposed',
            what_helps: clean(req.body?.what_helps, 1000) ?? cycle.what_helps,
            updated_at: new Date().toISOString(),
          };
    const { data, error } = await ctx.supabase
      .from('interaction_cycles')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: 'Could not update that pattern' });
    return res.status(200).json({ cycle: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

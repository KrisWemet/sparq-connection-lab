import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';

/**
 * Shared space ("Us", constitution §7–8). Everything here was explicitly
 * shared by its author. All access goes through the caller's RLS-scoped
 * client — this route never touches either partner's private tables.
 *
 * GET    → { space_id | null, items, cycles, me }
 * POST   → share one item   { kind, body }
 * DELETE → un-share own item { id }
 */
const SHARED_KINDS = ['discovery', 'appreciation', 'need', 'value', 'ritual', 'agreement', 'memory', 'repair'] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  // Only a mutual partner link produces a space (verified in SQL).
  const { data: spaceId } = await ctx.supabase.rpc('ensure_couple_space');
  const space = typeof spaceId === 'string' ? spaceId : null;

  if (req.method === 'GET') {
    if (!space) return res.status(200).json({ space_id: null, items: [], cycles: [], me: ctx.userId });
    const [{ data: items }, { data: cycles }] = await Promise.all([
      ctx.supabase.from('shared_items').select('id, author_id, kind, body, created_at')
        .eq('couple_space_id', space).order('created_at', { ascending: false }).limit(50),
      ctx.supabase.from('interaction_cycles').select('id, name, description, what_helps, proposed_by, confirmed_by, status, created_at')
        .eq('couple_space_id', space).neq('status', 'retired').order('created_at', { ascending: false }),
    ]);
    return res.status(200).json({ space_id: space, items: items || [], cycles: cycles || [], me: ctx.userId });
  }

  if (!space) return res.status(409).json({ error: 'Link with your partner first to use your shared space.' });

  if (req.method === 'POST') {
    const { kind, body } = (req.body || {}) as { kind?: string; body?: string };
    const text = typeof body === 'string' ? body.trim().slice(0, 1000) : '';
    if (!SHARED_KINDS.includes(kind as typeof SHARED_KINDS[number]) || !text) {
      return res.status(400).json({ error: 'A valid kind and some words are required' });
    }
    const { data, error } = await ctx.supabase
      .from('shared_items')
      .insert({ couple_space_id: space, author_id: ctx.userId, kind, body: text })
      .select('id, author_id, kind, body, created_at')
      .single();
    if (error) return res.status(500).json({ error: 'Could not share that' });
    trackEvent(ctx.supabase, ctx.userId, 'shared_item_created', { kind });
    return res.status(200).json({ item: data });
  }

  if (req.method === 'DELETE') {
    const id = typeof req.body?.id === 'string' ? req.body.id : '';
    if (!id) return res.status(400).json({ error: 'id is required' });
    // RLS lets only the author delete; the eq on author_id makes it explicit.
    const { error } = await ctx.supabase.from('shared_items').delete().eq('id', id).eq('author_id', ctx.userId);
    if (error) return res.status(500).json({ error: 'Could not remove that' });
    return res.status(200).json({ removed: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

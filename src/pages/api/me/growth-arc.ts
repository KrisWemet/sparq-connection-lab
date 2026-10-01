import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { isMissingSchemaError } from '@/lib/server/schema-fallback';
import { trackEvent } from '@/lib/server/analytics';
import { RITE_FIELDS, cleanRiteFields, isArcKey } from '@/lib/rites';

/**
 * Milestones / rites of passage (constitution v1.2 §11C). The user writes
 * every field. GET → arc keys already marked; POST { arc_key, fields } saves.
 * Before the v1.2 migration the reflection is kept as a self-discovery.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  const db = ctx.supabase;

  if (req.method === 'GET') {
    const { data, error } = await db.from('growth_arcs').select('arc_key, completed_at').eq('user_id', ctx.userId);
    if (error) return res.status(200).json({ arcs: [] });
    return res.status(200).json({ arcs: (data || []).map(a => a.arc_key) });
  }

  if (req.method === 'POST') {
    const { arc_key, fields } = (req.body || {}) as { arc_key?: unknown; fields?: unknown };
    if (!isArcKey(arc_key)) return res.status(400).json({ error: 'Unknown arc' });
    const clean = cleanRiteFields(fields);
    if (Object.keys(clean).length === 0) return res.status(400).json({ error: 'Write at least one line' });

    const { error } = await db.from('growth_arcs').upsert(
      { user_id: ctx.userId, arc_key, ...clean, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,arc_key' },
    );
    if (error && !isMissingSchemaError(error)) return res.status(500).json({ error: 'Could not save' });
    if (error) {
      const text = RITE_FIELDS.filter(f => clean[f.key]).map(f => `${f.prompt}: ${clean[f.key]}`).join('\n').slice(0, 1000);
      const { error: e2 } = await db.from('self_discoveries').insert({ user_id: ctx.userId, discovery: text, context: `Milestone: ${arc_key}`, source: 'manual' });
      if (e2) return res.status(500).json({ error: 'Could not save' });
    }
    trackEvent(db, ctx.userId, 'growth_arc_marked', { arc_key, fields: Object.keys(clean).length, contribution: Boolean(clean.who_benefits) });
    return res.status(200).json({ saved: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

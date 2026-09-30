import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { loadPrivacyState } from '@/lib/server/privacy';
import { addDistilledMemories } from '@/lib/server/memory';
import { trackEvent } from '@/lib/server/analytics';

/**
 * Self-chosen experiments (constitution §5 "prefer user-created experiments",
 * §9 Days 8–14, §13). GET lists open + recently resolved; POST creates one in
 * the user's words; PATCH records what happened.
 */
const STATUSES = ['tried', 'skipped', 'let_go', 'planned'] as const;
const OUTCOMES = ['helped', 'mixed', 'didnt_help'] as const;

function isoDatePlus(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const today = isoDatePlus(0);
    const [{ data: open }, { data: recent }] = await Promise.all([
      ctx.supabase
        .from('experiments')
        .select('id, intention, origin, status, check_in_on, created_at')
        .eq('user_id', ctx.userId)
        .eq('status', 'planned')
        .order('created_at', { ascending: false })
        .limit(10),
      ctx.supabase
        .from('experiments')
        .select('id, intention, status, outcome, outcome_note, resolved_at')
        .eq('user_id', ctx.userId)
        .neq('status', 'planned')
        .order('resolved_at', { ascending: false })
        .limit(10),
    ]);
    const due = (open || []).filter(e => !e.check_in_on || e.check_in_on <= today);
    return res.status(200).json({ due, open: open || [], recent: recent || [] });
  }

  if (req.method === 'POST') {
    const intention = typeof req.body?.intention === 'string' ? req.body.intention.trim().slice(0, 300) : '';
    if (!intention) return res.status(400).json({ error: 'intention is required' });
    const { data, error } = await ctx.supabase
      .from('experiments')
      .insert({ user_id: ctx.userId, intention, origin: 'user', check_in_on: isoDatePlus(2) })
      .select('id, intention, status, check_in_on')
      .single();
    if (error) return res.status(500).json({ error: 'Could not save your experiment' });
    trackEvent(ctx.supabase, ctx.userId, 'experiment_created', { origin: 'user' });
    return res.status(200).json({ experiment: data });
  }

  if (req.method === 'PATCH') {
    const { id, status, outcome, outcome_note, snooze_days } = (req.body || {}) as {
      id?: string; status?: string; outcome?: string; outcome_note?: string; snooze_days?: number;
    };
    if (!id || !STATUSES.includes(status as typeof STATUSES[number])) {
      return res.status(400).json({ error: 'id and a valid status are required' });
    }
    if (outcome != null && !OUTCOMES.includes(outcome as typeof OUTCOMES[number])) {
      return res.status(400).json({ error: 'Invalid outcome' });
    }
    const note = typeof outcome_note === 'string' ? outcome_note.trim().slice(0, 500) : null;

    // "Not yet, keep it" re-plans the check-in instead of resolving.
    const update =
      status === 'planned'
        ? { check_in_on: isoDatePlus(Math.min(7, Math.max(1, Number(snooze_days) || 2))) }
        : {
            status,
            outcome: status === 'tried' ? outcome ?? null : null,
            outcome_note: note,
            resolved_at: new Date().toISOString(),
          };

    const { data, error } = await ctx.supabase
      .from('experiments')
      .update(update)
      .eq('id', id)
      .eq('user_id', ctx.userId)
      .select('id, intention, status, outcome, outcome_note')
      .maybeSingle();
    if (error) return res.status(500).json({ error: 'Could not update your experiment' });
    if (!data) return res.status(404).json({ error: 'Experiment not found' });

    // What happened when they tried it is growth evidence (§4, §11).
    if (data.status === 'tried') {
      const privacy = await loadPrivacyState(ctx.supabase, ctx.userId);
      if (privacy.can_store_memories) {
        const how = data.outcome === 'helped' ? 'it helped' : data.outcome === 'mixed' ? 'it was mixed' : data.outcome === 'didnt_help' ? "it didn't help" : 'they tried it';
        const metadata: Record<string, any> = { source: 'experiment' };
        if (privacy.preferences.memory_window === '90_days') {
          metadata.expires_at = new Date(Date.now() + 90 * 86_400_000).toISOString();
        }
        await addDistilledMemories(
          ctx.userId,
          [{
            text: `They tried "${data.intention.slice(0, 160)}" and ${how}${data.outcome_note ? `: ${data.outcome_note.slice(0, 160)}` : ''}.`,
            kind: 'growth',
            importance: 0.6,
          }],
          metadata,
        ).catch(() => 0);
      }
    }
    trackEvent(ctx.supabase, ctx.userId, 'experiment_resolved', { status: data.status, outcome: data.outcome });
    return res.status(200).json({ experiment: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

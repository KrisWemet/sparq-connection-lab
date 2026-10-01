import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { getActiveNorthStar } from '@/lib/server/north-star';
import { isMissingSchemaError } from '@/lib/server/schema-fallback';
import { trackEvent } from '@/lib/server/analytics';
import { identityAskState, type EvidenceRow } from '@/lib/identity';

/**
 * Identity evidence (constitution v1.2 §11B). Private, user-authored.
 * GET  → the user's own North Star line, linked steps, and whether to ask
 *        "does this change how you see yourself?"
 * POST { action: 'step', experiment_id, note? } — the user linked something
 *        they did to who they want to become.
 * POST { action: 'answer', text } — their answer, in their words.
 * POST { action: 'not_now' } — records that we asked, so we wait 14 days.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  const db = ctx.supabase;
  const line = await getActiveNorthStar(db, ctx.userId);

  if (req.method === 'GET') {
    if (!line) return res.status(200).json({ line: null, steps: 0, should_ask: false, recent: [] });
    const { data, error } = await db.from('identity_evidence')
      .select('direction, evidence_type, note, user_interpretation, created_at, asked_at')
      .eq('user_id', ctx.userId).eq('identity_line', line)
      .order('created_at', { ascending: false }).limit(50);
    if (error) {
      // Before the migration runs there is simply no evidence yet.
      if (isMissingSchemaError(error)) return res.status(200).json({ line, steps: 0, should_ask: false, recent: [] });
      return res.status(500).json({ error: 'Could not load' });
    }
    const rows = (data || []) as Array<EvidenceRow & { note?: string | null; user_interpretation?: string | null }>;
    const { steps, shouldAsk } = identityAskState(rows);
    const recent = rows.filter(r => r.evidence_type !== 'reflection' && r.note).slice(0, 5).map(r => r.note);
    const lastAnswer = rows.find(r => r.user_interpretation)?.user_interpretation ?? null;
    return res.status(200).json({ line, steps, should_ask: shouldAsk, recent, last_answer: lastAnswer });
  }

  if (req.method === 'POST') {
    if (!line) return res.status(400).json({ error: 'No identity line yet' });
    const { action, experiment_id, note, text } = (req.body || {}) as Record<string, unknown>;
    const clean = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

    if (action === 'step') {
      // Only steps the user themselves linked; we read the intention from
      // their own experiment so the note is in their words.
      let stepNote = clean(note, 200);
      if (typeof experiment_id === 'string') {
        const { data: exp } = await db.from('experiments').select('intention')
          .eq('id', experiment_id).eq('user_id', ctx.userId).maybeSingle();
        if (!exp) return res.status(404).json({ error: 'Experiment not found' });
        stepNote = stepNote || exp.intention.slice(0, 200);
      }
      const { error } = await db.from('identity_evidence').insert({
        user_id: ctx.userId, identity_line: line, direction: 'consistent',
        evidence_type: 'experiment', evidence_id: typeof experiment_id === 'string' ? experiment_id : null, note: stepNote,
      });
      if (error && !isMissingSchemaError(error)) return res.status(500).json({ error: 'Could not save' });
      trackEvent(db, ctx.userId, 'identity_step_linked', {});
      return res.status(200).json({ ok: true });
    }

    if (action === 'answer' || action === 'not_now') {
      const answer = action === 'answer' ? clean(text, 500) : null;
      if (action === 'answer' && !answer) return res.status(400).json({ error: 'text is required' });
      const { error } = await db.from('identity_evidence').insert({
        user_id: ctx.userId, identity_line: line, direction: 'consistent', evidence_type: 'reflection',
        user_interpretation: answer, asked_at: new Date().toISOString(),
      });
      if (error && !isMissingSchemaError(error)) return res.status(500).json({ error: 'Could not save' });
      // What they concluded about themselves is a self-discovery in their words.
      if (answer) {
        await db.from('self_discoveries').insert({ user_id: ctx.userId, discovery: answer, context: `Who I'm becoming: ${line}`.slice(0, 300), source: 'manual' });
      }
      trackEvent(db, ctx.userId, 'identity_question_answered', { answered: Boolean(answer) });
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: 'Unknown action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

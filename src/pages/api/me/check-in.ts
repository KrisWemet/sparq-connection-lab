import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';
import { cleanAnswers, compareCheckIns, type CheckInAnswers } from '@/lib/check-in';

/**
 * Informal check-in (docs/METRICS.md "Outcome measurement"). Sparq's own
 * questions — self-reports, never a score. Stored in the user's own
 * `outcome_assessments` rows (RLS: owner only); nothing here reaches a
 * partner, Peter, or the growth engine.
 *
 * GET  → { baseline, latest, changes } — then vs. now, item by item.
 * POST { answers } → the first check-in a user saves is their baseline;
 *        every later one is a follow-up.
 */
const BASELINE = 'checkin_baseline';
const FOLLOW_UP = 'checkin_follow_up';

type Row = { milestone: string; responses: { answers?: CheckInAnswers } | null; completed_at: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  const db = ctx.supabase;

  const load = async (): Promise<Row[]> => {
    const { data } = await db.from('outcome_assessments')
      .select('milestone, responses, completed_at')
      .eq('user_id', ctx.userId)
      .in('milestone', [BASELINE, FOLLOW_UP])
      .order('completed_at', { ascending: true });
    return (data || []) as Row[];
  };

  if (req.method === 'GET') {
    try {
      const rows = await load();
      const baseline = rows.find(r => r.milestone === BASELINE) ?? null;
      const follow = rows.filter(r => r.milestone === FOLLOW_UP);
      const latest = follow.length > 0 ? follow[follow.length - 1] : null;
      const changes = baseline && latest
        ? compareCheckIns(baseline.responses?.answers ?? {}, latest.responses?.answers ?? {})
        : [];
      return res.status(200).json({
        baseline: baseline ? { answers: baseline.responses?.answers ?? {}, at: baseline.completed_at } : null,
        latest: latest ? { answers: latest.responses?.answers ?? {}, at: latest.completed_at } : null,
        changes,
      });
    } catch {
      // fail-soft: surfaces simply show nothing
      return res.status(200).json({ baseline: null, latest: null, changes: [] });
    }
  }

  if (req.method === 'POST') {
    const answers = cleanAnswers((req.body || {}).answers);
    if (Object.keys(answers).length === 0) return res.status(400).json({ error: 'No answers' });

    const { data: existing } = await db.from('outcome_assessments')
      .select('id').eq('user_id', ctx.userId).eq('milestone', BASELINE).limit(1);
    const milestone = existing && existing.length > 0 ? FOLLOW_UP : BASELINE;

    const { error } = await db.from('outcome_assessments').insert({
      user_id: ctx.userId,
      milestone,
      responses: { version: 1, kind: 'informal', answers },
      // The table requires a number; informal answers are never summed.
      total_score: 0,
    });
    if (error) return res.status(500).json({ error: 'Could not save' });
    // Counts only — which items were answered, never the answers themselves.
    trackEvent(db, ctx.userId, 'check_in_saved', { stage: milestone, answered: Object.keys(answers).length });
    return res.status(200).json({ ok: true, stage: milestone === BASELINE ? 'baseline' : 'follow_up' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

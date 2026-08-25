// Day-14 CSI delta (Master PRD §4.2 — "the Day-14 delta on CSI-4 is the
// trial-to-paid conversion moment, and the copy must report it honestly even
// if flat").
//
// GET  -> { state, baseline, latest, delta } where state is:
//   'no_baseline'    — never measured; nothing honest to report
//   'remeasure_due'  — baseline exists and it's been >= 14 days; ask again
//   'ready'          — both points exist; delta is real
// POST -> records the Day-14 remeasure (context='monthly' via the shared
//         pulse endpoint semantics; this route only reads).
//
// This route NEVER interprets the number as good/bad — the surface does that,
// honestly, including when the delta is zero or negative.

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

const REMEASURE_AFTER_DAYS = 14;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data } = await ctx.supabase
      .from('csi_pulses')
      .select('context, total_score, measured_at')
      .eq('user_id', ctx.userId)
      .order('measured_at', { ascending: true });

    const pulses = data || [];
    const baseline = pulses.find(p => p.context === 'baseline') || null;

    if (!baseline) {
      return res.status(200).json({ state: 'no_baseline' });
    }

    const later = pulses.filter(p => p.context !== 'baseline');
    const latest = later.length > 0 ? later[later.length - 1] : null;

    const daysSinceBaseline = Math.floor(
      (Date.now() - new Date(baseline.measured_at).getTime()) / 86400000,
    );

    if (!latest) {
      return res.status(200).json({
        state: daysSinceBaseline >= REMEASURE_AFTER_DAYS ? 'remeasure_due' : 'too_early',
        baseline: baseline.total_score,
        days_since_baseline: daysSinceBaseline,
      });
    }

    return res.status(200).json({
      state: 'ready',
      baseline: baseline.total_score,
      latest: latest.total_score,
      delta: latest.total_score - baseline.total_score,
      days_since_baseline: daysSinceBaseline,
    });
  } catch {
    // fail-soft: the graduation screen renders without the delta section
    return res.status(200).json({ state: 'no_baseline' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

type CheckinOutcome = 'completed' | 'partial' | 'not_attempted' | 'skip';

type CheckinBody = {
  session_id: string;
  plan_text: string;
  outcome: CheckinOutcome;
  note?: string;
};

const VALID_OUTCOMES: CheckinOutcome[] = ['completed', 'partial', 'not_attempted', 'skip'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as CheckinBody;
  if (!body.session_id || !VALID_OUTCOMES.includes(body.outcome)) {
    return res.status(400).json({ error: 'session_id and valid outcome are required' });
  }

  const { error } = await ctx.supabase.from('if_then_checkins').upsert(
    {
      user_id: ctx.userId,
      session_id: body.session_id,
      plan_text: body.plan_text,
      outcome: body.outcome,
      note: body.note ?? null,
    },
    { onConflict: 'session_id,user_id' }
  );

  if (error) {
    return res.status(500).json({ error: 'Failed to save check-in' });
  }

  return res.status(200).json({ ok: true });
}

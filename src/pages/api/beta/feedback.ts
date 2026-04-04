import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';

type FeedbackBody = {
  stage?: string;
  message?: string;
  sentiment?: number | null;
  context?: Record<string, unknown>;
  beta_path_source?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as FeedbackBody;
  const message = body.message?.trim() || '';
  const stage = body.stage?.trim() || '';

  if (!stage || !message) {
    return res.status(400).json({ error: 'stage and message are required' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: 'message is too long' });
  }

  await trackEvent(ctx.supabase, ctx.userId, 'beta_feedback_submitted', {
    beta_path: 'primary_signup_driven',
    beta_path_source: body.beta_path_source || 'unknown',
    stage,
    message,
    sentiment: typeof body.sentiment === 'number' ? body.sentiment : null,
    context: body.context || {},
  });

  return res.status(200).json({ ok: true });
}

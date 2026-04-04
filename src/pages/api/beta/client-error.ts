import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackPrimaryPathServerError } from '@/lib/server/beta-ops';

type ClientErrorBody = {
  stage?: string;
  error_message?: string;
  error_name?: string;
  context?: Record<string, unknown>;
  beta_path_source?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as ClientErrorBody;
  if (!body.stage || !body.error_message) {
    return res.status(400).json({ error: 'stage and error_message are required' });
  }

  await trackPrimaryPathServerError(
    ctx.supabase,
    ctx.userId,
    body.stage,
    new Error(body.error_message),
    {
      beta_path_source: body.beta_path_source || 'unknown',
      error_name: body.error_name || 'UnknownError',
      client_context: body.context || {},
    }
  );

  return res.status(200).json({ ok: true });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { getAdminClient } from '@/lib/server/supabase-admin';

type Body = { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };

/**
 * POST: remember this device (after the person allowed notifications).
 * DELETE: forget it. The reminder on/off itself lives in /api/preferences.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as Body;
  const endpoint = typeof body.endpoint === 'string' && body.endpoint.startsWith('https://') ? body.endpoint : null;
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

  if (req.method === 'DELETE') {
    await ctx.supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', ctx.userId);
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const p256dh = typeof body.keys?.p256dh === 'string' ? body.keys.p256dh : null;
  const auth = typeof body.keys?.auth === 'string' ? body.keys.auth : null;
  if (!p256dh || !auth) return res.status(400).json({ error: 'Missing keys' });

  const admin = getAdminClient();
  if (!admin) return res.status(503).json({ error: 'Not configured' });

  // Upsert by endpoint: a shared phone moves to whoever turned it on last.
  const { error } = await admin.from('push_subscriptions').upsert(
    {
      user_id: ctx.userId,
      endpoint,
      p256dh,
      auth,
      user_agent: String(req.headers['user-agent'] || '').slice(0, 300),
    },
    { onConflict: 'endpoint' },
  );
  if (error) return res.status(500).json({ error: 'Could not save device' });
  return res.status(200).json({ ok: true });
}

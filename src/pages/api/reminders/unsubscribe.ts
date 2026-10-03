import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { verifyUnsubscribeToken } from '@/lib/server/reminders';

/**
 * One-click unsubscribe from reminder emails. GET is the link in the email;
 * POST is the mail app's one-click (List-Unsubscribe-Post). No sign-in
 * needed: the signed token proves the link came from us for this user.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  const userId = typeof req.query.u === 'string' ? req.query.u : '';
  const token = typeof req.query.t === 'string' ? req.query.t : '';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let ok = false;
  if (userId && token && url && serviceKey && verifyUnsubscribeToken(userId, token)) {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { error } = await admin
      .from('user_preferences')
      .update({ email_reminders_enabled: false })
      .eq('user_id', userId);
    ok = !error;
  }

  if (req.method === 'POST') return res.status(ok ? 200 : 400).end();

  const message = ok
    ? "Done. You won't get reminder emails anymore. You can turn them back on in Settings any time."
    : "That link didn't work. You can turn reminder emails off in Settings.";
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(ok ? 200 : 400).send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Reminder emails</title></head>
<body style="margin:0;background:#F7F2EC;font-family:Georgia,serif;color:#3A2A3F">
<div style="max-width:420px;margin:0 auto;padding:64px 24px;text-align:center">
<p style="font-size:40px;margin:0 0 16px">🦦</p>
<p style="font-size:18px;line-height:1.6">${message}</p>
<p><a href="/settings" style="color:#4B2E57;font-family:Arial,sans-serif;font-weight:bold">Open Settings</a></p>
</div></body></html>`);
}

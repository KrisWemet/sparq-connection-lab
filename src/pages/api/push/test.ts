import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { getAdminClient } from '@/lib/server/supabase-admin';
import { sendPushToUser } from '@/lib/server/push';

/** Sends a test notification to the signed-in person's own devices. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  const admin = getAdminClient();
  if (!admin) return res.status(503).json({ error: 'Not configured' });

  const result = await sendPushToUser(admin, ctx.userId, {
    title: 'Sparq',
    body: "This is how Peter's reminders will look. 🦦",
    url: '/settings',
    tag: 'sparq-test',
  });
  return res.status(200).json(result);
}

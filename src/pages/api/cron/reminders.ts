import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';
import {
  appUrl,
  buildReminderEmail,
  getEmailSender,
  isReminderDue,
  unsubscribeUrl,
} from '@/lib/server/reminders';

/**
 * Daily reminder emails. A scheduler calls this every 15 minutes with
 * `Authorization: Bearer <CRON_SECRET>` (docs/REMINDERS.md). Without an
 * email provider key it runs as a dry run: it works out who is due and logs
 * it, sends nothing, and records nothing, so it can be run safely any time.
 */
function authorized(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.authorization || '';
  if (!secret) return false;
  const expected = `Bearer ${secret}`;
  return header.length === expected.length && timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const baseUrl = appUrl();
  const missing = [
    !url && 'NEXT_PUBLIC_SUPABASE_URL',
    !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
    !baseUrl && 'NEXT_PUBLIC_APP_URL',
    !process.env.REMINDER_SIGNING_SECRET && 'REMINDER_SIGNING_SECRET',
  ].filter(Boolean);
  if (missing.length) return res.status(500).json({ error: 'Not configured', missing });

  const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });
  const sender = getEmailSender();
  const now = new Date();

  const { data: prefs, error } = await admin
    .from('user_preferences')
    .select('user_id, reminder_time, timezone, last_reminder_sent_on')
    .eq('email_reminders_enabled', true);
  if (error) return res.status(500).json({ error: 'Could not load preferences' });

  const due = (prefs || [])
    .map(p => ({ ...p, ...isReminderDue(p, now) }))
    .filter(p => p.due);

  const ids = due.map(p => p.user_id);
  const { data: profiles } = ids.length
    ? await admin.from('profiles').select('id, email, name').in('id', ids)
    : { data: [] as { id: string; email: string | null; name: string | null }[] };
  const byId = new Map((profiles || []).map(p => [p.id, p]));

  let sent = 0;
  const failures: string[] = [];
  for (const p of due) {
    const profile = byId.get(p.user_id);
    const unsub = unsubscribeUrl(p.user_id, baseUrl!);
    if (!profile?.email || !unsub) continue;

    const email = buildReminderEmail({ name: profile.name, unsubscribeUrl: unsub, baseUrl: baseUrl! });
    const result = await sender.send({ to: profile.email, email, unsubscribeUrl: unsub });
    if (!result.ok) {
      failures.push(p.user_id);
      console.error('[reminders] send failed', p.user_id, result.error);
      continue;
    }
    sent++;
    // Only a real send counts toward "once a day"; dry runs stay repeatable.
    if (!sender.dryRun) {
      await admin.from('user_preferences').update({ last_reminder_sent_on: p.localDate }).eq('user_id', p.user_id);
    }
  }

  return res.status(200).json({
    dry_run: sender.dryRun,
    opted_in: prefs?.length ?? 0,
    due: due.length,
    [sender.dryRun ? 'would_send' : 'sent']: sent,
    failed: failures.length,
  });
}

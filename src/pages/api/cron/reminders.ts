import type { NextApiRequest, NextApiResponse } from 'next';
import { timingSafeEqual } from 'crypto';
import { getAdminClient } from '@/lib/server/supabase-admin';
import {
  appUrl,
  buildReminderEmail,
  getEmailSender,
  isReminderDue,
  unsubscribeUrl,
} from '@/lib/server/reminders';
import { pushConfigured, reminderPushMessage, sendPushToUser } from '@/lib/server/push';

/**
 * Daily reminders by email and/or phone notification. A scheduler calls this
 * every 15 minutes with `Authorization: Bearer <CRON_SECRET>`
 * (docs/REMINDERS.md). A channel without its keys runs as a dry run: it
 * logs who would get one and sends nothing. Only a real send counts toward
 * "once a day", so dry runs can be repeated safely.
 */
function authorized(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.authorization || '';
  if (!secret) return false;
  const expected = `Bearer ${secret}`;
  return header.length === expected.length && timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

type PrefRow = {
  user_id: string;
  reminder_time: string | null;
  timezone: string | null;
  last_reminder_sent_on: string | null;
  email_reminders_enabled: boolean;
  push_reminders_enabled: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  const admin = getAdminClient();
  const baseUrl = appUrl();
  const missing = [
    !admin && 'SUPABASE_SERVICE_ROLE_KEY',
    !baseUrl && 'NEXT_PUBLIC_APP_URL',
  ].filter(Boolean);
  // Email also needs REMINDER_SIGNING_SECRET (unsubscribe links); without it
  // emails are skipped and phone notifications still go out.
  if (!admin || !baseUrl || missing.length) return res.status(500).json({ error: 'Not configured', missing });

  const emailSender = getEmailSender();
  const pushLive = pushConfigured();
  const now = new Date();

  const { data, error } = await admin
    .from('user_preferences')
    .select('user_id, reminder_time, timezone, last_reminder_sent_on, email_reminders_enabled, push_reminders_enabled')
    .or('email_reminders_enabled.eq.true,push_reminders_enabled.eq.true');
  if (error) return res.status(500).json({ error: 'Could not load preferences' });
  const prefs = (data || []) as PrefRow[];

  const due = prefs.map(p => ({ ...p, ...isReminderDue(p, now) })).filter(p => p.due);
  const ids = due.map(p => p.user_id);
  const { data: profiles } = ids.length
    ? await admin.from('profiles').select('id, email, name').in('id', ids)
    : { data: [] as { id: string; email: string | null; name: string | null }[] };
  const byId = new Map((profiles || []).map(p => [p.id, p]));

  const counts = { email: 0, push_devices: 0, failed: 0 };
  for (const p of due) {
    const profile = byId.get(p.user_id);
    let reallySent = false;

    if (p.push_reminders_enabled) {
      const r = await sendPushToUser(admin, p.user_id, reminderPushMessage(profile?.name));
      counts.push_devices += r.delivered;
      if (!r.dryRun && r.delivered > 0) reallySent = true;
    }

    if (p.email_reminders_enabled && profile?.email) {
      const unsub = unsubscribeUrl(p.user_id, baseUrl);
      if (unsub) {
        const email = buildReminderEmail({ name: profile.name, unsubscribeUrl: unsub, baseUrl });
        const r = await emailSender.send({ to: profile.email, email, unsubscribeUrl: unsub });
        if (r.ok) {
          counts.email++;
          if (!emailSender.dryRun) reallySent = true;
        } else {
          counts.failed++;
          console.error('[reminders] email failed', p.user_id, r.error);
        }
      }
    }

    if (reallySent) {
      await admin.from('user_preferences').update({ last_reminder_sent_on: p.localDate }).eq('user_id', p.user_id);
    }
  }

  return res.status(200).json({
    email_dry_run: emailSender.dryRun,
    push_dry_run: !pushLive,
    opted_in: prefs.length,
    due: due.length,
    emails: counts.email,
    push_devices: counts.push_devices,
    failed: counts.failed,
  });
}

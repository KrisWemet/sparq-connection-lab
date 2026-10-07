// Daily reminder emails — server-side only.
//
// Structure only for now: with no provider key set, getEmailSender() returns
// a dry-run sender that logs what would go out and sends nothing. To turn
// sending on, see docs/REMINDERS.md.
//
// Reminders invite, never pressure (constitution §5A, §10): no streak talk,
// no "don't miss", no guilt. One a day at most, only for people who opted in.

import { createHmac, timingSafeEqual } from 'crypto';

/** Minutes after the chosen time in which a reminder may still go out. */
export const REMINDER_WINDOW_MINUTES = 60;

export type ReminderPrefs = {
  reminder_time: string | null;   // "HH:MM", the user's local time
  timezone: string | null;        // IANA, e.g. "America/Toronto"
  last_reminder_sent_on: string | null; // "YYYY-MM-DD" in the user's timezone
};

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function isValidReminderTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** The local date ("YYYY-MM-DD") and minutes since local midnight at `now`. */
export function localClock(now: Date, timeZone: string): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/**
 * Due when the user's local time is within the hour after their chosen time
 * and nothing has gone out yet on that local date. The window means turning
 * reminders on at 8pm for a 9am time waits until tomorrow, and a missed
 * scheduler run still catches up.
 */
export function isReminderDue(prefs: ReminderPrefs, now: Date): { due: boolean; localDate: string | null } {
  if (!prefs.timezone || !isValidTimeZone(prefs.timezone)) return { due: false, localDate: null };
  if (!prefs.reminder_time || !isValidReminderTime(prefs.reminder_time)) return { due: false, localDate: null };

  const { date, minutes } = localClock(now, prefs.timezone);
  const [h, m] = prefs.reminder_time.split(':').map(Number);
  const target = h * 60 + m;
  const sinceTarget = minutes - target;
  const inWindow = sinceTarget >= 0 && sinceTarget < REMINDER_WINDOW_MINUTES;
  return { due: inWindow && prefs.last_reminder_sent_on !== date, localDate: date };
}

// ── Unsubscribe links ────────────────────────────────────────────────────────

function signingSecret(): string | null {
  return process.env.REMINDER_SIGNING_SECRET || null;
}

export function signUnsubscribeToken(userId: string): string | null {
  const secret = signingSecret();
  if (!secret) return null;
  return createHmac('sha256', secret).update(`unsubscribe:${userId}`).digest('hex');
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = signUnsubscribeToken(userId);
  if (!expected || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

/** The public app address links point to, or null when not configured. */
export function appUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL; // set by Vercel
  const url = explicit || (vercel ? `https://${vercel}` : null);
  return url ? url.replace(/\/$/, '') : null;
}

export function unsubscribeUrl(userId: string, baseUrl: string): string | null {
  const token = signUnsubscribeToken(userId);
  if (!token) return null;
  return `${baseUrl}/api/reminders/unsubscribe?u=${encodeURIComponent(userId)}&t=${token}`;
}

// ── The email ────────────────────────────────────────────────────────────────

export type ReminderEmail = { subject: string; text: string; html: string };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export function buildReminderEmail(opts: { name?: string | null; unsubscribeUrl: string; baseUrl: string }): ReminderEmail {
  const first = opts.name?.trim().split(/\s+/)[0];
  const hello = first ? `Hi ${first},` : 'Hi there,';
  const practiceUrl = `${opts.baseUrl}/daily-growth`;
  const settingsUrl = `${opts.baseUrl}/settings`;

  const subject = 'Peter saved you a quiet five minutes';
  const lines = [
    hello,
    "Today's practice is ready whenever you are. It takes about five minutes: a short story, one small step, and a moment to notice how it went.",
    'If today is full, that is okay too. It will be there tomorrow.',
  ];

  const text = [
    ...lines,
    `Open today's practice: ${practiceUrl}`,
    '— Peter 🦦',
    `Change your reminder time: ${settingsUrl}`,
    `Stop these emails: ${opts.unsubscribeUrl}`,
  ].join('\n\n');

  const html = `<!doctype html><html><body style="margin:0;background:#F7F2EC;font-family:Georgia,serif;color:#3A2A3F">
<div style="max-width:480px;margin:0 auto;padding:32px 24px">
${lines.map(l => `<p style="font-size:16px;line-height:1.6;margin:0 0 16px">${escapeHtml(l)}</p>`).join('\n')}
<p style="margin:24px 0"><a href="${practiceUrl}" style="display:inline-block;background:#4B2E57;color:#fff;text-decoration:none;font-family:Georgia,serif;font-weight:bold;font-size:15px;padding:12px 22px;border-radius:999px">Open today&#39;s practice</a></p>
<p style="font-size:16px;margin:0 0 32px">— Peter 🦦</p>
<p style="font-family:Georgia,serif;font-size:12px;color:#685C6A;line-height:1.6;margin:0">
<a href="${settingsUrl}" style="color:#685C6A">Change your reminder time</a> · <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#685C6A">Stop these emails</a>
</p>
</div></body></html>`;

  return { subject, text, html };
}

// ── Sending ──────────────────────────────────────────────────────────────────

export type EmailSender = {
  /** true when nothing is really sent */
  dryRun: boolean;
  send: (msg: { to: string; email: ReminderEmail; unsubscribeUrl: string }) => Promise<{ ok: boolean; error?: string }>;
};

const dryRunSender: EmailSender = {
  dryRun: true,
  async send({ to, email }) {
    console.log(`[reminders] dry run — would email ${to.replace(/^(.).*@/, '$1***@')}: "${email.subject}"`);
    return { ok: true };
  },
};

/** Resend over plain fetch (no SDK). Used only once both env vars are set. */
function resendSender(apiKey: string, from: string): EmailSender {
  return {
    dryRun: false,
    async send({ to, email, unsubscribeUrl: unsub }) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to,
          subject: email.subject,
          text: email.text,
          html: email.html,
          headers: {
            'List-Unsubscribe': `<${unsub}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      });
      if (!res.ok) return { ok: false, error: `${res.status} ${(await res.text()).slice(0, 200)}` };
      return { ok: true };
    },
  };
}

export function getEmailSender(): EmailSender {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REMINDER_FROM_EMAIL;
  return apiKey && from ? resendSender(apiKey, from) : dryRunSender;
}

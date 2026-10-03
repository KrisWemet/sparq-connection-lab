# Daily reminders: phone notifications and email

**Status (2026-10-03): built, not switched on.** Two channels share one
reminder time and one job:

- **Phone notifications (web push)** — free. The server signs messages with
  its own VAPID keys; no paid service. Needs only the keys below.
- **Email** — needs a paid-or-free-tier provider (Resend is wired in).

A channel without its keys is a dry run: the job logs who would get one and
sends nothing. Each Settings row stays hidden until its channel is switched
on, so no one can turn on a reminder that never arrives.

## How it works

- **Opt-in only.** `user_preferences.push_reminders_enabled` and
  `email_reminders_enabled` (both default off) are the consent.
  `notifications_enabled` is *not* consent — it defaulted to true for everyone.
- **Settings → Reminders**: a "Phone notification" switch (shown when
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set), a "Daily reminder email" switch
  (shown when `NEXT_PUBLIC_EMAIL_REMINDERS_ENABLED=true`) and one time. Saving
  also stores the browser's timezone.
- **Phones**: turning the switch on asks the browser's permission, registers
  `public/sw.js` (notifications only, no caching) and saves the device in
  `push_subscriptions` (one row per phone/browser). Phones the push service
  reports gone are removed automatically. "Send a test" sends one right away.
  - **Android / desktop Chrome, Edge, Firefox**: works in the browser. Android
    gives a soft double-buzz.
  - **iPhone / iPad**: only after "Add to Home Screen" (iOS 16.4+), then
    opened from the Home Screen. Settings explains this. The buzz and sound
    follow the person's own iPhone settings.
- **`/api/cron/reminders`** (needs `Authorization: Bearer <CRON_SECRET>`), meant
  to run every 15 minutes. A user is due when their local time is within the
  hour after their chosen time and nothing went out yet that local day
  (`last_reminder_sent_on`). Turning reminders on at 8pm for a 9am time waits
  until tomorrow.
- **The email** (`buildReminderEmail` in `src/lib/server/reminders.ts`) is in
  Peter's voice: an invitation, never pressure — no streaks, no "don't miss".
- **Unsubscribe**: every email has a signed one-click link
  (`/api/reminders/unsubscribe`) plus `List-Unsubscribe` headers for mail apps.
  The law requires this for these emails.

## Turning it on

1. **Phone notifications (free):** run `npx web-push generate-vapid-keys`
   once and keep the private key secret.
2. **Email (optional, later):** pick a sending address and verify its domain
   with the provider (Resend is wired in; it's one function in
   `reminders.ts` to swap).
3. **Set these in Vercel** (Production), then redeploy (the `NEXT_PUBLIC_`
   ones are baked in at build time):

   | Variable | What it is |
   |---|---|
   | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push public key. Shows the phone switch. |
   | `VAPID_PRIVATE_KEY` | Push private key — secret. |
   | `VAPID_SUBJECT` | `mailto:you@yourdomain.com` — push services contact this if something's wrong |
   | `CRON_SECRET` | `openssl rand -hex 32` — protects the job endpoint |
   | `REMINDER_SIGNING_SECRET` | `openssl rand -hex 32` — signs email unsubscribe links |
   | `NEXT_PUBLIC_APP_URL` | e.g. `https://yourdomain.com` (falls back to Vercel's production URL) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Already needed by memory; the job and device saving use it too |
   | `RESEND_API_KEY` | Email only. While unset, email is a dry run. |
   | `REMINDER_FROM_EMAIL` | Email only. e.g. `Peter at Sparq <peter@yourdomain.com>` |
   | `NEXT_PUBLIC_EMAIL_REMINDERS_ENABLED` | Email only. `true` shows the email switch. |

4. **Schedule the job every 15 minutes.** Vercel's free plan only runs cron
   jobs once a day, so use Supabase (free). In the SQL editor, with the
   `pg_cron` and `pg_net` extensions enabled:

   ```sql
   select cron.schedule(
     'sparq-reminders',
     '*/15 * * * *',
     $$ select net.http_post(
          url := 'https://YOUR-APP-URL/api/cron/reminders',
          headers := jsonb_build_object('Authorization', 'Bearer YOUR-CRON-SECRET')
        ) $$
   );
   ```

   To stop it: `select cron.unschedule('sparq-reminders');`

5. **Check it**: turn on Phone notification in Settings on your own phone
   and tap "Send a test". Then
   `curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR-APP-URL/api/cron/reminders`
   returns `{ email_dry_run, push_dry_run, opted_in, due, emails, push_devices, failed }`.

## Not built yet

- **Partner emails** ("your partner finished today"): must be opt-in by the
  partner who finished, not only the one receiving it (constitution §8).
- **Skipping people who already practised today.**

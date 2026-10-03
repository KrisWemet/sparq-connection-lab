# Daily reminder emails

**Status (2026-10-03): built, not switched on.** Everything is in place except
an email provider. Until one is configured, the reminder job runs as a dry
run: it works out who is due and logs it, but sends nothing and records
nothing. The Settings switch stays hidden, so no one can turn on a reminder
that never arrives.

## How it works

- **Opt-in only.** `user_preferences.email_reminders_enabled` (default off) is
  the consent. `notifications_enabled` is *not* consent — it defaulted to true
  for everyone.
- **Settings → Reminders** (shown when `NEXT_PUBLIC_REMINDERS_ENABLED=true`):
  a switch and a time. Saving also stores the browser's timezone.
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

1. **Pick a sending address and verify its domain** with the provider
   (Resend is wired in; it's one function in `reminders.ts` to swap).
2. **Set these in Vercel** (Production):

   | Variable | What it is |
   |---|---|
   | `RESEND_API_KEY` | Provider key. While unset, everything is a dry run. |
   | `REMINDER_FROM_EMAIL` | e.g. `Peter at Sparq <peter@yourdomain.com>` |
   | `REMINDER_SIGNING_SECRET` | `openssl rand -hex 32` — signs unsubscribe links |
   | `CRON_SECRET` | `openssl rand -hex 32` — protects the job endpoint |
   | `NEXT_PUBLIC_APP_URL` | e.g. `https://yourdomain.com` (falls back to Vercel's production URL) |
   | `NEXT_PUBLIC_REMINDERS_ENABLED` | `true` to show the Settings switch |
   | `SUPABASE_SERVICE_ROLE_KEY` | Already needed by memory; the job uses it too |

3. **Schedule the job every 15 minutes.** Vercel's free plan only runs cron
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

4. **Check it**: `curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR-APP-URL/api/cron/reminders`
   returns `{ dry_run, opted_in, due, sent | would_send, failed }`. Before step 1
   it says `"dry_run": true` — a safe way to see who would get one.

## Not built yet

- **Partner emails** ("your partner finished today"): must be opt-in by the
  partner who finished, not only the one receiving it (constitution §8).
- **Skipping people who already practised today.**

-- Daily reminder emails (2026-10-03). Structure only: nothing sends until an
-- email provider key is set (see docs/REMINDERS.md).
--
-- notifications_enabled defaults to true for everyone and was never a real
-- choice, so it is not consent to email. email_reminders_enabled is the
-- explicit opt-in (off by default).

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS email_reminders_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_reminder_sent_on date;

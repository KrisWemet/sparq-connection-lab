-- Phone notifications via web push (2026-10-03). Free: no paid service, the
-- server signs messages with its own VAPID keys (docs/REMINDERS.md).
--
-- One row per device/browser that said yes. Turning reminders on is the
-- consent (push_reminders_enabled, default off); a device is only stored
-- after the person grants the browser's notification permission.

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS push_reminders_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_success_at timestamptz
);
CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON public.push_subscriptions (user_id);

-- Writes go through the API (service role) so a shared device can move to
-- whoever signed in last; people can see and remove their own devices.
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY push_subscriptions_select_own ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY push_subscriptions_delete_own ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

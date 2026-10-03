// Phone notifications (web push) — server-side only.
//
// Free: the server signs each message with its own VAPID keys and hands it to
// the phone maker's push service (Apple, Google, Mozilla). No paid provider.
// While the keys aren't set, sending is a dry run (docs/REMINDERS.md).

import webpush from 'web-push';
import type { SupabaseClient } from '@supabase/supabase-js';

export type PushMessage = { title: string; body: string; url: string; tag?: string };

type SubscriptionRow = { id: string; endpoint: string; p256dh: string; auth: string };

let configured: boolean | null = null;

/** True once VAPID keys are set; configures web-push on first call. */
export function pushConfigured(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT; // "mailto:you@yourdomain.com" or a URL
  configured = !!(publicKey && privateKey && subject);
  if (configured) webpush.setVapidDetails(subject!, publicKey!, privateKey!);
  return configured;
}

/**
 * Sends to every device the user turned notifications on for. Devices the
 * push service says are gone (uninstalled, permission revoked) are removed.
 * Returns how many devices it reached.
 */
export async function sendPushToUser(
  admin: SupabaseClient,
  userId: string,
  message: PushMessage,
): Promise<{ delivered: number; dryRun: boolean }> {
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);
  const devices = (subs || []) as SubscriptionRow[];

  if (!pushConfigured()) {
    if (devices.length) console.log(`[push] dry run — would notify ${devices.length} device(s): "${message.title}"`);
    return { delivered: devices.length, dryRun: true };
  }

  let delivered = 0;
  const payload = JSON.stringify(message);
  for (const d of devices) {
    try {
      await webpush.sendNotification(
        { endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } },
        payload,
        { TTL: 60 * 60 * 6, urgency: 'normal' }, // a reminder older than 6h isn't worth showing
      );
      delivered++;
      await admin.from('push_subscriptions').update({ last_success_at: new Date().toISOString() }).eq('id', d.id);
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await admin.from('push_subscriptions').delete().eq('id', d.id);
      } else {
        console.error('[push] send failed', status, (err as Error).message);
      }
    }
  }
  return { delivered, dryRun: false };
}

export function reminderPushMessage(name?: string | null): PushMessage {
  const first = name?.trim().split(/\s+/)[0];
  return {
    title: 'Sparq',
    body: first
      ? `Peter saved you five quiet minutes, ${first}. Whenever you're ready. 🦦`
      : "Peter saved you five quiet minutes. Whenever you're ready. 🦦",
    url: '/daily-growth',
    tag: 'sparq-reminder',
  };
}

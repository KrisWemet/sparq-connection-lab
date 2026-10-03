// Phone notifications — browser side. Registers the service worker
// (public/sw.js), asks permission, and hands the device to /api/push/subscribe.

import { buildAuthedHeaders } from '@/lib/api-auth';

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

/**
 * - 'supported': can turn on here
 * - 'needs-install': iPhone/iPad in the browser; works once added to the Home Screen
 * - 'unsupported': this browser can't do it
 */
export type PushSupport = 'supported' | 'needs-install' | 'unsupported';

export function getPushSupport(): PushSupport {
  if (typeof window === 'undefined') return 'unsupported';
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const capable = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (isIOS && !standalone) return 'needs-install';
  return capable ? 'supported' : 'unsupported';
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/');
  return existing ?? navigator.serviceWorker.register('/sw.js', { scope: '/' });
}

/** Whether this device currently has notifications on for Sparq. */
export async function isThisDeviceSubscribed(): Promise<boolean> {
  if (getPushSupport() !== 'supported' || Notification.permission !== 'granted') return false;
  const reg = await navigator.serviceWorker.getRegistration('/');
  return !!(await reg?.pushManager.getSubscription());
}

export type EnableResult = { ok: true } | { ok: false; reason: 'denied' | 'unsupported' | 'error' };

/** Must be called from a tap (browsers only show the permission prompt then). */
export async function enablePushOnThisDevice(): Promise<EnableResult> {
  if (getPushSupport() !== 'supported' || !VAPID_PUBLIC_KEY) return { ok: false, reason: 'unsupported' };
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return { ok: false, reason: 'denied' };
    const reg = await registration();
    await navigator.serviceWorker.ready;
    const subscription =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      }));
    const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch('/api/push/subscribe', { method: 'POST', headers, body: JSON.stringify(subscription.toJSON()) });
    return res.ok ? { ok: true } : { ok: false, reason: 'error' };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

export async function disablePushOnThisDevice(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.getRegistration('/');
    const subscription = await reg?.pushManager.getSubscription();
    if (!subscription) return;
    const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
    await fetch('/api/push/subscribe', { method: 'DELETE', headers, body: JSON.stringify({ endpoint: subscription.endpoint }) });
    await subscription.unsubscribe();
  } catch {
    // Already gone, or the browser blocked it — nothing more to do here.
  }
}

export async function sendTestPush(): Promise<boolean> {
  const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch('/api/push/test', { method: 'POST', headers, body: '{}' });
  return res.ok;
}

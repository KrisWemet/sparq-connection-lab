// client.ts — the browser's view of journey state. Supabase is the source of
// truth (/api/journeys/state); nothing about journeys is kept in localStorage
// any more, except the one-time import of what older versions saved there.

import { buildAuthedHeaders } from '@/lib/api-auth';
import type { JourneyState, StageId } from './progress';

export type ClientJourney = JourneyState & {
  id: string | null;
  title: string;
  shape: 'daily' | 'staged';
  /** Days in the journey (daily) or in each stage (staged). */
  days: number;
  start_date: string | null;
  completion_synthesis: string | null;
};

export type JourneyStateResponse = { journeys: ClientJourney[]; active: ClientJourney | null };

export type JourneyActionBody =
  | { action: 'activate'; journey_id: string; stage?: StageId }
  | { action: 'pause' | 'leave'; journey_id: string }
  | { action: 'stage'; journey_id: string; stage: StageId }
  | { action: 'step'; journey_id: string; day: number; stage?: StageId | null; responses?: Record<string, string> };

export type JourneyActionResult = {
  ok: boolean;
  status: number;
  error?: string;
  message?: string;
  journey?: ClientJourney;
  /** Set when activation was refused because another journey is active. */
  active_journey_id?: string | null;
  active_title?: string | null;
  advanced?: boolean;
  stage_completed?: StageId | null;
  journey_completed?: boolean;
};

const LEGACY_JOURNEY_KEY = 'sparq_journey_progress';
const LEGACY_TIER_KEY = 'sparq_tier_progress';
// Set once the browser's old progress reached the server. The old keys are
// left in place as a backup; nothing reads them any more.
const IMPORT_FLAG = 'sparq_journey_import_v1';

function readStorage(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the import just runs again next time.
  }
}

function parseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

let importInFlight: Promise<void> | null = null;

/**
 * Sends progress saved by older versions of the app (browser-only) to the
 * user's account, once. The server never overwrites what it already has.
 */
export function importBrowserProgressOnce(): Promise<void> {
  if (typeof window === 'undefined' || readStorage(IMPORT_FLAG) === 'done') return Promise.resolve();
  if (importInFlight) return importInFlight;

  importInFlight = (async () => {
    const journeyProgress = parseJson(readStorage(LEGACY_JOURNEY_KEY));
    const tierProgress = parseJson(readStorage(LEGACY_TIER_KEY));
    if (!journeyProgress && !tierProgress) {
      writeStorage(IMPORT_FLAG, 'done');
      return;
    }
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      if (!headers.Authorization) return; // signed out: try again after sign-in
      const res = await fetch('/api/journeys/state', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'import', journey_progress: journeyProgress, tier_progress: tierProgress }),
      });
      if (res.ok) writeStorage(IMPORT_FLAG, 'done');
    } catch {
      // Network trouble: try again next time.
    }
  })().finally(() => {
    importInFlight = null;
  });
  return importInFlight;
}

/** The user's journeys and the active one, or null when it couldn't load. */
export async function fetchJourneyState(): Promise<JourneyStateResponse | null> {
  await importBrowserProgressOnce();
  try {
    const headers = await buildAuthedHeaders();
    if (!headers.Authorization) return null;
    const res = await fetch('/api/journeys/state', { headers });
    if (!res.ok) return null;
    return (await res.json()) as JourneyStateResponse;
  } catch {
    return null;
  }
}

export async function journeyAction(body: JourneyActionBody): Promise<JourneyActionResult> {
  try {
    const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch('/api/journeys/state', { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, ...data };
  } catch {
    return { ok: false, status: 0, error: 'network' };
  }
}

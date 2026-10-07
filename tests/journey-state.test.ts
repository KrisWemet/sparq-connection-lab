import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/entitlements', () => ({ resolveEntitlements: async () => ({ starter_quests_limit: null }) }));
vi.mock('@/lib/server/analytics', () => ({ trackEvent: async () => {} }));

import { activateJourney, getActiveJourney, recordJourneyStep, setJourneyAside } from '@/lib/server/journey-state';
import { getCatalogJourney, isDailyJourney, journeyCatalog } from '@/lib/journeys/catalog';
import { newJourneyState, recordStep, transition, type JourneyShape } from '@/lib/journeys/progress';
import { starterJourneyIds } from '@/data/starter-journeys';

// Regression tests for the Phase 1 review (approved by Chris 2026-10-04):
// a day started on one journey is credited to that journey even if the user
// switched journeys before finishing it, without touching the journey they
// switched to; and every journey resolves through the one catalog.

const AT = '2026-10-04T18:00:00.000Z';
const DAILY: JourneyShape = { kind: 'daily', length: 2 };

describe('recordStep — a day started before switching journeys', () => {
  it('credits a paused or left journey only when asked, and keeps its status', () => {
    const paused = transition(newJourneyState('a', DAILY), DAILY, 'pause', AT);
    if (!paused.ok) throw new Error('expected ok');
    expect(recordStep(paused.state, DAILY, { day: 1, at: AT }).advanced).toBe(false);
    const credited = recordStep(paused.state, DAILY, { day: 1, at: AT }, { creditSetAside: true });
    expect(credited.advanced).toBe(true);
    expect(credited.state.status).toBe('paused');
    expect(credited.state.journey_day).toBe(2);

    const left = transition(newJourneyState('a', DAILY), DAILY, 'leave', AT);
    if (!left.ok) throw new Error('expected ok');
    expect(recordStep(left.state, DAILY, { day: 1, at: AT }, { creditSetAside: true }).state.status).toBe('left');
  });

  it('never credits a completed journey', () => {
    const done = { ...newJourneyState('a', DAILY), status: 'completed' as const };
    expect(recordStep(done, DAILY, { day: 1, at: AT }, { creditSetAside: true }).advanced).toBe(false);
  });
});

// In-memory stand-in for the Supabase client: just the calls journey-state.ts
// makes, plus the one-active-journey rule the database enforces.
function fakeDb() {
  const tables: Record<string, any[]> = { user_journeys: [], user_insights: [], journey_step_entries: [], daily_sessions: [] };
  let seq = 0;
  const from = (table: string) => {
    const filters: Array<(r: any) => boolean> = [];
    let op = 'select';
    let payload: any;
    let conflict: string[] = [];
    let one = false;
    let head = false;
    const run = () => {
      const rows = tables[table];
      if (op === 'select') {
        const hits = rows.filter(r => filters.every(f => f(r)));
        if (head) return { count: hits.length, error: null };
        return { data: one ? hits[0] ?? null : hits, error: null };
      }
      if (op === 'insert') {
        const row = { id: `row-${++seq}`, ...payload };
        rows.push(row);
        return { data: row, error: null };
      }
      if (op === 'update') {
        const hits = rows.filter(r => filters.every(f => f(r)));
        hits.forEach(r => Object.assign(r, payload));
        return { data: one ? hits[0] ?? null : hits, error: null };
      }
      for (const p of [payload].flat()) {
        const hit = rows.find(r => conflict.every(k => r[k] === p[k]));
        if (hit) Object.assign(hit, p); else rows.push({ id: `row-${++seq}`, ...p });
      }
      return { data: null, error: null };
    };
    const q: any = {
      select: (_c?: string, o?: { head?: boolean }) => { head = Boolean(o?.head); return q; },
      eq: (k: string, v: unknown) => { filters.push(r => r[k] === v); return q; },
      order: () => q,
      limit: () => q,
      insert: (p: any) => { op = 'insert'; payload = p; return q; },
      update: (p: any) => { op = 'update'; payload = p; return q; },
      upsert: (p: any, o: { onConflict: string }) => { op = 'upsert'; payload = p; conflict = o.onConflict.split(','); return q; },
      single: () => { one = true; return q; },
      maybeSingle: () => { one = true; return q; },
      then: (resolve: any, reject: any) => {
        const result = run();
        if (table === 'user_journeys') {
          const active = tables.user_journeys.filter(r => r.status === 'active');
          if (new Set(active.map(r => r.user_id)).size !== active.length) throw new Error('two active journeys');
        }
        return Promise.resolve(result).then(resolve, reject);
      },
    };
    return q;
  };
  return { db: { from } as any, tables };
}

// One journey at a time (approved by Chris 2026-10-07): a second journey
// can't start while one is active; the user pauses or finishes it first.
describe('activateJourney — one journey at a time', () => {
  it('refuses a second journey until the first is paused, and keeps the first as it was', async () => {
    const { db, tables } = fakeDb();
    const u = 'user-4';
    await activateJourney(db, u, 'shared-language');

    const blocked = await activateJourney(db, u, 'building-trust');
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toBe('another_journey_active');
      expect(blocked.active?.journey_id).toBe('shared-language');
    }
    expect(tables.user_journeys.find(r => r.journey_id === 'shared-language').status).toBe('active');
    expect(tables.user_journeys.some(r => r.journey_id === 'building-trust')).toBe(false);
    expect(tables.user_insights[0].active_journey_id).toBe('shared-language');

    // Re-opening the active journey itself is fine.
    expect((await activateJourney(db, u, 'shared-language')).ok).toBe(true);

    await setJourneyAside(db, u, 'shared-language', 'pause');
    const started = await activateJourney(db, u, 'building-trust');
    expect(started.ok).toBe(true);
    expect(tables.user_journeys.find(r => r.journey_id === 'shared-language').status).toBe('paused');
    expect((await getActiveJourney(db, u))?.journey_id).toBe('building-trust');
  });
});

describe('recordJourneyStep — mid-day switch', () => {
  it('credits the day to the journey it was started on and leaves the new journey alone', async () => {
    const { db, tables } = fakeDb();
    const u = 'user-1';
    await activateJourney(db, u, 'shared-language');          // day 1 of A started this morning
    await setJourneyAside(db, u, 'shared-language', 'pause'); // paused A (one journey at a time)…
    await activateJourney(db, u, 'building-trust');           // …and switched to B before the evening

    const step = await recordJourneyStep(db, u, 'shared-language', { day: 1 }, { creditSetAside: true });
    expect(step.ok && step.value.advanced).toBe(true);
    expect(step.ok && step.value.wasActive).toBe(false);

    const a = tables.user_journeys.find(r => r.journey_id === 'shared-language');
    const b = tables.user_journeys.find(r => r.journey_id === 'building-trust');
    expect(a.status).toBe('paused');
    expect(a.journey_day).toBe(2);
    expect(b.status).toBe('active');
    expect(b.journey_day).toBe(1);
    expect(b.progress).toBe(0);
    expect(tables.user_insights[0].active_journey_id).toBe('building-trust');
    expect((await getActiveJourney(db, u))?.journey_id).toBe('building-trust');
  });

  it('finishing a set-aside journey records it without touching the active journey or asking "what next?"', async () => {
    const { db, tables } = fakeDb();
    const u = 'user-2';
    const length = getCatalogJourney('shared-language')!.shape;
    if (length.kind !== 'daily') throw new Error('expected a daily journey');
    await activateJourney(db, u, 'shared-language');
    for (let day = 1; day < length.length; day++) await recordJourneyStep(db, u, 'shared-language', { day });
    await setJourneyAside(db, u, 'shared-language', 'pause');
    await activateJourney(db, u, 'building-trust');

    const last = await recordJourneyStep(db, u, 'shared-language', { day: length.length }, { creditSetAside: true });
    expect(last.ok && last.value.journeyCompleted).toBe(true);
    expect(tables.user_journeys.find(r => r.journey_id === 'shared-language').status).toBe('completed');
    expect(tables.user_insights[0].active_journey_id).toBe('building-trust');
    expect(tables.user_insights[0].journey_completion_state ?? null).toBe(null);
    expect(tables.user_insights[0].last_completed_journey_id).toBe('shared-language');
  });

  it('without the flag, a set-aside journey is not credited', async () => {
    const { db, tables } = fakeDb();
    await activateJourney(db, 'user-3', 'shared-language');
    await setJourneyAside(db, 'user-3', 'shared-language', 'pause');
    await activateJourney(db, 'user-3', 'building-trust');
    const step = await recordJourneyStep(db, 'user-3', 'shared-language', { day: 1 });
    expect(step.ok && step.value.advanced).toBe(false);
    expect(tables.user_journeys.find(r => r.journey_id === 'shared-language').journey_day).toBe(1);
  });
});

describe('journey catalog — every journey starts through the same path', () => {
  it('every starter journey (what onboarding recommends) is a daily journey', () => {
    for (const id of starterJourneyIds) expect(isDailyJourney(id)).toBe(true);
  });

  it('every staged journey page has a staged catalog entry', () => {
    const pages = readdirSync(join(__dirname, '..', 'src', 'pages', 'journeys'))
      .filter(f => f.endsWith('.tsx') && f !== 'journey-template.tsx')
      .map(f => f.replace(/\.tsx$/, ''));
    expect(pages.length).toBeGreaterThan(0);
    for (const id of pages) expect(getCatalogJourney(id)?.shape.kind).toBe('staged');
  });

  it('ids never collide between the two kinds', () => {
    expect(journeyCatalog.size).toBe(starterJourneyIds.length + 13);
  });
});

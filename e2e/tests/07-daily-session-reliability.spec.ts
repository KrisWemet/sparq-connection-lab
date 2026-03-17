import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import type { APIResponse } from '@playwright/test';

type StorageState = {
  origins?: Array<{
    origin: string;
    localStorage?: Array<{ name: string; value: string }>;
  }>;
};

function readAuthToken(): string {
  const authFile = path.join(__dirname, '..', '.auth', 'user.json');
  const raw = fs.readFileSync(authFile, 'utf-8');
  const state = JSON.parse(raw) as StorageState;

  for (const origin of state.origins || []) {
    for (const entry of origin.localStorage || []) {
      if (!entry.name.includes('-auth-token')) continue;
      try {
        const parsed = JSON.parse(entry.value) as { access_token?: string };
        if (parsed.access_token) return parsed.access_token;
      } catch {
        // Continue scanning in case another origin entry is valid.
      }
    }
  }

  throw new Error('No Supabase access token found in e2e/.auth/user.json');
}

function toLocalDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function uniqueFutureDate(offsetDays: number): string {
  const now = new Date();
  const seed = Math.floor(Math.random() * 1_000_000);
  const d = new Date(Date.UTC(2099, 0, 1));
  d.setUTCDate(d.getUTCDate() + offsetDays + (seed % 365));
  // Keep the date in the future even if randomization shifts by calendar operations.
  if (d <= now) d.setUTCFullYear(now.getUTCFullYear() + 20);
  return toLocalDate(d);
}

async function expectOk(response: APIResponse, label: string): Promise<void> {
  if (response.ok()) return;
  const body = await response.text();
  throw new Error(`${label} failed: HTTP ${response.status()} ${response.statusText()} - ${body}`);
}

test.describe('Daily Session Reliability APIs', () => {
  const token = readAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  test('duplicate same-day start returns reused session', async ({ request }) => {
    const localDate = uniqueFutureDate(7);
    const body = {
      local_date: localDate,
      timezone: 'UTC',
      idempotency_key: `dup-${Date.now()}`,
    };

    const first = await request.post('/api/daily/session/start', {
      headers,
      data: body,
    });
    await expectOk(first, 'first start');
    const firstPayload = await first.json();
    expect(firstPayload.session?.id).toBeTruthy();

    const second = await request.post('/api/daily/session/start', {
      headers,
      data: body,
    });
    await expectOk(second, 'second start');
    const secondPayload = await second.json();

    expect(secondPayload.reused).toBeTruthy();
    expect(secondPayload.session?.id).toBe(firstPayload.session?.id);
  });

  test('concurrent start race resolves to one logical session', async ({ request }) => {
    const localDate = uniqueFutureDate(21);

    const [r1, r2] = await Promise.all([
      request.post('/api/daily/session/start', {
        headers,
        data: {
          local_date: localDate,
          timezone: 'UTC',
          idempotency_key: `race-a-${Date.now()}`,
        },
      }),
      request.post('/api/daily/session/start', {
        headers,
        data: {
          local_date: localDate,
          timezone: 'UTC',
          idempotency_key: `race-b-${Date.now()}`,
        },
      }),
    ]);

    await expectOk(r1, 'race start #1');
    await expectOk(r2, 'race start #2');

    const p1 = await r1.json();
    const p2 = await r2.json();

    expect(p1.session?.id).toBeTruthy();
    expect(p2.session?.id).toBeTruthy();
    expect(p1.session?.id).toBe(p2.session?.id);
    expect(Boolean(p1.reused) || Boolean(p2.reused)).toBeTruthy();
  });

  test('double completion does not double-increment day index', async ({ request }) => {
    const localDate = uniqueFutureDate(35);

    const start = await request.post('/api/daily/session/start', {
      headers,
      data: {
        local_date: localDate,
        timezone: 'UTC',
        idempotency_key: `complete-${Date.now()}`,
      },
    });
    await expectOk(start, 'start for completion');
    const startPayload = await start.json();
    const sessionId = startPayload.session?.id as string;
    expect(sessionId).toBeTruthy();

    const viewed = await request.post('/api/daily/session/morning-viewed', {
      headers,
      data: { session_id: sessionId },
    });
    await expectOk(viewed, 'morning-viewed');

    const complete1 = await request.post('/api/daily/session/complete', {
      headers,
      data: {
        session_id: sessionId,
        evening_reflection: 'First completion attempt from reliability test.',
        evening_peter_response: 'Warm coaching response.',
        completion_local_date: localDate,
      },
    });
    await expectOk(complete1, 'first complete');
    const c1 = await complete1.json();
    expect(c1.completed).toBeTruthy();
    expect(c1.already_completed).toBeFalsy();
    expect(typeof c1.next_day_index).toBe('number');

    const complete2 = await request.post('/api/daily/session/complete', {
      headers,
      data: {
        session_id: sessionId,
        evening_reflection: 'Second completion attempt should be idempotent.',
        evening_peter_response: 'Second response.',
        completion_local_date: localDate,
      },
    });
    await expectOk(complete2, 'second complete');
    const c2 = await complete2.json();
    expect(c2.completed).toBeTruthy();
    expect(c2.already_completed).toBeTruthy();
    expect(c2.next_day_index).toBe(c1.next_day_index);
  });
});

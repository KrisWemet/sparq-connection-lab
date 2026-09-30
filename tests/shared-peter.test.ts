import { beforeEach, describe, expect, it, vi } from 'vitest';

// Constitution §8: Shared Peter uses only shared, jointly generated or
// explicitly authorized information; drafting a share never shares anything.

const touched: Array<{ table: string; op: string }> = [];

function fakeClient(rows: Record<string, unknown[]>) {
  return {
    rpc: vi.fn(async () => ({ data: 'space-1', error: null })),
    from(table: string) {
      const chain: any = {
        select: () => { touched.push({ table, op: 'select' }); return chain; },
        insert: () => { touched.push({ table, op: 'insert' }); return chain; },
        update: () => { touched.push({ table, op: 'update' }); return chain; },
        delete: () => { touched.push({ table, op: 'delete' }); return chain; },
        eq: () => chain, neq: () => chain, order: () => chain, limit: () => chain,
        maybeSingle: async () => ({ data: (rows[table] || [])[0] ?? null }),
        then: (resolve: (v: unknown) => void) => resolve({ data: rows[table] || [] }),
      };
      return chain;
    },
  };
}

let client: ReturnType<typeof fakeClient>;
vi.mock('@/lib/server/supabase-auth', () => ({ getAuthedContext: async () => ({ supabase: client, userId: 'me' }) }));
const peterChat = vi.fn();
vi.mock('@/lib/openrouter', () => ({ peterChat: (...args: unknown[]) => peterChat(...args) }));

function mockRes() {
  const res: any = { statusCode: 0, body: null };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: unknown) => { res.body = b; return res; };
  return res;
}

beforeEach(() => { touched.length = 0; peterChat.mockReset(); });

describe('Shared Peter reads only what was shared', () => {
  it('touches no private tables and labels partners without ranking them', async () => {
    client = fakeClient({
      shared_items: [
        { author_id: 'me', kind: 'appreciation', body: 'I loved our walk', created_at: '2026-09-29' },
        { author_id: 'partner', kind: 'need', body: 'More quiet mornings', created_at: '2026-09-28' },
      ],
      interaction_cycles: [],
    });
    peterChat.mockResolvedValue('{"question":"What made the walk feel good?","why":"It is something you both enjoyed."}');
    const { default: handler } = await import('@/pages/api/peter/shared-reflect');
    const res = mockRes();
    await handler({ method: 'POST', body: {} } as any, res);

    expect(res.body.question).toBe('What made the walk feel good?');
    const tables = new Set(touched.map(t => t.table));
    expect([...tables].sort()).toEqual(['interaction_cycles', 'shared_items']);
    expect(touched.every(t => t.op === 'select')).toBe(true);
    const prompt = JSON.stringify(peterChat.mock.calls[0][0]);
    expect(prompt).toContain('Partner 1');
    expect(prompt).toContain('Partner 2');
    expect(prompt).not.toContain('"me"');
  });
});

describe('share drafts are never shared or stored', () => {
  it('only reads the partner name and writes nothing', async () => {
    client = fakeClient({ profiles: [{ partner_name: 'Sam' }] });
    peterChat.mockResolvedValue('I have been noticing I go quiet when I feel unsure.');
    const { default: handler } = await import('@/pages/api/peter/share-draft');
    const res = mockRes();
    await handler({ method: 'POST', body: { text: 'I go quiet when unsure' } } as any, res);

    expect(res.body.draft).toContain('go quiet');
    expect(touched).toEqual([{ table: 'profiles', op: 'select' }]);
  });

  it("falls back to the user's own words if Peter is unavailable", async () => {
    client = fakeClient({ profiles: [] });
    peterChat.mockRejectedValue(new Error('down'));
    const { default: handler } = await import('@/pages/api/peter/share-draft');
    const res = mockRes();
    await handler({ method: 'POST', body: { text: 'my own words' } } as any, res);
    expect(res.body).toEqual({ draft: 'my own words', fallback: true });
    expect(touched.some(t => t.op !== 'select')).toBe(false);
  });
});

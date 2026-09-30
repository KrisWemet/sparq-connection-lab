import { beforeEach, describe, expect, it, vi } from 'vitest';

// Constitution §8 / §12: private knowledge boundaries, selective retrieval,
// and "nothing worth remembering is a valid outcome".

const rpc = vi.fn();
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ rpc }) }));
vi.mock('@/lib/server/embeddings', () => ({ embed: async () => [0.1, 0.2] }));

const TRACE = { id: 'trace', memory: 'user: raw evening words', metadata: { trace: true }, similarity: 0.99 };
const NORMAL = { id: 'm1', memory: 'Their mom is visiting for two weeks', metadata: { source: 'evening_reflection' }, kind: 'context', similarity: 0.8, score: 0.8 };

describe('searchMemories — growth traces never reach Peter', () => {
  beforeEach(() => {
    rpc.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test';
  });

  it('filters traces out of ranked results', async () => {
    rpc.mockResolvedValueOnce({ data: [TRACE, NORMAL], error: null });
    const { searchMemories } = await import('@/lib/server/memory');
    const { results } = await searchMemories('u1', 'hello', 5);
    expect(results.map(r => r.id)).toEqual(['m1']);
  });

  it('filters traces out of the legacy fallback RPC too', async () => {
    rpc
      .mockResolvedValueOnce({ data: null, error: { message: 'function match_memories_ranked does not exist' } })
      .mockResolvedValueOnce({ data: [TRACE, NORMAL], error: null });
    const { searchMemories } = await import('@/lib/server/memory');
    const { results } = await searchMemories('u1', 'hello', 5);
    expect(rpc).toHaveBeenLastCalledWith('match_memories', expect.anything());
    expect(results.map(r => r.id)).toEqual(['m1']);
  });
});

describe('sanitizeDistilledMemories — only what is worth remembering', () => {
  it('treats an empty or missing list as a valid outcome', async () => {
    const { sanitizeDistilledMemories } = await import('@/lib/server/profile-analysis');
    expect(sanitizeDistilledMemories(undefined)).toEqual([]);
    expect(sanitizeDistilledMemories([])).toEqual([]);
  });

  it('keeps at most three well-formed memories with known kinds', async () => {
    const { sanitizeDistilledMemories } = await import('@/lib/server/profile-analysis');
    const out = sanitizeDistilledMemories([
      { text: 'A', kind: 'fact', importance: 0.8 },
      { text: 'B', kind: 'gossip', importance: 0.5 },
      { text: '', kind: 'fact' },
      { text: 'C', kind: 'discovery', importance: 7 },
      { text: 'D', kind: 'context' },
      { text: 'E', kind: 'growth' },
    ]);
    expect(out.map(m => m.text)).toEqual(['A', 'C', 'D']);
    expect(out[1].importance).toBe(1);
    expect(out[2].importance).toBe(0.5);
  });
});

describe('pattern voicing — guesses are never stated without evidence', () => {
  function fakeSupabase(rows: unknown[]) {
    const chain = { select: () => chain, eq: async () => ({ data: rows }) };
    return { from: () => chain } as never;
  }

  it('keeps sensitive traits unspoken unless the user confirmed them', async () => {
    const { buildPatternLevels } = await import('@/lib/server/attachment-context');
    const recent = new Date().toISOString();
    const levels = await buildPatternLevels(fakeSupabase([
      { trait_key: 'worth_pattern', status: 'hypothesis', confidence: 0.95, sensitivity: 'sensitive', last_evidence_at: recent },
      { trait_key: 'repair_style', status: 'hypothesis', confidence: 0.8, sensitivity: 'normal', last_evidence_at: recent },
      { trait_key: 'vulnerability_pace', status: 'confirmed', confidence: 0.3, sensitivity: 'sensitive', last_evidence_at: recent },
      { trait_key: 'space_preference', status: 'rejected', confidence: 0.9, sensitivity: 'normal', last_evidence_at: recent },
    ]), 'u1');
    expect(levels).toEqual({
      worth_pattern: 'wondering',
      repair_style: 'evidence',
      vulnerability_pace: 'told',
      space_preference: 'excluded',
    });
  });

  it('only offers insight observations for evidence-backed or confirmed patterns', async () => {
    const { getPatternHints } = await import('@/lib/server/pattern-hints');
    const ctx = {
      attachment_style: null, repair_style: 'uses_humor', reassurance_need: null, space_preference: null,
      stress_communication: 'goes_quiet', interpretation_bias: null, vulnerability_pace: null, worth_pattern: 'tied_to_achieving',
    };
    const { insightLines } = getPatternHints(ctx, 'chat', {
      repair_style: 'evidence', stress_communication: 'wondering', worth_pattern: 'excluded',
    });
    expect(insightLines).toHaveLength(1);
    expect(insightLines[0]).toMatch(/lightness/);
    expect(insightLines[0]).toMatch(/ask whether it fits/);
  });
});

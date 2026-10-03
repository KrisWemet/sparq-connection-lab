import { describe, expect, it } from 'vitest';
import { computeTraitGaps, getSteeredTrait } from '@/lib/server/trait-gaps';

// docs/PRIMING_AUDIT.md tier 3 (Chris, 2026-10-01): story steering may help
// Peter learn, but never re-probes a guess the user rejected or confirmed,
// and never steers toward sensitive ground (worth_pattern).

function fakeClient(rows: Array<{ trait_key: string; confidence: number; status?: string }>) {
  const query = { select: () => query, eq: () => query, in: async () => ({ data: rows }) };
  return { from: () => query } as any;
}

describe('computeTraitGaps', () => {
  it('never steers toward a rejected or confirmed trait', async () => {
    const gaps = await computeTraitGaps(fakeClient([
      { trait_key: 'attachment_style', confidence: 0.1, status: 'rejected' },
      { trait_key: 'repair_style', confidence: 0.2, status: 'confirmed' },
    ]), 'u');
    const keys = gaps.map(g => g.trait_key);
    expect(keys).not.toContain('attachment_style');
    expect(keys).not.toContain('repair_style');
  });

  it('never steers toward worth_pattern', async () => {
    const gaps = await computeTraitGaps(fakeClient([]), 'u');
    expect(gaps.map(g => g.trait_key)).not.toContain('worth_pattern');
  });

  it('still steers toward an open, unknown dimension', async () => {
    const gaps = await computeTraitGaps(fakeClient([{ trait_key: 'attachment_style', confidence: 0.2, status: 'rejected' }]), 'u');
    expect(getSteeredTrait(gaps)).not.toBeNull();
    expect(getSteeredTrait(gaps)).not.toBe('attachment_style');
  });
});

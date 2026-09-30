import { describe, expect, it } from 'vitest';
import { EVIDENCE_CAP, knowledgeLevel, newTraitFields, reviseTrait, type TraitRow } from '@/lib/server/trait-revision';

// Constitution §2 "SPARQ actively revises", §4 "contradictions are preserved",
// §12 "every inference must support confidence updates and contradictory evidence".

const AT = '2026-09-30T00:00:00.000Z';

function trait(overrides: Partial<TraitRow> = {}): TraitRow {
  return { id: 't1', ...newTraitFields({ value: 'goes_quiet', boost: 0.1, source: 'test', at: AT }), ...overrides };
}

function apply(row: TraitRow, value: string, boost = 0.1): TraitRow {
  return { ...row, ...(reviseTrait(row, { value, boost, source: 'test', at: AT }) as Partial<TraitRow>) };
}

describe('reviseTrait', () => {
  it('starts every inference as a low-confidence hypothesis with evidence', () => {
    const row = trait();
    expect(row.confidence).toBe(0.3);
    expect(row).toMatchObject({ status: 'hypothesis', source: 'inferred' });
    expect(row.evidence).toHaveLength(1);
  });

  it('raises confidence and records evidence when a new observation agrees', () => {
    const row = apply(trait(), 'goes_quiet', 0.15);
    expect(row.confidence).toBeCloseTo(0.45);
    expect(row.evidence).toHaveLength(2);
  });

  it('never flips the value on a single contradiction', () => {
    const row = apply(apply(trait(), 'goes_quiet'), 'talks_it_through', 0.15);
    expect(row.inferred_value).toBe('goes_quiet');
    expect(row.candidate_value).toBe('talks_it_through');
    expect(row.counter_evidence).toHaveLength(1);
    expect(row.confidence).toBeLessThan(0.4);
  });

  it('replaces the value only once the candidate outweighs it, keeping the old evidence', () => {
    let row = apply(apply(trait(), 'goes_quiet'), 'goes_quiet'); // 0.5, 3 pieces of evidence
    row = apply(row, 'talks_it_through', 0.15);
    row = apply(row, 'talks_it_through', 0.15);
    expect(row.inferred_value).toBe('goes_quiet');
    row = apply(row, 'talks_it_through', 0.15);
    expect(row.inferred_value).toBe('talks_it_through');
    expect(row.candidate_value).toBeNull();
    // The old value's history survives as counter-evidence.
    expect((row.counter_evidence ?? []).some(e => e.value === 'goes_quiet')).toBe(true);
    expect((row.evidence ?? []).every(e => e.value === 'talks_it_through')).toBe(true);
  });

  it('resets the candidate when a third value appears', () => {
    let row = apply(trait(), 'talks_it_through');
    row = apply(row, 'gets_louder');
    expect(row.candidate_value).toBe('gets_louder');
    expect(row.inferred_value).toBe('goes_quiet');
  });

  it('never lets inference change a trait the user confirmed', () => {
    const confirmed = trait({ status: 'confirmed', confidence: 0.9 });
    const row = apply(confirmed, 'talks_it_through', 0.15);
    expect(row.inferred_value).toBe('goes_quiet');
    expect(row.status).toBe('confirmed');
    expect(row.confidence).toBe(0.9);
    expect(row.counter_evidence).toHaveLength(1);
  });

  it('never lets inference revive a trait the user rejected', () => {
    const rejected = trait({ status: 'rejected', confidence: 0.2 });
    const row = apply(rejected, 'goes_quiet', 0.15);
    expect(row.status).toBe('rejected');
    expect(row.confidence).toBe(0.2);
    expect(row.counter_evidence).toHaveLength(1);
  });

  it('caps evidence lists', () => {
    let row = trait();
    for (let i = 0; i < 20; i++) row = apply(row, 'goes_quiet', 0.01);
    expect(row.evidence).toHaveLength(EVIDENCE_CAP);
    expect(row.confidence).toBeLessThanOrEqual(1);
  });
});

describe('knowledgeLevel', () => {
  const now = new Date(AT);
  it('treats only user-confirmed traits as things the user told us', () => {
    expect(knowledgeLevel({ status: 'confirmed', confidence: 0.3 }, now)).toBe('told');
    expect(knowledgeLevel({ status: 'hypothesis', source: 'user_confirmed', confidence: 0.3 }, now)).toBe('wondering');
  });
  it('separates evidence from wondering at 0.6 confidence', () => {
    expect(knowledgeLevel({ confidence: 0.6, last_evidence_at: AT }, now)).toBe('evidence');
    expect(knowledgeLevel({ confidence: 0.59, last_evidence_at: AT }, now)).toBe('wondering');
  });
  it('excludes rejected traits and lets stale evidence fade to wondering', () => {
    expect(knowledgeLevel({ status: 'rejected', confidence: 0.9 }, now)).toBe('excluded');
    expect(knowledgeLevel({ confidence: 0.9, last_evidence_at: '2026-06-01T00:00:00Z' }, now)).toBe('wondering');
  });
});

import { describe, expect, it } from 'vitest';
import { buildDoNotRepushBlock, detectVoicedInsight, rejectedTraitKeys } from '@/lib/server/rejected-hypotheses';
import { applyRejectionEvidence, newTraitFields, type TraitRow } from '@/lib/server/trait-revision';

// Constitution v1.1 §2 "resistance is information", §6A resistance protocol,
// §12 "never re-push a hypothesis the user rejected".

describe('detectVoicedInsight', () => {
  it('recognizes an insight Peter voiced, even with a softened opener', () => {
    const peter = "I might be off, but I've noticed you tend to get quieter when things feel heavy. Does that fit?";
    expect(detectVoicedInsight(peter)).toBe('stress_communication');
  });

  it('returns null for an ordinary reply', () => {
    expect(detectVoicedInsight('That sounds like a long day. What was the hardest part?')).toBeNull();
  });
});

describe('never re-push', () => {
  const rows = [
    { hypothesis_ref: 'trait:stress_communication', offered_text: "I've noticed you tend to get quieter", user_response: "No, I'm just tired" },
    { hypothesis_ref: null, offered_text: 'It sounds like you are scared of letting her down', user_response: "That's not it" },
  ];

  it('excludes rejected traits from future observations', () => {
    expect([...rejectedTraitKeys(rows)]).toEqual(['stress_communication']);
  });

  it("tells Peter what they rejected, in both Peter's and the user's words", () => {
    const block = buildDoNotRepushBlock(rows);
    expect(block).toMatch(/never offer these again/);
    expect(block).toContain('scared of letting her down');
    expect(block).toContain("That's not it");
  });

  it('adds nothing when there are no rejections', () => {
    expect(buildDoNotRepushBlock([])).toBe('');
  });
});

describe('applyRejectionEvidence', () => {
  const base: TraitRow = { id: 't', ...newTraitFields({ value: 'goes_quiet', boost: 0.1, source: 'test' }), confidence: 0.6 };

  it('weakens a hypothesis and records the pushback as counter-evidence', () => {
    const update = applyRejectionEvidence(base, "They said it didn't fit");
    expect(update.confidence).toBeCloseTo(0.45);
    expect((update.counter_evidence as unknown[]).length).toBe(1);
  });

  it('never changes a trait the user confirmed or rejected themselves', () => {
    const update = applyRejectionEvidence({ ...base, status: 'confirmed' }, 'pushback');
    expect(update.confidence).toBeUndefined();
    expect((update.counter_evidence as unknown[]).length).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';
import { identityAskState } from '@/lib/identity';
import { deepWhyLayersFromTranscript } from '@/lib/server/reasons';

// Constitution v1.2 §11B (identity evidence: asked, never declared) and
// §5B (Deep Why: the user's own seven layers, revisable, never padded).

const NOW = Date.parse('2026-10-01T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString();
const step = (n: number) => ({ direction: 'consistent' as const, evidence_type: 'experiment', created_at: daysAgo(n) });

describe('identityAskState', () => {
  it('asks only after three steps the user linked in the last 30 days', () => {
    expect(identityAskState([step(1), step(2)], NOW)).toEqual({ steps: 2, shouldAsk: false });
    expect(identityAskState([step(1), step(2), step(3)], NOW)).toEqual({ steps: 3, shouldAsk: true });
    expect(identityAskState([step(1), step(2), step(40)], NOW).shouldAsk).toBe(false);
  });

  it('waits 14 days after asking, and only counts steps since', () => {
    const asked = { direction: 'consistent' as const, evidence_type: 'reflection', created_at: daysAgo(5), asked_at: daysAgo(5) };
    expect(identityAskState([step(1), step(2), step(3), asked], NOW).shouldAsk).toBe(false);
    const askedLongAgo = { ...asked, created_at: daysAgo(20), asked_at: daysAgo(20) };
    expect(identityAskState([step(1), step(2), step(3), askedLongAgo], NOW)).toEqual({ steps: 3, shouldAsk: true });
  });

  it('never counts inconsistent evidence as a step', () => {
    const off = { direction: 'inconsistent' as const, evidence_type: 'experiment', created_at: daysAgo(1) };
    expect(identityAskState([step(2), step(3), off], NOW).shouldAsk).toBe(false);
  });
});

describe('deepWhyLayersFromTranscript', () => {
  const t = (role: string, content: string) => ({ role, content });

  it('keeps the seven answers between the opening reflection and the proposal', () => {
    const transcript = [
      t('user', 'tonight was hard'),
      ...[1, 2, 3, 4, 5, 6, 7].flatMap(i => [t('assistant', 'Why is that important to you?'), t('user', `layer ${i}`)]),
      t('assistant', 'So it sounds like…'), t('system', 'proposed'),
      t('user', 'yes, that is it'),
    ];
    expect(deepWhyLayersFromTranscript(transcript)).toEqual(['layer 1', 'layer 2', 'layer 3', 'layer 4', 'layer 5', 'layer 6', 'layer 7']);
  });

  it('drops stop phrases, confirmations and wording tweaks', () => {
    const transcript = [
      t('user', 'reflection'), t('user', 'a'), t('user', 'b'), t('user', "I don't know, that's enough"),
      t('system', 'proposed'), t('user', 'more like X'), t('system', 'proposed'), t('user', 'yes'),
    ];
    expect(deepWhyLayersFromTranscript(transcript)).toEqual(['a', 'b']);
  });

  it('keeps a real answer that merely starts with "I don\'t know"', () => {
    expect(deepWhyLayersFromTranscript([t('user', 'r'), t('user', "I don't know why it hurts so much"), t('system', 'proposed')]))
      .toEqual(["I don't know why it hurts so much"]);
  });

  it('never exceeds seven layers', () => {
    const transcript = [t('user', 'r'), ...Array.from({ length: 10 }, (_, i) => t('user', `l${i}`)), t('system', 'proposed')];
    expect(deepWhyLayersFromTranscript(transcript)).toHaveLength(7);
  });
});

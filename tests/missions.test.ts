import { describe, expect, it } from 'vitest';
import { capacityFromHistory, missionText, suggestMission, type MissionHistoryRow } from '@/lib/missions';

// Constitution v1.2 §5A (destination influence needs a user-chosen target),
// §11A (missions, adaptive difficulty offered never imposed, setbacks).

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const easy = (level: number, at: number): MissionHistoryRow => ({
  skill_key: 'presence', difficulty_level: level, status: 'tried', outcome: 'helped', learning: { felt: 'easy' }, resolved_at: daysAgo(at),
});
const skipped = (level: number, at: number): MissionHistoryRow => ({
  skill_key: 'presence', difficulty_level: level, status: 'skipped', resolved_at: daysAgo(at),
});

describe('suggestMission', () => {
  it('offers nothing without a North Star line or a reason the user gave', () => {
    expect(suggestMission({ northStarLine: null, ownReason: null, openCount: 0, history: [] })).toBeNull();
  });

  it('cites the user\'s own words as the reason for the idea', () => {
    const fromStar = suggestMission({ northStarLine: 'someone who stays in the room', ownReason: null, openCount: 0, history: [] });
    expect(fromStar?.because).toEqual({ type: 'north_star', text: 'someone who stays in the room' });
    const fromReason = suggestMission({ northStarLine: null, ownReason: 'I want my kids to see us laugh', openCount: 0, history: [] });
    expect(fromReason?.because).toEqual({ type: 'reason', text: 'I want my kids to see us laugh' });
  });

  it('never offers a new idea while one is still open', () => {
    expect(suggestMission({ northStarLine: 'x', ownReason: null, openCount: 1, history: [] })).toBeNull();
  });

  it('starts at the first step of an unpracticed skill', () => {
    const s = suggestMission({ northStarLine: 'x', ownReason: null, openCount: 0, history: [] });
    expect(s).toMatchObject({ kind: 'start', difficulty_level: 1 });
  });

  it('offers the next step after two easy tries', () => {
    const s = suggestMission({ northStarLine: 'x', ownReason: null, openCount: 0, history: [easy(1, 3), easy(1, 1)] });
    expect(s).toMatchObject({ kind: 'next_step', skill_key: 'presence', difficulty_level: 2 });
  });

  it('offers a smaller step after two setbacks, then moves forward again once that is easy', () => {
    const setbacks = [skipped(3, 10), skipped(3, 9)];
    expect(suggestMission({ northStarLine: 'x', ownReason: null, openCount: 0, history: setbacks }))
      .toMatchObject({ kind: 'smaller_step', difficulty_level: 2 });
    const recovered = [...setbacks, easy(2, 5), easy(2, 2)];
    expect(suggestMission({ northStarLine: 'x', ownReason: null, openCount: 0, history: recovered }))
      .toMatchObject({ kind: 'next_step', difficulty_level: 3 });
  });

  it('respects "not now" on a skill', () => {
    const s = suggestMission({ northStarLine: 'x', ownReason: null, openCount: 0, history: [easy(1, 3), easy(1, 1)], declinedSkills: ['presence'] });
    expect(s?.skill_key).not.toBe('presence');
  });
});

describe('capacityFromHistory', () => {
  it('uses the most recent level and marks a walked path as completed', () => {
    const [c] = capacityFromHistory([
      { skill_key: 'repair', difficulty_level: 4, status: 'tried', outcome: 'mixed', resolved_at: daysAgo(5) },
      { skill_key: 'repair', difficulty_level: 3, status: 'tried', outcome: 'helped', resolved_at: daysAgo(1) },
    ]);
    expect(c.level).toBe(3);
    expect(c.completed).toBe(true);
  });

  it('ignores planned rows', () => {
    expect(capacityFromHistory([{ skill_key: 'presence', difficulty_level: 1, status: 'planned' }])).toEqual([]);
  });
});

describe('missionText', () => {
  it('joins a cue and an action into "When X, I\'ll Y"', () => {
    expect(missionText('When a talk starts to feel hard', 'stay one more minute')).toBe("When a talk starts to feel hard, I'll stay one more minute");
    expect(missionText(null, 'Say thank you')).toBe('Say thank you');
  });
});

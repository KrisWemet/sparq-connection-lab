import { describe, expect, it } from 'vitest';
import {
  chooseStage,
  newJourneyState,
  parseBrowserProgress,
  practicedToday,
  recordStep,
  transition,
  type JourneyShape,
  type JourneyState,
} from '@/lib/journeys/progress';

// Journey state and progress (Journey audit, Phase 1; approved by Chris
// 2026-10-04): progress counts days practiced, once, per journey; pausing,
// leaving and returning keep the user's place; moving between stages is the
// user's choice; browser progress from older versions is imported safely.

const DAILY: JourneyShape = { kind: 'daily', length: 3 };
const STAGED: JourneyShape = { kind: 'staged', stageLength: 2 };
const AT = '2026-10-04T18:00:00.000Z';

function walk(state: JourneyState, shape: JourneyShape, days: number[], stage?: 'roots' | 'growth' | 'bloom') {
  return days.reduce((s, day) => recordStep(s, shape, { day, stage, at: AT }).state, state);
}

describe('recordStep — daily journeys', () => {
  it('counts each journey day once, on that journey', () => {
    const s = walk(newJourneyState('shared-language', DAILY), DAILY, [1, 2]);
    expect(s.journey_day).toBe(3);
    expect(s.progress).toBe(2);
    expect(s.last_step_at).toBe(AT);
  });

  it('ignores a repeated or older day, so a retry never double-counts or moves anyone back', () => {
    const s = walk(newJourneyState('shared-language', DAILY), DAILY, [1]);
    const again = recordStep(s, DAILY, { day: 1, at: AT });
    expect(again.advanced).toBe(false);
    expect(again.state).toEqual(s);
    expect(recordStep(s, DAILY, { day: 5, at: AT }).advanced).toBe(false);
  });

  it('completes on the last day of that journey — not on a global day count', () => {
    const before = walk(newJourneyState('shared-language', DAILY), DAILY, [1, 2]);
    const last = recordStep(before, DAILY, { day: 3, at: AT });
    expect(last.journeyCompleted).toBe(true);
    expect(last.state.status).toBe('completed');
    expect(last.state.completed_at).toBe(AT);
  });

  it('does not count days on a journey that is paused or left', () => {
    const paused = transition(newJourneyState('shared-language', DAILY), DAILY, 'pause', AT);
    expect(paused.ok && recordStep(paused.state, DAILY, { day: 1, at: AT }).advanced).toBe(false);
  });
});

describe('recordStep — staged journeys', () => {
  it('finishes a stage without moving the user on; the next stage is their choice', () => {
    const res = recordStep(walk(newJourneyState('communication', STAGED), STAGED, [1], 'roots'), STAGED, { day: 2, stage: 'roots', at: AT });
    expect(res.stageCompleted).toBe('roots');
    expect(res.journeyCompleted).toBe(false);
    expect(res.state.stage).toBe('roots');
    expect(res.state.status).toBe('active');
    expect(res.state.stage_progress.roots?.completed_at).toBe(AT);
  });

  it('ignores a day sent for a stage the user is not walking', () => {
    const s = newJourneyState('communication', STAGED);
    expect(recordStep(s, STAGED, { day: 1, stage: 'growth', at: AT }).advanced).toBe(false);
  });

  it('completes the journey only when Bloom is finished', () => {
    let s = walk(newJourneyState('communication', STAGED), STAGED, [1, 2], 'roots');
    for (const stage of ['growth', 'bloom'] as const) {
      const chosen = chooseStage(s, STAGED, stage);
      if (!chosen.ok) throw new Error(chosen.error);
      s = walk(chosen.state, STAGED, [1], stage);
      const last = recordStep(s, STAGED, { day: 2, stage, at: AT });
      expect(last.journeyCompleted).toBe(stage === 'bloom');
      s = last.state;
    }
    expect(s.status).toBe('completed');
    expect(s.progress).toBe(6);
  });
});

describe('chooseStage', () => {
  it('keeps Growth closed until Roots is finished', () => {
    const s = newJourneyState('communication', STAGED);
    expect(chooseStage(s, STAGED, 'growth')).toEqual({ ok: false, error: 'stage_locked' });
    const done = walk(s, STAGED, [1, 2], 'roots');
    const growth = chooseStage(done, STAGED, 'growth');
    expect(growth.ok && growth.state.stage).toBe('growth');
    expect(growth.ok && growth.state.journey_day).toBe(1);
  });

  it('walking a finished stage again starts it from day 1 and keeps it finished', () => {
    const done = walk(newJourneyState('communication', STAGED), STAGED, [1, 2], 'roots');
    const again = chooseStage(done, STAGED, 'roots');
    expect(again.ok && again.state.journey_day).toBe(1);
    expect(again.ok && again.state.stage_progress.roots?.completed_at).toBe(AT);
  });
});

describe('transition — pause, leave, come back', () => {
  it('pausing and resuming keeps the user exactly where they were', () => {
    const s = walk(newJourneyState('shared-language', DAILY), DAILY, [1, 2]);
    const paused = transition(s, DAILY, 'pause', AT);
    expect(paused.ok && paused.state.status).toBe('paused');
    if (!paused.ok) return;
    const back = transition(paused.state, DAILY, 'activate', AT);
    expect(back.ok && back.state.status).toBe('active');
    expect(back.ok && back.state.journey_day).toBe(3);
    expect(back.ok && back.state.progress).toBe(2);
  });

  it('leaving keeps the record and its place; coming back resumes it', () => {
    const s = walk(newJourneyState('shared-language', DAILY), DAILY, [1]);
    const left = transition(s, DAILY, 'leave', AT);
    expect(left.ok && left.state.status).toBe('left');
    if (!left.ok) return;
    expect(left.state.journey_day).toBe(2);
    const back = transition(left.state, DAILY, 'activate', AT);
    expect(back.ok && back.state.journey_day).toBe(2);
  });

  it('walking a completed journey again starts over but keeps days practiced and finished stages', () => {
    let s = walk(newJourneyState('communication', STAGED), STAGED, [1, 2], 'roots');
    s = { ...s, status: 'completed', completed_at: AT };
    const again = transition(s, STAGED, 'activate', AT);
    if (!again.ok) throw new Error('expected ok');
    expect(again.state.status).toBe('active');
    expect(again.state.stage).toBe('roots');
    expect(again.state.journey_day).toBe(1);
    expect(again.state.progress).toBe(2);
    expect(chooseStage(again.state, STAGED, 'growth').ok).toBe(true);
  });

  it('refuses changes that make no sense instead of guessing', () => {
    const done = { ...newJourneyState('x', DAILY), status: 'completed' as const };
    expect(transition(done, DAILY, 'pause', AT).ok).toBe(false);
    expect(transition(done, DAILY, 'leave', AT).ok).toBe(false);
  });
});

describe('practicedToday', () => {
  it('is true only for a step earlier the same local day', () => {
    const now = new Date(2026, 9, 4, 21, 0);
    expect(practicedToday(new Date(2026, 9, 4, 8, 0).toISOString(), now)).toBe(true);
    expect(practicedToday(new Date(2026, 9, 3, 23, 30).toISOString(), now)).toBe(false);
    expect(practicedToday(null, now)).toBe(false);
  });
});

describe('parseBrowserProgress — one-time import', () => {
  const ids = new Set(['communication', 'values']);

  it('rebuilds stage progress and answers, and arrives paused so it never displaces the active journey', () => {
    const journeyProgress = {
      communication_roots: [
        { day: 1, completed: true, responses: { question_0: 'I noticed I interrupt.' }, created_at: '2026-09-01T10:00:00Z' },
        { day: 2, completed: true, responses: {}, created_at: '2026-09-02T10:00:00Z' },
      ],
    };
    const [item] = parseBrowserProgress(journeyProgress, null, ids, 14, AT);
    expect(item.journey_id).toBe('communication');
    expect(item.state.status).toBe('paused');
    expect(item.state.stage).toBe('roots');
    expect(item.state.journey_day).toBe(3);
    expect(item.state.progress).toBe(2);
    expect(item.entries[0].responses).toEqual({ question_0: 'I noticed I interrupt.' });
  });

  it('marks a stage finished from the tier record and opens the next one', () => {
    const [item] = parseBrowserProgress(null, { values: { roots: { currentDay: 14, totalDays: 14, completed: true } } }, ids, 14, AT);
    expect(item.state.stage_progress.roots?.completed_at).toBeTruthy();
    expect(item.state.stage_progress.roots?.next_day).toBe(15);
  });

  it('drops unknown journeys, undone days and days past the stage', () => {
    const journeyProgress = {
      'not-a-journey_roots': [{ day: 1, completed: true }],
      communication_growth: [{ day: 1, completed: false }, { day: 40, completed: true }, { day: 'x', completed: true }],
    };
    expect(parseBrowserProgress(journeyProgress, 'garbage', ids, 14, AT)).toEqual([]);
  });

  it('a fully walked journey arrives completed', () => {
    const tiers = { communication: { roots: { completed: true }, growth: { completed: true }, bloom: { completed: true } } };
    const [item] = parseBrowserProgress(null, tiers, ids, 14, AT);
    expect(item.state.status).toBe('completed');
  });
});

// Informal check-in — Sparq's own questions, NOT a validated scale.
//
// Asked (optionally) after the CSI-4 at the start and again at follow-ups. It
// covers what the CSI-4 does not: progress toward what the user came for,
// feeling heard and respected, hard talks, repair after conflict, and whether
// the practices themselves feel useful or like a burden. Each answer is a
// self-report. There is no total score: items are never added up, compared
// with a partner, or read as a diagnosis (docs/METRICS.md "Outcome
// measurement"). Rating scales are the one place Sparq shows more than three
// options — they are an ordered answer, not a list of choices.

export type CheckInKey = 'goal_progress' | 'heard_respected' | 'hard_topics' | 'repair' | 'practice_fit';

export type CheckInStage = 'baseline' | 'follow_up';

export type CheckInOption = { label: string; value: number | string | null };

export type CheckInQuestion = {
  key: CheckInKey;
  text: string;
  options: CheckInOption[];
  /** Ordered answers can be compared over time; practice_fit cannot. */
  ordinal: boolean;
  /** practice_fit only makes sense once there has been something to practice. */
  followUpOnly?: boolean;
};

const OFTEN = ['Rarely', 'Sometimes', 'Often', 'Almost always'];

export const CHECK_IN_QUESTIONS: CheckInQuestion[] = [
  {
    key: 'goal_progress',
    text: 'Think about what you want to be different. How close are things to that right now?',
    options: ['Far off', 'Some of the way', 'Most of the way', 'Pretty much there'].map((label, value) => ({ label, value })),
    ordinal: true,
  },
  {
    key: 'heard_respected',
    text: 'In the last two weeks, how often did you feel heard and respected by your partner?',
    options: OFTEN.map((label, value) => ({ label, value })),
    ordinal: true,
  },
  {
    key: 'hard_topics',
    text: 'In the last two weeks, how often could you two talk about something hard without it going badly?',
    options: [...OFTEN.map((label, value) => ({ label, value })), { label: 'No hard talks came up', value: null }],
    ordinal: true,
  },
  {
    key: 'repair',
    text: 'After your last fight or tense moment, how well did you find your way back to each other?',
    options: [
      ...['Not well', 'A little', 'Fairly well', 'Well'].map((label, value) => ({ label, value })),
      { label: 'No fight lately', value: null },
    ],
    ordinal: true,
  },
  {
    key: 'practice_fit',
    text: 'How have the things you practiced felt for you lately?',
    options: [
      { label: 'Useful', value: 'useful' },
      { label: 'Okay', value: 'okay' },
      { label: 'A burden', value: 'burden' },
      { label: 'Not helpful', value: 'not_helpful' },
      { label: "Haven't tried any", value: null },
    ],
    ordinal: false,
    followUpOnly: true,
  },
];

export const CHECK_IN_LABEL =
  "These are Sparq's own questions, not a standard scale. Your answers stay private.";

export function questionsFor(stage: CheckInStage): CheckInQuestion[] {
  return CHECK_IN_QUESTIONS.filter(q => stage === 'follow_up' || !q.followUpOnly);
}

export type CheckInAnswers = Partial<Record<CheckInKey, number | string | null>>;

/** Keeps only known keys with values that are one of that question's options. */
export function cleanAnswers(raw: unknown): CheckInAnswers {
  const out: CheckInAnswers = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const q of CHECK_IN_QUESTIONS) {
    if (!(q.key in (raw as Record<string, unknown>))) continue;
    const v = (raw as Record<string, unknown>)[q.key];
    if (q.options.some(o => o.value === v)) out[q.key] = v as number | string | null;
  }
  return out;
}

export type CheckInChange = {
  key: CheckInKey;
  then: string;
  now: string;
  direction: 'higher' | 'same' | 'lower';
};

function labelFor(q: CheckInQuestion, value: unknown): string | null {
  return q.options.find(o => o.value === value)?.label ?? null;
}

/**
 * What the user reported then vs. now, item by item. Only ordered items the
 * user answered with a rating both times are compared — no totals.
 */
export function compareCheckIns(then: CheckInAnswers, now: CheckInAnswers): CheckInChange[] {
  const out: CheckInChange[] = [];
  for (const q of CHECK_IN_QUESTIONS) {
    if (!q.ordinal) continue;
    const a = then[q.key];
    const b = now[q.key];
    if (typeof a !== 'number' || typeof b !== 'number') continue;
    out.push({
      key: q.key,
      then: labelFor(q, a)!,
      now: labelFor(q, b)!,
      direction: b > a ? 'higher' : b < a ? 'lower' : 'same',
    });
  }
  return out;
}

/** Short plain names for each item, used when showing then → now. */
export const CHECK_IN_SHORT: Record<CheckInKey, string> = {
  goal_progress: 'Close to what you want',
  heard_respected: 'Feeling heard and respected',
  hard_topics: 'Talking about hard things',
  repair: 'Finding your way back after a fight',
  practice_fit: 'How the practices feel',
};

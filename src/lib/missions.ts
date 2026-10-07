// missions.ts — Real-World Missions, adaptive difficulty and setbacks
// (constitution v1.2 §11A). Pure logic, shared by the API and the card.
//
// A mission is a small action in the user's real life. Peter may suggest one,
// but only tied to something the user chose (their North Star or their own
// reason) — and a suggestion becomes theirs only when they accept or reshape
// it. Difficulty is offered, never imposed; it steps back after a setback.

export type SkillKey =
  | 'presence' | 'appreciation' | 'curiosity' | 'repair'
  | 'request' | 'pause' | 'values';

export type Domain = 'self' | 'partner' | 'family' | 'friends' | 'work' | 'community';

export const DOMAINS: Domain[] = ['self', 'partner', 'family', 'friends', 'work', 'community'];

/** How the step felt — the signal that drives difficulty (never a grade). */
export type Felt = 'easy' | 'stretch' | 'too_much';

/** Why a planned step didn't happen. Each one is information, not failure. */
export type GotInTheWay = 'too_big' | 'wrong_moment' | 'forgot' | 'busy' | 'not_important_now';

export type MissionLearning = {
  felt?: Felt | null;
  what_helped?: string | null;
  what_got_in_way?: GotInTheWay | string | null;
  surprise?: string | null;
};

/**
 * One rung of a ladder. `alt` is a second, different situation for the same
 * step, so a skill can be practiced in more than one place before moving on.
 */
type Step = { intention: string; cue: string; alt: string };

/**
 * Skill ladders, easiest first. Wording follows the language framework:
 * fourth-grade words, an invitation, and a real-life cue.
 */
export const SKILL_LADDERS: Record<SkillKey, { label: string; steps: Step[] }> = {
  presence: {
    label: 'Staying present when it gets hard',
    steps: [
      { cue: 'When a talk starts to feel hard', alt: 'When they bring up something that stings', intention: 'stay one more minute before I step away' },
      { cue: 'When I feel the urge to defend myself', alt: 'When I want to explain why I was right', intention: 'ask one curious question first' },
      { cue: 'Before I answer in a hard moment', alt: 'When I notice my chest or jaw get tight', intention: 'name what I feel, out loud or to myself' },
      { cue: 'After we drift apart in a fight', alt: 'When we both go quiet after a tense moment', intention: 'start the repair myself' },
    ],
  },
  appreciation: {
    label: 'Noticing and saying the good',
    steps: [
      { cue: 'At the end of the day', alt: 'On the way home', intention: 'notice one small thing they did' },
      { cue: 'When I notice something they did', alt: 'When I see them doing a chore', intention: 'say thank you for it, out loud' },
      { cue: 'Once this week', alt: 'In a text, in the middle of the day', intention: 'tell them one thing I admire about who they are' },
      { cue: 'When things are tense', alt: 'After a disagreement has cooled down', intention: 'name one thing I still appreciate about them' },
    ],
  },
  curiosity: {
    label: 'Getting curious before getting sure',
    steps: [
      { cue: 'When they tell me about their day', alt: 'When they mention someone from work', intention: 'ask one more question before I share mine' },
      { cue: 'When I think I know what they meant', alt: 'When a text from them sounds off to me', intention: 'check: "Did you mean…?"' },
      { cue: 'When we disagree', alt: 'When they explain a choice I would not make', intention: 'say back what I heard before I answer' },
      { cue: 'When they are upset with me', alt: 'When they are upset about something I did', intention: 'ask what it was like for them before I explain' },
    ],
  },
  repair: {
    label: 'Repairing the small things',
    steps: [
      { cue: 'When I notice I was short with them', alt: 'When I snap at them over something small', intention: 'say "That came out wrong"' },
      { cue: 'Later the same day', alt: 'The next morning', intention: 'come back to it and say what I wish I had said' },
      { cue: 'After a hard moment', alt: 'When I can tell they are still hurt', intention: 'ask "What would help you right now?"' },
      { cue: 'After a bigger fight', alt: 'When we both said things we regret', intention: 'share my part without a "but"' },
    ],
  },
  request: {
    label: 'Asking clearly for what I need',
    steps: [
      { cue: 'When I feel let down', alt: 'When I catch myself hinting', intention: 'name to myself what I was hoping for' },
      { cue: 'When I want something small', alt: 'When I want help with a task', intention: 'ask in one sentence: "Would you be up for…?"' },
      { cue: 'When something keeps bothering me', alt: 'When I start to complain about it', intention: 'say what happened, how I felt, and one thing I would like' },
      { cue: 'When I ask for something that matters', alt: 'When the answer might be no', intention: 'ask kindly, then listen to their answer, even if it is no' },
    ],
  },
  pause: {
    label: 'Pausing and coming back',
    steps: [
      { cue: 'When my body heats up in a talk', alt: 'When my voice starts to rise', intention: 'notice it and take one slow breath' },
      { cue: 'Before I reply when I am upset', alt: 'Before I send an angry text', intention: 'wait for three slow breaths' },
      { cue: 'When a talk is going badly', alt: 'When we start going in circles', intention: 'say "I need a short break. Can we come back at a set time?"' },
      { cue: 'When the break is over', alt: 'At the time we agreed', intention: 'come back and start soft, with how I feel' },
    ],
  },
  values: {
    label: 'Living what I chose',
    steps: [
      { cue: 'At the start of the week', alt: 'On a quiet evening', intention: 'pick one thing I care about for this week' },
      { cue: 'Once this week', alt: 'On a busy day', intention: 'do one small thing that fits what I care about' },
      { cue: 'When it would be easier not to', alt: 'When I am tired', intention: 'do that small thing anyway, in a way that fits today' },
      { cue: 'When I notice I acted against it', alt: 'When I slip back into an old habit', intention: 'pause, say what I care about, and choose my next step' },
    ],
  },
};

/**
 * What each practice is for (docs/TRANSFORMATION_ENGINE.md "Practice map").
 * `source` names the approaches for maintainers — never shown to users.
 * `followUp` is the question asked when the user checks in.
 */
export type PracticeMeta = {
  source: string[];
  skill: string;
  outcome: string;
  context: string;
  intensity: 'low' | 'medium' | 'high';
  limitations: string;
  followUp: string;
};

export const PRACTICE_META: Record<SkillKey, PracticeMeta> = {
  presence: {
    source: ['Gottman (staying engaged, flooding)', 'EFT (emotional accessibility)', 'Mindfulness'],
    skill: 'Staying in a hard moment a little longer instead of leaving it',
    outcome: 'Fewer walk-aways; the other person feels you are still there',
    context: 'Ordinary tension. Not when either person is flooded — pause instead',
    intensity: 'medium',
    limitations: 'Staying is never about putting up with harm. If anyone feels unsafe, leaving is right.',
    followUp: 'What happened in that extra minute?',
  },
  appreciation: {
    source: ['Positive Psychology (gratitude)', 'Gottman (fondness and admiration)'],
    skill: 'Noticing and saying what goes right',
    outcome: 'More attention on what is working; partner feels seen',
    context: 'Any day; the last step is for moments of tension',
    intensity: 'low',
    limitations: 'Only what you mean. Thanks is not a way to skip over a real problem.',
    followUp: 'What did you notice, and what happened when you said it?',
  },
  curiosity: {
    source: ['NVC (empathic listening)', 'CBT (checking assumptions)', 'Gottman (accepting influence)'],
    skill: 'Asking instead of assuming; listening without preparing a rebuttal',
    outcome: 'Fewer misunderstandings; partner feels understood',
    context: 'Everyday talk first, disagreements later',
    intensity: 'low',
    limitations: 'Understanding is not agreeing. You can still disagree after you listen.',
    followUp: 'What did you learn that you did not know before?',
  },
  repair: {
    source: ['Gottman (repair attempts)', 'EFT (reaching back after disconnection)'],
    skill: 'Making a repair attempt',
    outcome: 'Finding your way back to each other sooner and more gently',
    context: 'After small moments first; bigger fights later',
    intensity: 'medium',
    limitations: 'Owning your part is not taking all the blame, and it does not make harm done to you okay.',
    followUp: 'How did they respond, and how was it for you to do it?',
  },
  request: {
    source: ['NVC (requests)', 'DBT-informed interpersonal effectiveness'],
    skill: 'Making a clear, kind request',
    outcome: 'Needs get said out loud instead of hinted at or stored up',
    context: 'Small asks first; things that matter more later',
    intensity: 'medium',
    limitations: 'A request can get a no. It is an ask, not a demand.',
    followUp: 'What did you ask for, and what happened?',
  },
  pause: {
    source: ['Gottman (self-soothing break)', 'DBT-informed distress tolerance'],
    skill: 'Pausing before things escalate, and agreeing when to come back',
    outcome: 'Fewer things said in the heat; hard talks get finished later',
    context: 'Heated moments. A break always comes with a time to return',
    intensity: 'medium',
    limitations: 'A pause is not the silent treatment. If you feel unsafe, leave and get help — this is not the tool for that.',
    followUp: 'Did you come back to it? How did the second try go?',
  },
  values: {
    source: ['ACT (values-based committed action)'],
    skill: 'Taking one small action that fits a value you chose',
    outcome: 'Living a little more like the person you want to be',
    context: 'Any week; tied to the North Star or a reason the user gave',
    intensity: 'low',
    limitations: 'Values are directions, not rules to be perfect at. Missing one is information.',
    followUp: 'What did it feel like to do it? Did it fit what you care about?',
  },
};

export const SKILL_KEYS = Object.keys(SKILL_LADDERS) as SkillKey[];

export function isSkillKey(value: unknown): value is SkillKey {
  return typeof value === 'string' && (SKILL_KEYS as string[]).includes(value);
}

export function isDomain(value: unknown): value is Domain {
  return typeof value === 'string' && (DOMAINS as string[]).includes(value);
}

export function ladderStep(skill: SkillKey, level: number): (Step & { level: number }) | null {
  const steps = SKILL_LADDERS[skill].steps;
  if (level < 1 || level > steps.length) return null;
  return { ...steps[level - 1], level };
}

/** A minimal view of a past experiment, as stored. */
export type MissionHistoryRow = {
  skill_key?: string | null;
  difficulty_level?: number | null;
  status: string;
  outcome?: string | null;
  learning?: MissionLearning | null;
  resolved_at?: string | null;
};

export type SkillCapacity = {
  skill: SkillKey;
  label: string;
  level: number;            // the level they practiced most recently
  triedAtLevel: number;     // tries at that level
  easyAtLevel: number;      // tries that felt easy and helped (or were mixed)
  setbacksAtLevel: number;  // skipped / let go / too much at that level
  readyForNext: boolean;    // offer the next step (the user decides)
  suggestStepBack: boolean; // offer a smaller step, without comment
  /** Resting: the user said it didn't help, felt like too much at the
   *  easiest step, or no longer matters. Not offered again on its own. */
  paused: boolean;
  completed: boolean;       // tried the top step — a whole arc walked (§11C)
};

const EASY_TRIES_FOR_NEXT = 2;
const SETBACKS_FOR_STEP_BACK = 2;
const NO_HELP_TRIES_FOR_PAUSE = 2;

const byRecent = (a: MissionHistoryRow, b: MissionHistoryRow) =>
  (Date.parse(b.resolved_at ?? '') || 0) - (Date.parse(a.resolved_at ?? '') || 0);

/**
 * Capacity per skill, from the user's own outcomes (constitution §3 Insight
 * Profile "capacity", §11A adaptive difficulty). Read-time only; never stored.
 * Most recently practiced skill first.
 */
export function capacityFromHistory(rows: MissionHistoryRow[]): SkillCapacity[] {
  const out: Array<SkillCapacity & { last: number }> = [];
  for (const skill of SKILL_KEYS) {
    // Most recent first, so a step back (or forward) moves the current level.
    const mine = rows
      .filter(r => r.skill_key === skill && r.status !== 'planned')
      .sort(byRecent);
    if (mine.length === 0) continue;
    const latest = mine[0];
    const level = latest.difficulty_level ?? 1;
    const atLevel = mine.filter(r => (r.difficulty_level ?? 1) === level);
    const tried = atLevel.filter(r => r.status === 'tried');
    const easy = tried.filter(r => r.learning?.felt === 'easy' && r.outcome !== 'didnt_help');
    const setbacks = atLevel.filter(
      r => r.status === 'skipped' || r.status === 'let_go' || r.learning?.felt === 'too_much',
    );
    const recentTries = mine.filter(r => r.status === 'tried').slice(0, NO_HELP_TRIES_FOR_PAUSE);
    const noHelp = recentTries.length === NO_HELP_TRIES_FOR_PAUSE && recentTries.every(r => r.outcome === 'didnt_help');
    const tooMuchAtEasiest = latest.learning?.felt === 'too_much' && level === 1;
    const noLongerMatters = latest.learning?.what_got_in_way === 'not_important_now';
    // Discomfort steps back at once; repeated misses step back after two.
    const tooMuchNow = latest.learning?.felt === 'too_much' && level > 1;
    const maxLevel = SKILL_LADDERS[skill].steps.length;
    out.push({
      skill,
      label: SKILL_LADDERS[skill].label,
      level,
      triedAtLevel: tried.length,
      easyAtLevel: easy.length,
      setbacksAtLevel: setbacks.length,
      readyForNext: level < maxLevel && easy.length >= EASY_TRIES_FOR_NEXT,
      suggestStepBack: level > 1 && (tooMuchNow || (setbacks.length >= SETBACKS_FOR_STEP_BACK && easy.length === 0)),
      paused: noHelp || tooMuchAtEasiest || noLongerMatters,
      completed: mine.some(r => (r.difficulty_level ?? 1) === maxLevel && r.status === 'tried'),
      last: Date.parse(latest.resolved_at ?? '') || 0,
    });
  }
  return out.sort((a, b) => b.last - a.last).map(({ last: _last, ...c }) => c);
}

export type SuggestionKind =
  | 'start'        // first step of a skill they haven't practiced
  | 'repeat'       // same step, a new situation — practice before moving on
  | 'new_moment'   // same step, a different cue — the moment never came
  | 'next_step'    // it has become easy — offered, never imposed
  | 'smaller_step' // too much, or repeated misses — offered without comment
  | 'change';      // the last practice didn't help — try something different

export type MissionSuggestion = {
  skill_key: SkillKey;
  difficulty_level: number;
  cue: string;
  intention: string;
  /** Why it is offered — always the user's own words (influence provenance, §12). */
  because: { type: 'north_star' | 'reason'; text: string };
  kind: SuggestionKind;
};

/** How the user said the practices feel (informal check-in, src/lib/check-in.ts). */
export type PracticeFit = 'useful' | 'okay' | 'burden' | 'not_helpful' | null;

/** Words in the user's own goal that point to one practice over another. */
const GOAL_HINTS: Array<[SkillKey, RegExp]> = [
  ['pause', /\b(calm|temper|yell|shout|blow up|explode|react|heat|cool down|patient)/i],
  ['curiosity', /\b(listen|understand|curious|assum|heard|hear)/i],
  ['request', /\b(ask for|need|needs|say what i want|speak up|clear|hint)/i],
  ['repair', /\b(repair|sorry|apolog|make up|forgive|after (a |we )?fight)/i],
  ['presence', /\b(present|stay|shut down|walk away|withdraw|in the room)/i],
  ['appreciation', /\b(appreciat|thank|grateful|notice|kind|warm)/i],
  ['values', /\b(value|matter|kids|family|integrity|kind of person|example)/i],
];

function preferredOrder(goalText: string): SkillKey[] {
  const hinted = GOAL_HINTS.filter(([, re]) => re.test(goalText)).map(([k]) => k);
  return [...hinted, ...SKILL_KEYS.filter(k => !hinted.includes(k))];
}

/**
 * One mission idea, or null. Destination influence needs a user-chosen target
 * (constitution §5A): no North Star line and no still-true reason → no idea.
 * Never suggests while a mission is still open (one thing at a time).
 *
 * Continuity first (docs/TRANSFORMATION_ENGINE.md "Practice consistency"):
 * the skill the user is practicing is repeated in a new situation until it
 * feels easy, rather than rotating to a new topic. Difficulty steps back at
 * once after "too much"; a practice that didn't help twice rests and a
 * different one is offered; in a hard stretch nothing steps up; if the user
 * said the practices feel like a burden, no idea is offered at all.
 */
export function suggestMission(input: {
  northStarLine: string | null;
  ownReason: string | null;
  openCount: number;
  history: MissionHistoryRow[];
  declinedSkills?: string[];
  /** Inferred from what the user shared; only ever used to go gentler
   *  (tier 3, approved 2026-10-07 — docs/PRIMING_AUDIT.md). */
  readiness?: 'struggling' | 'neutral' | 'thriving' | null;
  practiceFit?: PracticeFit;
}): MissionSuggestion | null {
  const because = input.northStarLine
    ? { type: 'north_star' as const, text: input.northStarLine }
    : input.ownReason
      ? { type: 'reason' as const, text: input.ownReason }
      : null;
  if (!because || input.openCount > 0) return null;
  // "A burden" means less, not a cleverer suggestion.
  if (input.practiceFit === 'burden') return null;

  const declined = new Set(input.declinedSkills ?? []);
  const capacity = capacityFromHistory(input.history);
  const struggling = input.readiness === 'struggling';
  const make = (skill: SkillKey, level: number, kind: SuggestionKind, useAlt = false): MissionSuggestion | null => {
    const step = ladderStep(skill, level);
    if (!step) return null;
    return { skill_key: skill, difficulty_level: step.level, cue: useAlt ? step.alt : step.cue, intention: step.intention, because, kind };
  };
  const latestRow = [...input.history].filter(r => r.status !== 'planned').sort(byRecent)[0];
  const current = capacity[0] && !declined.has(capacity[0].skill) ? capacity[0] : null;

  if (current && !current.paused && input.practiceFit !== 'not_helpful') {
    // 1. A smaller step after "too much" or repeated misses — offered quietly.
    if (current.suggestStepBack) return make(current.skill, current.level - 1, 'smaller_step');
    // 2. The moment never came / they forgot: same step, different moment.
    const missed = latestRow?.skill_key === current.skill ? latestRow.learning?.what_got_in_way : null;
    if (missed === 'wrong_moment' || missed === 'forgot') {
      return make(current.skill, current.level, 'new_moment', true);
    }
    // 3. The next step once the current one has become easy (not in a hard stretch).
    if (current.readyForNext && !struggling) return make(current.skill, current.level + 1, 'next_step');
    // 4. Still learning it (or in a hard stretch): same step, a new situation.
    if ((!current.readyForNext || struggling) && current.triedAtLevel > 0) {
      return make(current.skill, current.level, 'repeat', current.triedAtLevel % 2 === 1);
    }
  }

  // 5. Other skills already in progress that are ready, or need a smaller step.
  for (const c of capacity.slice(current ? 1 : 0)) {
    if (declined.has(c.skill) || c.paused) continue;
    if (c.suggestStepBack) return make(c.skill, c.level - 1, 'smaller_step');
    if (c.readyForNext && !struggling) return make(c.skill, c.level + 1, 'next_step');
  }

  // 6. A first step on a skill they haven't practiced, closest to their own goal.
  const practiced = new Set(capacity.map(c => c.skill));
  const changing = Boolean(capacity[0] && (capacity[0].paused || input.practiceFit === 'not_helpful'));
  const fresh = preferredOrder(because.text).find(s => !practiced.has(s) && !declined.has(s));
  if (fresh) return make(fresh, 1, changing ? 'change' : 'start');
  return null;
}

/** Joins a cue and an action into the "When X, I'll try Y" form the user sees. */
export function missionText(cue: string | null | undefined, intention: string): string {
  const c = (cue || '').trim().replace(/[,.]$/, '');
  if (!c) return intention;
  return `${c}, I'll ${intention.replace(/^i('ll| will)\s+/i, '')}`;
}

/** Plain-language labels for what got in the way (shown back to the user). */
export const GOT_IN_THE_WAY_LABELS: Record<GotInTheWay, string> = {
  too_big: 'It was too big',
  wrong_moment: 'The moment never came',
  forgot: 'I forgot',
  busy: 'Life got in the way',
  not_important_now: "It doesn't matter to me now",
};

export function isGotInTheWay(value: unknown): value is GotInTheWay {
  return typeof value === 'string' && value in GOT_IN_THE_WAY_LABELS;
}

export const FELT_LABELS: Record<Felt, string> = {
  easy: 'Easy',
  stretch: 'A stretch',
  too_much: 'Too much',
};

export function isFelt(value: unknown): value is Felt {
  return typeof value === 'string' && value in FELT_LABELS;
}

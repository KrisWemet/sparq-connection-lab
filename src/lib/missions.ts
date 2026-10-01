// missions.ts — Real-World Missions, adaptive difficulty and setbacks
// (constitution v1.2 §11A). Pure logic, shared by the API and the card.
//
// A mission is a small action in the user's real life. Peter may suggest one,
// but only tied to something the user chose (their North Star or their own
// reason) — and a suggestion becomes theirs only when they accept or reshape
// it. Difficulty is offered, never imposed; it steps back after a setback.

export type SkillKey = 'presence' | 'appreciation' | 'curiosity' | 'repair';

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

type Step = { intention: string; cue: string };

/**
 * Skill ladders, easiest first. Wording follows the language framework:
 * fourth-grade words, an invitation, and a real-life cue.
 */
export const SKILL_LADDERS: Record<SkillKey, { label: string; steps: Step[] }> = {
  presence: {
    label: 'Staying present when it gets hard',
    steps: [
      { cue: 'When a talk starts to feel hard', intention: 'stay one more minute before I step away' },
      { cue: 'When I feel the urge to defend myself', intention: 'ask one curious question first' },
      { cue: 'Before I answer in a hard moment', intention: 'name what I feel, out loud or to myself' },
      { cue: 'After we drift apart in a fight', intention: 'start the repair myself' },
    ],
  },
  appreciation: {
    label: 'Noticing and saying the good',
    steps: [
      { cue: 'At the end of the day', intention: 'notice one small thing they did' },
      { cue: 'When I notice something they did', intention: 'say thank you for it, out loud' },
      { cue: 'Once this week', intention: 'tell them one thing I admire about who they are' },
      { cue: 'When things are tense', intention: 'name one thing I still appreciate about them' },
    ],
  },
  curiosity: {
    label: 'Getting curious before getting sure',
    steps: [
      { cue: 'When they tell me about their day', intention: 'ask one more question before I share mine' },
      { cue: 'When I think I know what they meant', intention: 'check: "Did you mean…?"' },
      { cue: 'When we disagree', intention: 'say back what I heard before I answer' },
      { cue: 'When they are upset with me', intention: 'ask what it was like for them before I explain' },
    ],
  },
  repair: {
    label: 'Repairing the small things',
    steps: [
      { cue: 'When I notice I was short with them', intention: 'say "That came out wrong"' },
      { cue: 'Later the same day', intention: 'come back to it and say what I wish I had said' },
      { cue: 'After a hard moment', intention: 'ask "What would help you right now?"' },
      { cue: 'After a bigger fight', intention: 'share my part without a "but"' },
    ],
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
  level: number;            // the highest level they have practiced
  triedAtLevel: number;     // tries at that level
  easyAtLevel: number;      // tries that felt easy and helped (or were mixed)
  setbacksAtLevel: number;  // skipped / let go / too much at that level
  readyForNext: boolean;    // offer the next step (the user decides)
  suggestStepBack: boolean; // offer a smaller step, without comment
  completed: boolean;       // tried the top step — a whole arc walked (§11C)
};

const EASY_TRIES_FOR_NEXT = 2;
const SETBACKS_FOR_STEP_BACK = 2;

/**
 * Capacity per skill, from the user's own outcomes (constitution §3 Insight
 * Profile "capacity", §11A adaptive difficulty). Read-time only; never stored.
 */
export function capacityFromHistory(rows: MissionHistoryRow[]): SkillCapacity[] {
  const out: SkillCapacity[] = [];
  for (const skill of SKILL_KEYS) {
    const mine = rows.filter(r => r.skill_key === skill && r.status !== 'planned');
    if (mine.length === 0) continue;
    const level = Math.max(...mine.map(r => r.difficulty_level ?? 1));
    const atLevel = mine.filter(r => (r.difficulty_level ?? 1) === level);
    const tried = atLevel.filter(r => r.status === 'tried');
    const easy = tried.filter(r => r.learning?.felt === 'easy' && r.outcome !== 'didnt_help');
    const setbacks = atLevel.filter(
      r => r.status === 'skipped' || r.status === 'let_go' || r.learning?.felt === 'too_much',
    );
    const maxLevel = SKILL_LADDERS[skill].steps.length;
    out.push({
      skill,
      label: SKILL_LADDERS[skill].label,
      level,
      triedAtLevel: tried.length,
      easyAtLevel: easy.length,
      setbacksAtLevel: setbacks.length,
      readyForNext: level < maxLevel && easy.length >= EASY_TRIES_FOR_NEXT,
      suggestStepBack: level > 1 && setbacks.length >= SETBACKS_FOR_STEP_BACK && easy.length === 0,
      completed: level === maxLevel && tried.length > 0,
    });
  }
  return out;
}

export type MissionSuggestion = {
  skill_key: SkillKey;
  difficulty_level: number;
  cue: string;
  intention: string;
  /** Why it is offered — always the user's own words (influence provenance, §12). */
  because: { type: 'north_star' | 'reason'; text: string };
  kind: 'start' | 'next_step' | 'smaller_step';
};

/**
 * One mission idea, or null. Destination influence needs a user-chosen target
 * (constitution §5A): no North Star line and no still-true reason → no idea.
 * Never suggests while a mission is still open (one thing at a time).
 */
export function suggestMission(input: {
  northStarLine: string | null;
  ownReason: string | null;
  openCount: number;
  history: MissionHistoryRow[];
  declinedSkills?: string[];
}): MissionSuggestion | null {
  const because = input.northStarLine
    ? { type: 'north_star' as const, text: input.northStarLine }
    : input.ownReason
      ? { type: 'reason' as const, text: input.ownReason }
      : null;
  if (!because || input.openCount > 0) return null;

  const declined = new Set(input.declinedSkills ?? []);
  const capacity = capacityFromHistory(input.history);

  // 1. A smaller step after repeated setbacks — offered quietly.
  const back = capacity.find(c => c.suggestStepBack && !declined.has(c.skill));
  if (back) {
    const step = ladderStep(back.skill, back.level - 1);
    if (step) return { skill_key: back.skill, difficulty_level: step.level, cue: step.cue, intention: step.intention, because, kind: 'smaller_step' };
  }
  // 2. The next step once the current one has become easy.
  const next = capacity.find(c => c.readyForNext && !declined.has(c.skill));
  if (next) {
    const step = ladderStep(next.skill, next.level + 1);
    if (step) return { skill_key: next.skill, difficulty_level: step.level, cue: step.cue, intention: step.intention, because, kind: 'next_step' };
  }
  // 3. Otherwise a first step on a skill they haven't practiced yet.
  const practiced = new Set(capacity.map(c => c.skill));
  const fresh = SKILL_KEYS.find(s => !practiced.has(s) && !declined.has(s));
  if (fresh) {
    const step = ladderStep(fresh, 1)!;
    return { skill_key: fresh, difficulty_level: 1, cue: step.cue, intention: step.intention, because, kind: 'start' };
  }
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

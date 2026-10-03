// insight-profile.ts — the user-visible Insight Profile (constitution v1.1 §3,
// docs/PERSON_MODEL.md §8.1). Two parts:
//   1. How the user likes Peter to talk — their own settings (user_preferences.conversation_prefs).
//   2. Peter's guesses about their patterns, in plain words, each correctable.
// Everything here is shown to the user; nothing is a label they can't change.

import { INSIGHT_SKELETONS } from '@/lib/server/pattern-hints';
import { PATTERN_KEYS } from '@/lib/server/attachment-context';

// ── 1. Conversation preferences (user-set, two choices each) ────────────────

export const CONVERSATION_PREFS = {
  reply_length: {
    label: 'How long Peter\'s replies are',
    options: {
      short: { label: 'Short and simple', prompt: 'Keep replies short and simple — two or three sentences.' },
      detailed: { label: 'A bit more detail', prompt: 'They like a bit more detail — a few more sentences is fine.' },
    },
  },
  question_style: {
    label: 'Questions that help you think',
    options: {
      specific: { label: 'Specific ones ("What happened right before?")', prompt: 'Ask specific, concrete questions ("What happened right before?").' },
      open: { label: 'Open ones ("What\'s on your mind?")', prompt: 'Ask open, roomy questions ("What\'s on your mind?").' },
    },
  },
  directness: {
    label: 'When you\'re stuck',
    options: {
      gentle: { label: 'Go gently', prompt: 'When they are stuck, go gently — warmth first, and only a light nudge.' },
      direct: { label: 'Be direct with me', prompt: 'When they are stuck, they want you to be direct — say the honest thing kindly and plainly.' },
    },
  },
  // Timing (constitution v1.2 §6B) — what they told us, never inferred.
  hard_days: {
    label: 'On hard days',
    options: {
      comfort: { label: 'Just be with me', prompt: 'On hard days they want comfort only — no growth step, challenge or idea unless they ask.' },
      nudge: { label: 'Still nudge me, gently', prompt: 'On hard days they still welcome one small, gentle nudge — after comfort, never instead of it.' },
    },
  },
  // Real-World Mission ideas (§11A) — the user decides whether Sparq offers them.
  ideas: {
    label: 'Ideas for things to try',
    options: {
      welcome: { label: 'Offer me ideas', prompt: 'They welcome one small idea to try in real life when it fits a goal they chose.' },
      ask_first: { label: 'Only when I ask', prompt: 'Only suggest things to try when they ask for ideas.' },
    },
  },
} as const;

export type PrefKey = keyof typeof CONVERSATION_PREFS;
export type ConversationPrefs = Partial<Record<PrefKey, string>>;

export function isValidPref(key: string, value: string | null): key is PrefKey {
  if (!(key in CONVERSATION_PREFS)) return false;
  if (value === null) return true;
  return value in CONVERSATION_PREFS[key as PrefKey].options;
}

/** Keep only known keys/values. */
export function cleanPrefs(raw: unknown): ConversationPrefs {
  const out: ConversationPrefs = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && isValidPref(key, value)) out[key as PrefKey] = value;
  }
  return out;
}

/** Prompt block for Peter — the user's own settings, which he follows. */
export function buildConversationPrefsBlock(prefs: ConversationPrefs): string {
  const lines = (Object.keys(prefs) as PrefKey[])
    .map(key => {
      const option = (CONVERSATION_PREFS[key].options as Record<string, { prompt: string }>)[prefs[key] as string];
      return option ? `- ${option.prompt}` : null;
    })
    .filter(Boolean);
  if (lines.length === 0) return '';
  return `\n\nHow they asked you to talk with them (their own settings — follow these):\n${lines.join('\n')}`;
}

// ── 2. Peter's guesses, in plain words ──────────────────────────────────────

const LEGACY_LABELS: Record<string, Record<string, string>> = {
  love_language: {
    words: 'Hearing care said out loud may mean a lot to you.',
    acts: 'Helpful things done with care may mean a lot to you.',
    gifts: 'Small, thoughtful gestures may mean a lot to you.',
    time: 'Focused time together may mean a lot to you.',
    touch: 'Physical closeness may mean a lot to you.',
  },
  conflict_style: {
    avoidant: 'You may tend to step back when things heat up.',
    volatile: 'You may feel things big in a disagreement and say them right away.',
    validating: 'You may tend to make sure both of you are heard in a disagreement.',
  },
};

export const GUESS_TOPICS: Record<string, string> = {
  attachment_style: 'When things feel uncertain',
  repair_style: 'After a hard moment',
  reassurance_need: 'Feeling secure',
  space_preference: 'Working things through',
  stress_communication: 'When stress shows up',
  interpretation_bias: 'When something feels off',
  vulnerability_pace: 'Opening up',
  worth_pattern: 'Feeling valued',
  love_language: 'Feeling loved',
  conflict_style: 'Disagreements',
};

/** Plain-language wording of a guess, or null if the value is unknown. */
export function describeGuess(traitKey: string, value: string): string | null {
  if ((PATTERN_KEYS as readonly string[]).includes(traitKey)) {
    const skeleton = (INSIGHT_SKELETONS as Record<string, Record<string, string | undefined>>)[traitKey]?.[value];
    if (!skeleton) return null;
    const rest = skeleton.replace(/^I've noticed you tend to /i, '');
    return `You may tend to ${rest}.`;
  }
  return LEGACY_LABELS[traitKey]?.[value] ?? null;
}

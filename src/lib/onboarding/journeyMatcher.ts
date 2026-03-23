// src/lib/onboarding/journeyMatcher.ts
import type { DerivedProfile } from './types';

export interface JourneyMatch {
  journeyId: string;
  reason: string; // Peter's one-sentence recommendation copy
  peterNote: string; // Peter's note shown on the Journey Detail screen
}

export interface JourneyRecommendation {
  primary: JourneyMatch;
  alternatives: JourneyMatch[];
}

// Pre-written recommendation reasons keyed by [attachmentStyle][journeyId]
const REASONS: Record<string, Record<string, string>> = {
  anxious: {
    'attachment-healing': "it works with the part of you that learned to watch instead of rest.",
    'trust-rebuilding':   "building trust from the inside out is exactly what you need right now.",
    'communication':      "learning to say what's true before the worry takes over will change everything.",
    'emotional-intelligence': "understanding your own emotional patterns is the first step to steadying them.",
    'relationship-renewal':   "sometimes the freshest thing you can do is see what's already there.",
    'values':                 "knowing what you're actually moving toward makes every step feel more solid.",
  },
  avoidant: {
    'emotional-intelligence': "understanding your inner world is the first bridge to letting someone else in.",
    'values':                 "knowing what you actually want makes it easier to move toward it.",
    'communication':          "learning to speak before you step back is quiet, powerful work.",
    'attachment-healing':     "the wall you built was smart once — this work helps you choose when to open the door.",
    'relationship-renewal':   "reconnecting doesn't have to mean overwhelming — it can start with one small thing.",
  },
  disorganized: {
    'attachment-healing': "we're going to work with the part of you that wants closeness and safety at the same time.",
    'values':             "getting clear on what you actually believe creates ground under your feet.",
    'mindful-sexuality':  "this journey starts with your relationship to your own body — the safest place to begin.",
    'emotional-intelligence': "naming what you feel is how you stop being ruled by it.",
  },
  secure: {
    'relationship-renewal':   "you're not here because something is broken — you're here because you want more of what's good.",
    'love-languages':         "you already have the foundation; this helps you speak each other's language more fluently.",
    'intimacy':               "deeper intimacy doesn't require a crisis — just intention and a little practice.",
    'communication':          "even secure couples have communication edges worth sharpening.",
  },
};

const DEFAULT_REASON = "this journey will give you real tools you can use right away.";

function getReason(attachmentStyle: string, journeyId: string): string {
  return REASONS[attachmentStyle]?.[journeyId] ?? DEFAULT_REASON;
}

// Peter's note on the Journey Detail screen — keyed by journeyId
const PETER_NOTES: Record<string, string> = {
  'attachment-healing':     "This is where your real work starts. Come back tomorrow and I'll have something ready for you. 🦦",
  'emotional-intelligence': "Understanding yourself from the inside is the whole game. I'll be right there with you. 🦦",
  'trust-rebuilding':       "Trust gets built one small moment at a time. Tomorrow we start with one. 🦦",
  'communication':          "Saying the true thing — that's the practice. You're ready for it. 🦦",
  'relationship-renewal':   "There's more here than you think. Let's find it together. 🦦",
  'love-languages':         "Speaking their language changes everything. Day 1 starts tomorrow. 🦦",
  'intimacy':               "Depth is built slowly and on purpose. You're in the right place. 🦦",
  'values':                 "Knowing what you're moving toward makes every step lighter. Let's go. 🦦",
  'mindful-sexuality':      "This starts with you — the safest and best place to begin. 🦦",
};

const DEFAULT_PETER_NOTE = "This is where your real work starts. Come back tomorrow and I'll have something ready for you. 🦦";

function getPeterNote(journeyId: string): string {
  return PETER_NOTES[journeyId] ?? DEFAULT_PETER_NOTE;
}

// Journey routing table
const ROUTING: Record<string, { primary: string; alternatives: string[] }> = {
  anxious:      { primary: 'attachment-healing',     alternatives: ['trust-rebuilding', 'communication'] },
  avoidant:     { primary: 'emotional-intelligence', alternatives: ['values', 'communication'] },
  disorganized: { primary: 'attachment-healing',     alternatives: ['values', 'mindful-sexuality'] },
  secure:       { primary: 'relationship-renewal',   alternatives: ['love-languages', 'intimacy'] },
};

// Journeys to deprioritise when lifeContext is heavy
const HEAVY_CONTEXT_EXCLUDE = new Set(['sexual-intimacy', 'fantasy-exploration']);

export function matchJourney(profile: DerivedProfile): JourneyRecommendation {
  const route = ROUTING[profile.attachmentStyle] ?? ROUTING.secure;
  let primary = route.primary;
  let alternatives = [...route.alternatives];

  // Override: traumaFlag always surfaces attachment-healing
  if (profile.traumaFlag && primary !== 'attachment-healing') {
    alternatives = ['attachment-healing', ...alternatives.filter(id => id !== 'attachment-healing')].slice(0, 3);
  }

  // Override: heavy life context removes explicit content journeys
  if (profile.lifeContext === 'heavy') {
    if (HEAVY_CONTEXT_EXCLUDE.has(primary)) {
      primary = alternatives[0] ?? 'attachment-healing';
      alternatives = alternatives.slice(1);
    }
    alternatives = alternatives.filter(id => !HEAVY_CONTEXT_EXCLUDE.has(id));
  }

  return {
    primary: { journeyId: primary, reason: getReason(profile.attachmentStyle, primary), peterNote: getPeterNote(primary) },
    alternatives: alternatives.slice(0, 3).map(id => ({
      journeyId: id,
      reason: getReason(profile.attachmentStyle, id),
      peterNote: getPeterNote(id),
    })),
  };
}

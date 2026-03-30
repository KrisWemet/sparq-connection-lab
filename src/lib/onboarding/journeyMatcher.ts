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

// Pre-written recommendation reasons keyed by journeyId
const REASONS: Record<string, string> = {
  'safe-in-love':
    "it works with the part of you that learned to watch instead of rest — so you can finally feel safe enough to stop watching.",
  'building-trust':
    "building trust from the inside out is exactly what you need right now.",
  'calm-before-closeness':
    "finding your ground before you let someone in — that's quiet, powerful work.",
  'opening-heart':
    "this journey helps you open the door on your own terms — no pressure, just practice.",
  'healing-old-wounds':
    "we're going to work gently with the things that stayed with you — at your pace, always.",
  'mixed-feelings':
    "making sense of the push and pull inside you is the first step toward steadier ground.",
  'deepening-good':
    "you're not here because something is broken — you're here because you want more of what's good.",
  'shared-language':
    "learning to say the real thing — before the distance creeps in — changes everything.",
  'staying-grounded':
    "when life gets heavy, the most powerful thing you can do is stay rooted in what matters.",
};

const DEFAULT_REASON = "this journey will give you real tools you can use right away.";

function getReason(journeyId: string): string {
  return REASONS[journeyId] ?? DEFAULT_REASON;
}

// Peter's note on the Journey Detail screen — keyed by journeyId
const PETER_NOTES: Record<string, string> = {
  'safe-in-love':
    "This is where your real work starts. We're going to build safety from the inside — one day at a time. Come back tomorrow. 🦦",
  'building-trust':
    "Trust gets built one small moment at a time. Tomorrow we start with one. 🦦",
  'calm-before-closeness':
    "Finding your center first — that takes real courage. I'll be right here with you. 🦦",
  'opening-heart':
    "Opening up doesn't have to mean losing yourself. We'll go slow. Day 1 starts tomorrow. 🦦",
  'healing-old-wounds':
    "This is gentle work — and it matters more than you know. I'll be with you every step. 🦦",
  'mixed-feelings':
    "The push and pull makes sense. We're going to name it and work with it. See you tomorrow. 🦦",
  'deepening-good':
    "There's more here than you think. Let's find it together. 🦦",
  'shared-language':
    "Saying the true thing — that's the practice. You're ready for it. 🦦",
  'staying-grounded':
    "When everything feels like a lot, we go back to basics. One breath, one day. Tomorrow we begin. 🦦",
};

const DEFAULT_PETER_NOTE = "This is where your real work starts. Come back tomorrow and I'll have something ready for you. 🦦";

function getPeterNote(journeyId: string): string {
  return PETER_NOTES[journeyId] ?? DEFAULT_PETER_NOTE;
}

/**
 * 9-route journey matching table.
 *
 * Routing considers: attachmentStyle + abandonmentFear + dysregulationLevel +
 * traumaFlag + lifeContext + conflictStyle
 */
function resolveRoute(profile: DerivedProfile): { primary: string; alternatives: string[] } {
  // Override: heavy life context always routes to staying-grounded
  if (profile.lifeContext === 'heavy') {
    return {
      primary: 'staying-grounded',
      alternatives: resolveBaseRoute(profile),
    };
  }

  const primary = resolveBaseRoute(profile)[0];
  const alternatives = resolveAlternatives(profile, primary);

  return { primary, alternatives };
}

/**
 * Base routing by attachment style + sub-signals.
 * Returns ordered list of journey IDs (best match first).
 */
function resolveBaseRoute(profile: DerivedProfile): string[] {
  switch (profile.attachmentStyle) {
    case 'anxious':
      if (profile.abandonmentFear === 'high') {
        return ['safe-in-love', 'building-trust', 'shared-language'];
      }
      return ['building-trust', 'safe-in-love', 'shared-language'];

    case 'avoidant':
      if (profile.dysregulationLevel === 'high') {
        return ['calm-before-closeness', 'opening-heart', 'staying-grounded'];
      }
      return ['opening-heart', 'calm-before-closeness', 'deepening-good'];

    case 'disorganized':
      if (profile.traumaFlag) {
        return ['healing-old-wounds', 'mixed-feelings', 'staying-grounded'];
      }
      return ['mixed-feelings', 'healing-old-wounds', 'opening-heart'];

    case 'secure':
      if (profile.conflictStyle === 'avoidant' || profile.conflictStyle === 'avoid') {
        return ['shared-language', 'deepening-good', 'building-trust'];
      }
      return ['deepening-good', 'shared-language', 'building-trust'];

    default:
      return ['deepening-good', 'shared-language', 'building-trust'];
  }
}

function resolveAlternatives(profile: DerivedProfile, primary: string): string[] {
  const base = resolveBaseRoute(profile);
  return base.filter(id => id !== primary).slice(0, 3);
}

export function matchJourney(profile: DerivedProfile): JourneyRecommendation {
  const route = resolveRoute(profile);

  return {
    primary: {
      journeyId: route.primary,
      reason: getReason(route.primary),
      peterNote: getPeterNote(route.primary),
    },
    alternatives: route.alternatives.slice(0, 3).map(id => ({
      journeyId: id,
      reason: getReason(id),
      peterNote: getPeterNote(id),
    })),
  };
}

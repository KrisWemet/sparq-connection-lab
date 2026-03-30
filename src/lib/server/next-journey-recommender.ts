// src/lib/server/next-journey-recommender.ts
// Recommends the next 3 journeys after a user completes one.

import { starterJourneyMap, starterJourneyIds } from '@/data/starter-journeys';

export interface NextJourneyRec {
  journeyId: string;
  title: string;
  description: string;
  duration: number;
  peterReason: string;
}

const PETER_TRANSITION_REASONS: Record<string, string> = {
  'safe-in-love':
    "Now that you've built some safety inside, this one goes deeper into how you connect.",
  'building-trust':
    "You've been practicing trust — this one builds on that foundation beautifully.",
  'calm-before-closeness':
    "You found your calm. Now let's explore what happens when you bring that calm closer.",
  'opening-heart':
    "You've been opening up — this one helps you stay open even when it's hard.",
  'healing-old-wounds':
    "That was brave, gentle work. This next one builds on the ground you've made.",
  'mixed-feelings':
    "You named the push and pull. Now let's work with what you found.",
  'deepening-good':
    "You've been deepening what's good. This one adds a new layer to that practice.",
  'shared-language':
    "Now that you're speaking more clearly, this one helps you listen differently too.",
  'staying-grounded':
    "You stayed grounded through the hard stuff. This one builds from that strength.",
};

const DEFAULT_TRANSITION = "I think this one is exactly right for where you are now.";

/**
 * Recommends up to 3 next journeys based on profile traits and completed journeys.
 * Excludes already-completed journeys.
 * Optionally suggests a rest day after trauma-related journeys.
 */
export function recommendNextJourneys(
  completedJourneyIds: string[],
  attachmentStyle?: string | null,
  lastCompletedJourneyId?: string | null,
): { recommendations: NextJourneyRec[]; suggestRest: boolean } {
  const completed = new Set(completedJourneyIds);

  // Filter available journeys
  const available = starterJourneyIds
    .filter(id => !completed.has(id))
    .map(id => starterJourneyMap.get(id)!)
    .filter(Boolean);

  if (available.length === 0) {
    return { recommendations: [], suggestRest: false };
  }

  // Score journeys based on attachment style affinity
  const scored = available.map(j => {
    let score = 0;

    // Boost journeys that match the user's attachment profile
    if (attachmentStyle === 'anxious' && ['building-trust', 'safe-in-love'].includes(j.id)) score += 2;
    if (attachmentStyle === 'avoidant' && ['opening-heart', 'calm-before-closeness'].includes(j.id)) score += 2;
    if (attachmentStyle === 'disorganized' && ['mixed-feelings', 'healing-old-wounds'].includes(j.id)) score += 2;
    if (attachmentStyle === 'secure' && ['deepening-good', 'shared-language'].includes(j.id)) score += 2;

    // Slightly prefer shorter journeys (easier commitment)
    if (j.duration <= 10) score += 1;

    return { journey: j, score };
  });

  // Sort by score descending, take top 3
  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3);

  const recommendations: NextJourneyRec[] = top3.map(({ journey }) => ({
    journeyId: journey.id,
    title: journey.title,
    description: journey.description,
    duration: journey.duration,
    peterReason: PETER_TRANSITION_REASONS[journey.id] ?? DEFAULT_TRANSITION,
  }));

  // Suggest rest after healing-old-wounds or other trauma-adjacent journeys
  const suggestRest =
    lastCompletedJourneyId === 'healing-old-wounds' ||
    lastCompletedJourneyId === 'mixed-feelings';

  return { recommendations, suggestRest };
}

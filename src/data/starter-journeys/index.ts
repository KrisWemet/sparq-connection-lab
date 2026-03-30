// src/data/starter-journeys/index.ts

import type { StarterJourney, JourneyContentDay } from './types';

// Journey content files — imported lazily to keep bundle size down on pages that don't need them
import { deepeningGood } from './deepening-good';
import { stayingGrounded } from './staying-grounded';
import { buildingTrust } from './building-trust';
import { openingHeart } from './opening-heart';
import { sharedLanguage } from './shared-language';
import { safeInLove } from './safe-in-love';
import { calmBeforeCloseness } from './calm-before-closeness';
import { mixedFeelings } from './mixed-feelings';
import { healingOldWounds } from './healing-old-wounds';

export type { StarterJourney, JourneyContentDay } from './types';

const ALL_JOURNEYS: StarterJourney[] = [
  deepeningGood,
  stayingGrounded,
  buildingTrust,
  openingHeart,
  sharedLanguage,
  safeInLove,
  calmBeforeCloseness,
  mixedFeelings,
  healingOldWounds,
];

/** Lookup map: journey ID → StarterJourney */
export const starterJourneyMap = new Map<string, StarterJourney>(
  ALL_JOURNEYS.map(j => [j.id, j])
);

/** All starter journey IDs */
export const starterJourneyIds = ALL_JOURNEYS.map(j => j.id);

/**
 * Get a specific day's content from a journey.
 * Returns null if the journey or day doesn't exist.
 */
export function getJourneyDay(journeyId: string, dayIndex: number): JourneyContentDay | null {
  const journey = starterJourneyMap.get(journeyId);
  if (!journey) return null;

  const day = journey.days.find(d => d.dayIndex === dayIndex);
  return day ?? null;
}

/**
 * Get journey metadata without content (for UI display).
 */
export function getJourneyMeta(journeyId: string) {
  const journey = starterJourneyMap.get(journeyId);
  if (!journey) return null;

  return {
    id: journey.id,
    title: journey.title,
    duration: journey.duration,
    modalities: journey.modalities,
    modalityLabel: journey.modalityLabel,
    description: journey.description,
    profileCluster: journey.profileCluster,
  };
}

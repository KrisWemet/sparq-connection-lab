// src/lib/server/journey-content.ts
// Server-side content resolver: takes journey_id + day_index, returns static content or null.

import { getJourneyDay, getJourneyMeta, starterJourneyMap } from '@/data/starter-journeys';
import type { JourneyContentDay } from '@/data/starter-journeys/types';

export interface ResolvedJourneyContent {
  /** The day's static content */
  day: JourneyContentDay;
  /** Journey metadata for display */
  journeyTitle: string;
  journeyDuration: number;
  modalityLabel: string;
}

/**
 * Resolve static journey content for a given journey + day.
 * Returns null if no static content exists (triggers LLM fallback).
 */
export function resolveJourneyContent(
  journeyId: string | null | undefined,
  dayIndex: number
): ResolvedJourneyContent | null {
  if (!journeyId) return null;

  const day = getJourneyDay(journeyId, dayIndex);
  if (!day) return null;

  const meta = getJourneyMeta(journeyId);
  if (!meta) return null;

  return {
    day,
    journeyTitle: meta.title,
    journeyDuration: meta.duration,
    modalityLabel: meta.modalityLabel,
  };
}

/**
 * Check if a journey is complete (dayIndex exceeds journey duration).
 */
export function isJourneyComplete(journeyId: string, dayIndex: number): boolean {
  const journey = starterJourneyMap.get(journeyId);
  if (!journey) return false;
  return dayIndex > journey.duration;
}

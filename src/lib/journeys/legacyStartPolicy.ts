import { starterJourneyMap } from '@/data/starter-journeys';

export function shouldStartLegacyJourney(journeyId: string): boolean {
  return !starterJourneyMap.has(journeyId);
}

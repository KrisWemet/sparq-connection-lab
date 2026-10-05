// catalog.ts — every journey Sparq offers, in one list (Journey audit, decision 1).
// The 9 starter journeys (daily, from src/data/starter-journeys) and the 13
// staged journeys (Roots → Growth → Bloom, from src/data/journeys) share one
// id space and one state record (user_journeys). Server-side use: it pulls in
// the starter journeys' full content.

import { journeys as stagedJourneys } from '@/data/journeys';
import { starterJourneyMap } from '@/data/starter-journeys';
import type { JourneyShape } from './progress';

/** Every staged journey page defines three stages of 14 days. */
export const STAGE_LENGTH = 14;

export type CatalogJourney = {
  id: string;
  title: string;
  shape: JourneyShape;
};

const entries: CatalogJourney[] = [
  ...Array.from(starterJourneyMap.values()).map(j => ({
    id: j.id,
    title: j.title,
    shape: { kind: 'daily', length: j.duration } as JourneyShape,
  })),
  ...stagedJourneys.map(j => ({
    id: j.id,
    title: j.title,
    shape: { kind: 'staged', stageLength: STAGE_LENGTH } as JourneyShape,
  })),
];

export const journeyCatalog = new Map<string, CatalogJourney>(entries.map(e => [e.id, e]));

export const stagedJourneyIds: ReadonlySet<string> = new Set(stagedJourneys.map(j => j.id));

export function getCatalogJourney(id: string | null | undefined): CatalogJourney | null {
  return id ? journeyCatalog.get(id) ?? null : null;
}

/** Daily journeys run through the Daily Loop's own content today (staged ones join in Phase 2). */
export function isDailyJourney(id: string | null | undefined): boolean {
  return getCatalogJourney(id)?.shape.kind === 'daily';
}

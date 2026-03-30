// src/data/starter-journeys/types.ts

export interface JourneyLearn {
  /** 200-300 word story (fictional couple, pull language, 4th grade reading level) */
  story: string;
  /** One-sentence key insight that primes the RAS */
  keyInsight: string;
}

export interface JourneyAction {
  /** Micro-action prompt reinforcing the morning lesson */
  prompt: string;
}

export interface JourneyReflection {
  /** Topic-tied journal prompt for evening Peter chat */
  prompt: string;
}

export interface JourneyContentDay {
  dayIndex: number;
  learn: JourneyLearn;
  action: JourneyAction;
  reflection: JourneyReflection;
}

export interface StarterJourney {
  id: string;
  title: string;
  /** Duration in days */
  duration: number;
  /** Primary therapeutic modalities (never shown to user) */
  modalities: string[];
  /** User-facing modality label for the exercise card */
  modalityLabel: string;
  /** One-line description shown on journey selection */
  description: string;
  /** Profile cluster this journey targets */
  profileCluster: string;
  /** Daily content indexed by day (1-based) */
  days: JourneyContentDay[];
}

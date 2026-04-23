// src/lib/onboarding/types.ts

export interface RawScores {
  anxious: number;
  avoidant: number;
  secure: number;
  disorganized: number;
  dysregulation: number;
  abandonment: number;
  selfWorth: number; // high = fragile, low = stable
  trauma: number;
}

export interface DerivedProfile {
  // Identity
  firstName: string;
  ageRange: string;
  pronouns: string;
  relationshipStatus: string;
  partnerName: string | null;
  relationshipLength: string | null;
  partnerUsing: string | null;

  // Clinical signals
  attachmentStyle: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  dysregulationLevel: 'low' | 'moderate' | 'high';
  abandonmentFear: 'low' | 'moderate' | 'high';
  selfWorthPattern: 'stable' | 'conditional' | 'fragile';
  traumaFlag: boolean;

  // Modality routing
  primaryModalities: string[];
  toneMode: 'validation-first' | 'nurturing' | 'collaborative';

  // Preferences
  loveLanguage: string;
  conflictStyle: string;
  lifeContext: string;
  checkInFrequency: string;
  growthGoal: string;

  // Raw scores
  scores: RawScores;

  // Free-text answers from Phase 1 (questionIndex → text)
  freeTextAnswers: Record<number, string>;

  // Stored after Phase 2 completes
  peterClosingSentence: string;
}

export interface QuestionOption {
  label: string;
  scoreDeltas?: Partial<RawScores>;
  // For non-scoring fields
  sets?: {
    field: keyof DerivedProfile;
    value: string;
  };
  bridge: string;
  isFreeText?: true; // marks the "write my own" option
}

export interface Question {
  index: number;
  topic: string;
  // Peter's message — use {firstName} and {partnerName} as tokens, replaced at render time
  peterText: string | ((ctx: { firstName: string; partnerName: string | null }) => string);
  inputType: 'text' | 'quick-reply' | 'multi-part';
  options?: QuestionOption[];
  captures: (keyof DerivedProfile)[];
}

// State machine phases
export type OnboardingPhase =
  | 'consent'
  | 'questions'
  | 'scoring_transition'
  | 'peter_session'
  | 'journey_rec'
  | 'journey_detail'
  | 'habit_anchors';

// Persisted to localStorage under key 'sparq_onboarding_progress'
export interface OnboardingProgress {
  answers: Record<number, string | { ageRange: string; pronouns: string }>;
  freeTextAnswers: Record<number, string>;
  scores: RawScores;
  lastQuestionIndex: number;
  // Partial identity collected so far
  firstName: string;
  ageRange: string;
  pronouns: string;
  relationshipStatus: string;
  partnerName: string | null;
  relationshipLength: string | null;
  partnerUsing: string | null;
  loveLanguage: string;
  conflictStyle: string;
  lifeContext: string;
  checkInFrequency: string;
  growthGoal: string;
}

export const INITIAL_SCORES: RawScores = {
  anxious: 0,
  avoidant: 0,
  secure: 0,
  disorganized: 0,
  dysregulation: 0,
  abandonment: 0,
  selfWorth: 0,
  trauma: 0,
};

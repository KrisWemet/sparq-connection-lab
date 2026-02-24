import type { PersonalityDimension, DiscoveryPhase } from "@/types/personality";
import type { PsychologyModality } from "@/types/quiz";

// ─── Identity Archetypes ───────────────────────────────────────────────

/**
 * Core identity archetypes that represent how users want to show up in their relationships.
 * Selected during onboarding and used to flavor session content and micro-actions.
 */
export type IdentityArchetype =
  | "calm-anchor"            // "I want to be the steady, grounding presence"
  | "compassionate-listener" // "I want to truly hear and understand"
  | "growth-seeker"          // "I want to keep evolving and learning"
  | "connection-builder";    // "I want to create deeper bonds"

/**
 * Whether the user is using the app solo or with a partner.
 */
export type RelationshipMode = "solo" | "partner";

// ─── Question Formats ──────────────────────────────────────────────────

/**
 * Supported question formats for Learn step questions.
 */
export type QuestionFormat = "multiple-choice" | "open-ended" | "scale" | "ranking";

/**
 * A single multiple-choice option with optional personality signal hints.
 */
export interface MCOption {
  id: string;
  text: string;
  /** Hidden from user — which personality signals this choice reveals */
  signalHints?: {
    dimension: PersonalityDimension;
    indicator: string;
    strength: number;
  }[];
}

/**
 * A single question shown in the Learn step of a daily session.
 * Can be multiple-choice, open-ended, scale, or ranking format.
 */
export interface SessionQuestion {
  id: string;
  text: string;
  format: QuestionFormat;
  options?: MCOption[];             // For multiple-choice
  scaleMin?: number;                // For scale (default 1)
  scaleMax?: number;                // For scale (default 5)
  scaleLabels?: [string, string];   // ["Not at all", "Very much"]
  rankingItems?: string[];          // For ranking format
  targetDimensions: PersonalityDimension[];
  intimacyLevel: 1 | 2 | 3 | 4 | 5;
  modality: PsychologyModality;
}

// ─── Session Greeting ──────────────────────────────────────────────────

/**
 * The opening greeting for a daily session, personalized to the user's archetype.
 */
export interface SessionGreeting {
  text: string;
  /** Optional sub-text like "Day 5 of your journey" */
  subtitle?: string;
}

// ─── Yesterday Check-in ────────────────────────────────────────────────

/**
 * Predefined response options for how yesterday's micro-action went.
 */
export type CheckInResponseId = "loved-it" | "felt-awkward" | "didnt-try" | "modified-it";

/**
 * A single check-in option with emoji and text.
 */
export interface CheckInOption {
  id: CheckInResponseId;
  text: string;
  emoji: string;
}

/**
 * Yesterday's micro-action check-in (shown Day 2+).
 * Asks how their previous day's action went and provides warm acknowledgments.
 */
export interface YesterdayCheckIn {
  /** Reminder of what they planned to do, e.g. "Yesterday you planned to..." */
  actionReminder: string;
  options: CheckInOption[];
  /** Warm response per option selection */
  acknowledgments: Record<CheckInResponseId, string>;
}

// ─── Learn Step ────────────────────────────────────────────────────────

/**
 * The Learn step of a daily session.
 * Presents a question to the user, with optional insight before and micro-insight after.
 */
export interface LearnStep {
  /** The question for the user */
  question: SessionQuestion;
  /** Brief intro before the question: "Today we're exploring..." */
  insight: string;
  /** Shown AFTER they answer — "Here's what that tells us..." */
  microInsight?: string;
  /** The modality framing this question */
  modality: PsychologyModality;
}

// ─── Implement Step (Micro-Action) ─────────────────────────────────────

/**
 * Categories for micro-actions.
 */
export type MicroActionCategory =
  | "communication"
  | "conflict"
  | "connection"
  | "awareness"
  | "behavior";

/**
 * A single micro-action that's been personalized to the user's context.
 * Includes template ID, base text, and AI-customized version.
 */
export interface PersonalizedMicroAction {
  templateId: string;
  /** Original template text */
  baseText: string;
  /** AI-customized with user details (name, situation, etc.) */
  personalizedText: string;
  category: MicroActionCategory;
  difficulty: 1 | 2 | 3;
  estimatedMinutes: number;
  soloFriendly: boolean;
}

/**
 * The Implement step of a daily session.
 * Presents a micro-action for the user to commit to, with an optional alternative.
 */
export interface ImplementStep {
  microAction: PersonalizedMicroAction;
  /** Backup option shown if user taps "See another" */
  alternative?: PersonalizedMicroAction;
}

// ─── Reflect Step ──────────────────────────────────────────────────────

/**
 * The Reflect step of a daily session.
 * Can be open-ended or guided with sub-prompts. Often completed later in the day.
 */
export interface ReflectStep {
  prompt: string;
  format: "open-ended" | "guided";
  /** Sub-prompts for guided reflection */
  guidedPrompts?: string[];
  /** Whether it connects back to today's Learn topic */
  relatedToLearn: boolean;
}

// ─── Celebration ───────────────────────────────────────────────────────

/**
 * The closing celebration message shown when the user completes their session.
 * Includes archetype-flavored encouragement and optional streak info.
 */
export interface CelebrationMessage {
  text: string;
  /** Archetype-flavored encouragement */
  encouragement: string;
  /** Whether to show streak info */
  showStreak: boolean;
  streakCount?: number;
}

// ─── Complete Daily Session ────────────────────────────────────────────

/**
 * A complete daily session object containing all steps:
 * Greeting → Yesterday Check-in → Learn → Implement → Reflect → Celebration
 *
 * Generated by sessionGenerationService and stored in the database.
 */
export interface DailySession {
  id: string;
  userId: string;
  dayNumber: number;
  phase: DiscoveryPhase;
  createdAt: string;

  greeting: SessionGreeting;
  yesterdayCheckIn?: YesterdayCheckIn;   // Only present Day 2+
  learn: LearnStep;
  implement: ImplementStep;
  reflect: ReflectStep;
  celebration: CelebrationMessage;
}

// ─── Session Response (what the user submits) ──────────────────────────

/**
 * The user's complete response to a daily session.
 * Includes answers to all steps: check-in, learn, implement acceptance, and reflect.
 */
export interface SessionResponse {
  sessionId: string;

  /** Yesterday check-in answer */
  checkInResponse?: CheckInResponseId;

  /** Learn step answer */
  learnAnswer: {
    questionId: string;
    /** For MC: the selected option ID. For open: the text. For scale: the number as string. */
    value: string;
    format: QuestionFormat;
    /** Time spent on this step in seconds */
    timeSpent: number;
  };

  /** Whether they accepted the micro-action */
  implementAccepted: boolean;
  /** If they swapped, which action they ended up with */
  implementActionId: string;

  /** Reflect answer (may be filled in later / evening) */
  reflectAnswer?: {
    value: string;
    completedAt: string;
  };
}

// ─── Session Generation Input ──────────────────────────────────────────

/**
 * Input data required to generate a personalized daily session.
 * Used by sessionGenerationService to create context-aware Learn/Implement/Reflect steps.
 */
export interface SessionGenerationInput {
  userId: string;
  userName: string;
  partnerName?: string;
  identityArchetype: IdentityArchetype;
  relationshipMode: RelationshipMode;
  discoveryDay: number;
  discoveryPhase: DiscoveryPhase;
  onboardingGoals: string[];
  /** Profile context string for AI prompts */
  profileContextSummary: string;
  /** Emerging attachment style (may be undefined early on) */
  attachmentStyle?: string;
  /** Yesterday's micro-action text (for check-in) */
  yesterdayAction?: string;
  /** Previously asked question IDs to avoid repetition */
  previousQuestionIds: string[];
  /** Format ratio for this phase */
  formatPreferences: {
    multipleChoice: number;  // 0-100
    openEnded: number;
    scale: number;
    ranking: number;
  };
}

// ─── Phase Format Preferences ──────────────────────────────────────────

/**
 * Maps discovery phases to their preferred question format ratios.
 * Early phases favor multiple-choice for ease; later phases favor open-ended for depth.
 */
export const PHASE_FORMAT_PREFERENCES: Record<string, SessionGenerationInput["formatPreferences"]> = {
  "self-awareness": { multipleChoice: 70, openEnded: 10, scale: 20, ranking: 0 },
  "behavior-change": { multipleChoice: 50, openEnded: 25, scale: 15, ranking: 10 },
  "skill-building": { multipleChoice: 35, openEnded: 40, scale: 15, ranking: 10 },
  "integration": { multipleChoice: 20, openEnded: 55, scale: 15, ranking: 10 },
  // Map old phase names too for compatibility
  "rhythm": { multipleChoice: 70, openEnded: 10, scale: 20, ranking: 0 },
  "deepening": { multipleChoice: 50, openEnded: 25, scale: 15, ranking: 10 },
  "navigating": { multipleChoice: 35, openEnded: 40, scale: 15, ranking: 10 },
  "layers": { multipleChoice: 25, openEnded: 50, scale: 15, ranking: 10 },
  "mirror": { multipleChoice: 20, openEnded: 55, scale: 15, ranking: 10 },
};

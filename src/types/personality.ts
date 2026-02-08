import { PsychologyModality } from "./quiz";

// ─── Attachment Style ────────────────────────────────────────────────────────

export type AttachmentStyle =
  | "secure"
  | "anxious-preoccupied"
  | "dismissive-avoidant"
  | "fearful-avoidant";

export interface AttachmentSignals {
  /** Seeks closeness when stressed, fears abandonment */
  anxietyLevel: number; // 0-1
  /** Discomfort with closeness, values independence over intimacy */
  avoidanceLevel: number; // 0-1
  /** Behavioral cues extracted from responses */
  observations: string[];
}

// ─── Love Languages ─────────────────────────────────────────────────────────

export type LoveLanguage =
  | "words-of-affirmation"
  | "quality-time"
  | "physical-touch"
  | "acts-of-service"
  | "receiving-gifts";

export interface LoveLanguageProfile {
  /** Ranked from strongest to weakest */
  ranked: LoveLanguage[];
  /** Score for each language (0-1) */
  scores: Record<LoveLanguage, number>;
}

// ─── Conflict Style ─────────────────────────────────────────────────────────

export type ConflictPattern =
  | "pursuer"        // Escalates, demands engagement
  | "withdrawer"     // Shuts down, avoids
  | "validator"      // Stays calm, seeks compromise
  | "volatile"       // Intense but passionate resolution
  | "conflict-avoidant"; // Sidesteps disagreement entirely

export interface ConflictProfile {
  primaryPattern: ConflictPattern;
  /** Gottman's Four Horsemen — how much each shows up (0-1) */
  horsemen: {
    criticism: number;
    contempt: number;
    defensiveness: number;
    stonewalling: number;
  };
  /** How effectively they initiate and receive repair attempts */
  repairCapacity: number; // 0-1
  /** What topics tend to trigger conflict */
  triggerThemes: string[];
}

// ─── Emotional Expression ───────────────────────────────────────────────────

export interface EmotionalProfile {
  /** How readily they share vulnerable feelings */
  opennessToVulnerability: number; // 0-1
  /** Range and specificity of emotional language */
  vocabularyDepth: "limited" | "moderate" | "rich";
  /** Comfort with their own emotions vs. intellectualizing */
  processingStyle: "cognitive" | "somatic" | "expressive" | "reflective";
  /** How they tend to regulate difficult emotions */
  regulationStrategy: "self-soothing" | "co-regulation" | "suppression" | "expression";
}

// ─── Values & Meaning ───────────────────────────────────────────────────────

export interface ValuesProfile {
  /** Top 3-5 core values identified from responses */
  coreValues: string[];
  /** How much growth/change vs. stability/security they seek */
  growthOrientation: number; // 0-1 (0=stability-seeking, 1=growth-seeking)
  /** Individual vs. shared identity emphasis */
  autonomyInterdependence: number; // 0-1 (0=highly autonomous, 1=highly merged)
}

// ─── Intimacy Profile ───────────────────────────────────────────────────────

export interface IntimacyProfile {
  /** Comfort level with emotional vulnerability */
  emotionalComfort: number; // 0-1
  /** Comfort level with physical intimacy discussion/expression */
  physicalComfort: number; // 0-1
  /** Preference for novelty vs. familiar comfort */
  noveltyPreference: number; // 0-1
  /** How quickly they're comfortable going deeper */
  progressionRate: "cautious" | "moderate" | "eager";
}

// ─── Discovery Day Arc ──────────────────────────────────────────────────────

export type DiscoveryPhase =
  | "rhythm"       // Days 1-3: Light, broad, mapping the landscape
  | "deepening"    // Days 4-6: Emotional intimacy, attachment signals
  | "navigating"   // Days 7-9: Conflict, love language confirmation
  | "layers"       // Days 10-12: Vulnerability, intimacy boundaries
  | "mirror";      // Days 13-14: Reflection, narrative delivery

export interface DiscoveryProgress {
  /** Current day (1-14) in the discovery arc */
  currentDay: number;
  /** Current phase based on day */
  currentPhase: DiscoveryPhase;
  /** Which dimensions have enough signal to score */
  dimensionsRevealed: PersonalityDimension[];
  /** Total responses analyzed */
  responsesAnalyzed: number;
  /** Whether the Day 14 mirror narrative has been delivered */
  mirrorDelivered: boolean;
  /** When the discovery period started */
  startedAt: string;
}

export type PersonalityDimension =
  | "attachment"
  | "loveLanguage"
  | "conflict"
  | "emotionalExpression"
  | "values"
  | "intimacy"
  | "relationalIdentity";

// ─── Dimension Observation ──────────────────────────────────────────────────

/** A single signal extracted from a user response */
export interface PersonalitySignal {
  /** Which dimension this signal informs */
  dimension: PersonalityDimension;
  /** The modality of the question that produced this signal */
  sourceModality: PsychologyModality;
  /** AI-extracted insight from the response */
  observation: string;
  /** How strongly this signal indicates a particular trait (0-1) */
  strength: number;
  /** The specific trait or value this signal points toward */
  indicator: string;
  /** When this signal was captured */
  capturedAt: string;
  /** The day in the discovery arc (1-14) */
  discoveryDay: number;
}

// ─── Confidence Tracking ────────────────────────────────────────────────────

export interface DimensionConfidence {
  dimension: PersonalityDimension;
  /** How confident the system is in its assessment (0-1) */
  confidence: number;
  /** Number of signals contributing to this dimension */
  signalCount: number;
  /** Whether enough data exists for a meaningful score */
  isReliable: boolean;
}

// ─── Complete Personality Profile ───────────────────────────────────────────

export interface PersonalityProfile {
  userId: string;
  /** When this profile was first created */
  createdAt: string;
  /** Last time the profile was updated from new signals */
  updatedAt: string;

  // ── The 7 Dimensions ──
  attachment: AttachmentSignals;
  attachmentStyle: AttachmentStyle;
  loveLanguages: LoveLanguageProfile;
  conflict: ConflictProfile;
  emotional: EmotionalProfile;
  values: ValuesProfile;
  intimacy: IntimacyProfile;

  // ── Discovery Metadata ──
  discovery: DiscoveryProgress;
  confidence: DimensionConfidence[];
  /** All raw signals collected */
  signals: PersonalitySignal[];

  // ── Couple-Level Insights (populated when partner also has profile) ──
  coupleInsights?: CoupleInsights;
}

// ─── Couple-Level Analysis ──────────────────────────────────────────────────

export interface CoupleInsights {
  /** Areas where both partners align strongly */
  sharedStrengths: string[];
  /** Areas where they differ — framed as growth opportunities, not problems */
  growthEdges: string[];
  /** Specific dynamic patterns (e.g., "pursue-withdraw in conflict") */
  dynamicPatterns: string[];
  /** Recommended modalities based on both profiles */
  recommendedModalities: PsychologyModality[];
  /** Recommended journey IDs based on couple profile */
  recommendedJourneys: string[];
}

// ─── Profile Builder Context (passed to AI calls) ──────────────────────────

/** A lightweight summary of the profile for including in AI prompts */
export interface ProfileContext {
  userName: string;
  partnerName?: string;
  relationshipStructure?: string;
  discoveryDay: number;
  discoveryPhase: DiscoveryPhase;
  /** Natural language summary of what's known so far */
  knownTraits: string;
  /** What dimensions still need more signal */
  uncertainDimensions: PersonalityDimension[];
  /** The user's demonstrated comfort with vulnerability (0-1) */
  comfortLevel: number;
  /** Modalities that resonate with this user */
  preferredModalities: PsychologyModality[];
  /** Topics/themes to avoid or approach gently */
  sensitivities: string[];
}

// ─── Response Analysis Request ──────────────────────────────────────────────

/** What we send to the AI for personality signal extraction */
export interface ResponseAnalysisInput {
  questionText: string;
  questionModality: PsychologyModality;
  questionCategory: string;
  questionIntimacyLevel: number;
  userResponse: string;
  discoveryDay: number;
  existingProfile: Partial<PersonalityProfile>;
}

/** What the AI returns after analyzing a response */
export interface ResponseAnalysisOutput {
  signals: PersonalitySignal[];
  /** Updated confidence scores for affected dimensions */
  confidenceUpdates: DimensionConfidence[];
  /** Any notable observations for the memory system */
  memoryNotes: string[];
}

// ─── Question Generation Request ────────────────────────────────────────────

/** What we send to the AI to generate the next question */
export interface QuestionGenerationInput {
  profileContext: ProfileContext;
  discoveryDay: number;
  discoveryPhase: DiscoveryPhase;
  /** Dimensions that need more signal, ranked by priority */
  targetDimensions: PersonalityDimension[];
  /** Questions already asked (to avoid repetition) */
  previousQuestionIds: string[];
  /** Time of day for appropriate tone */
  timeSlot: "AM" | "PM";
  /** Number of questions to generate */
  count: number;
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  /** Which dimension(s) this question is designed to reveal */
  targetDimensions: PersonalityDimension[];
  /** The modality framing this question */
  modality: PsychologyModality;
  category: string;
  intimacyLevel: 1 | 2 | 3 | 4 | 5;
  /** Why this question was chosen (internal — not shown to user) */
  rationale: string;
}

// ─── Mirror Narrative ───────────────────────────────────────────────────────

/** The Day 14 "we see you" moment */
export interface MirrorNarrative {
  /** Warm, personal narrative about who they are as a couple */
  narrative: string;
  /** Individual dimension summaries in approachable language */
  dimensionSummaries: {
    dimension: PersonalityDimension;
    title: string;
    description: string;
    /** Framed as strength, not diagnosis */
    strengthFrame: string;
  }[];
  /** Recommended next steps / journeys based on profile */
  recommendations: {
    journeyId: string;
    reason: string;
  }[];
  /** A single "headline" insight about the couple */
  coreInsight: string;
}

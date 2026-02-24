import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PersonalityInferenceService } from "@/services/personalityInferenceService";
import { PersonalityProfileService } from "@/services/personalityProfileService";
import { DiscoveryQuestionService } from "@/services/discoveryQuestionService";
import { MirrorNarrativeService } from "@/services/mirrorNarrativeService";
import type {
  PersonalityProfile,
  ProfileContext,
  GeneratedQuestion,
  MirrorNarrative,
  ResponseAnalysisInput,
  DiscoveryPhase,
  PersonalityDimension,
} from "@/types/personality";
import type { PsychologyModality } from "@/types/quiz";

interface UsePersonalityDiscoveryReturn {
  /** The current personality profile (null during loading or before first response) */
  profile: PersonalityProfile | null;
  /** Current day in the 14-day discovery arc */
  discoveryDay: number;
  /** Current phase (rhythm, deepening, navigating, layers, mirror) */
  discoveryPhase: DiscoveryPhase;
  /** Whether the system is currently analyzing a response */
  isAnalyzing: boolean;
  /** Whether questions are currently being generated */
  isGenerating: boolean;
  /** Today's generated questions */
  dailyQuestions: GeneratedQuestion[];
  /** The Day 14 mirror narrative (null until generated) */
  mirrorNarrative: MirrorNarrative | null;
  /** Whether the mirror has been delivered to this user */
  mirrorReady: boolean;
  /** Submit a response for personality analysis */
  submitResponse: (
    questionText: string,
    questionModality: PsychologyModality,
    questionCategory: string,
    questionIntimacyLevel: number,
    userResponse: string
  ) => Promise<void>;
  /** Generate today's personalized questions */
  generateQuestions: (timeSlot: "AM" | "PM", count?: number) => Promise<void>;
  /** Generate the mirror narrative (call on Day 13-14) */
  generateMirror: () => Promise<void>;
  /** Get the lightweight profile context for other AI calls */
  getProfileContext: () => Promise<ProfileContext>;
  /** How many dimensions have been reliably identified */
  dimensionsRevealed: number;
  /** Total dimensions being tracked */
  totalDimensions: number;
}

/**
 * usePersonalityDiscovery
 *
 * React hook that orchestrates the 14-day personality discovery system.
 * Connects the inference engine, profile builder, question generator,
 * and mirror narrative service into a single interface for UI components.
 *
 * Usage:
 * ```tsx
 * const {
 *   profile, discoveryDay, dailyQuestions,
 *   submitResponse, generateQuestions, mirrorNarrative
 * } = usePersonalityDiscovery();
 * ```
 */
export function usePersonalityDiscovery(): UsePersonalityDiscoveryReturn {
  const { user, profile: authProfile } = useAuth();

  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dailyQuestions, setDailyQuestions] = useState<GeneratedQuestion[]>([]);
  const [mirrorNarrative, setMirrorNarrative] = useState<MirrorNarrative | null>(null);

  // Track which questions have been asked to avoid repetition
  const askedQuestionIds = useRef<string[]>([]);

  // Service instances
  const inferenceService = PersonalityInferenceService.getInstance();
  const profileService = PersonalityProfileService.getInstance();
  const questionService = DiscoveryQuestionService.getInstance();
  const mirrorService = MirrorNarrativeService.getInstance();

  // Initialize profile service when user authenticates
  useEffect(() => {
    if (user?.id) {
      profileService.initialize(user.id).then(async () => {
        const existing = await profileService.getProfile();
        if (existing) {
          setPersonalityProfile(existing);
        }
      });
    }
  }, [user?.id]);

  // ─── Submit Response for Analysis ─────────────────────────────────────

  const submitResponse = useCallback(
    async (
      questionText: string,
      questionModality: PsychologyModality,
      questionCategory: string,
      questionIntimacyLevel: number,
      userResponse: string
    ) => {
      if (!user?.id || !personalityProfile) return;

      setIsAnalyzing(true);

      try {
        const input: ResponseAnalysisInput = {
          questionText,
          questionModality,
          questionCategory,
          questionIntimacyLevel,
          userResponse,
          discoveryDay: personalityProfile.discovery.currentDay,
          existingProfile: personalityProfile,
        };

        // Run inference
        const { signals, confidenceUpdates, memoryNotes } =
          await inferenceService.analyzeResponse(input);

        // Ingest signals into profile
        const updatedProfile = await profileService.ingestSignals(
          signals,
          confidenceUpdates,
          memoryNotes
        );

        setPersonalityProfile(updatedProfile);
      } catch (error) {
        console.error("Failed to analyze response:", error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [user?.id, personalityProfile]
  );

  // ─── Generate Questions ───────────────────────────────────────────────

  const generateQuestions = useCallback(
    async (timeSlot: "AM" | "PM", count: number = 2) => {
      if (!user?.id) return;

      setIsGenerating(true);

      try {
        const context = await getProfileContext();
        const phase = personalityProfile?.discovery.currentPhase || "rhythm";
        const uncertainDimensions = context.uncertainDimensions;
        const targetDimensions = DiscoveryQuestionService.getDimensionPriority(
          phase,
          uncertainDimensions
        );

        const questions = await questionService.generateDailyQuestions({
          profileContext: context,
          discoveryDay: personalityProfile?.discovery.currentDay || 1,
          discoveryPhase: phase,
          targetDimensions,
          previousQuestionIds: askedQuestionIds.current,
          timeSlot,
          count,
        });

        // Track asked questions
        askedQuestionIds.current = [
          ...askedQuestionIds.current,
          ...questions.map((q) => q.id),
        ];

        setDailyQuestions(questions);
      } catch (error) {
        console.error("Failed to generate questions:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    [user?.id, personalityProfile]
  );

  // ─── Generate Mirror Narrative ────────────────────────────────────────

  const generateMirror = useCallback(async () => {
    if (!personalityProfile) return;

    try {
      const userName = authProfile?.full_name || "there";
      const partnerName = authProfile?.partner_name;

      const narrative = await mirrorService.generateNarrative(
        personalityProfile,
        userName,
        partnerName
      );

      setMirrorNarrative(narrative);
    } catch (error) {
      console.error("Failed to generate mirror narrative:", error);
    }
  }, [personalityProfile, authProfile]);

  // ─── Profile Context ──────────────────────────────────────────────────

  const getProfileContext = useCallback(async (): Promise<ProfileContext> => {
    const userName = authProfile?.full_name || "there";
    const partnerName = authProfile?.partner_name;
    const relationshipStructure = authProfile?.relationship_structure;

    return profileService.buildProfileContext(userName, partnerName, relationshipStructure);
  }, [authProfile]);

  // ─── Derived State ────────────────────────────────────────────────────

  const discoveryDay = personalityProfile?.discovery.currentDay || 1;
  const discoveryPhase = personalityProfile?.discovery.currentPhase || "rhythm";
  const dimensionsRevealed = personalityProfile?.discovery.dimensionsRevealed.length || 0;
  const mirrorReady = discoveryDay >= 13 && dimensionsRevealed >= 4;

  return {
    profile: personalityProfile,
    discoveryDay,
    discoveryPhase,
    isAnalyzing,
    isGenerating,
    dailyQuestions,
    mirrorNarrative,
    mirrorReady,
    submitResponse,
    generateQuestions,
    generateMirror,
    getProfileContext,
    dimensionsRevealed,
    totalDimensions: 7,
  };
}

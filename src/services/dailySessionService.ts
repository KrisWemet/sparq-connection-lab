/**
 * Daily Session Service
 *
 * CORE orchestrator for the Learn → Implement → Reflect daily session system.
 * Generates complete daily sessions by coordinating:
 * - AI model service for Learn step generation
 * - Archetype configs for personalized greeting/celebration
 * - Micro-action template library for Implement step
 * - Personality profile for contextual personalization
 *
 * This is a singleton service. Use DailySessionService.getInstance() to access.
 */

import { AIModelService } from "@/services/aiModelService";
import {
  getArchetypeConfig,
  getGreeting,
  getCelebration,
  getLearnIntro,
} from "@/config/archetypes";
import { selectTemplate, getTemplatesForDay } from "@/data/microActions";
import type { MicroActionTemplate } from "@/data/microActions";
import type {
  DailySession,
  SessionGenerationInput,
  LearnStep,
  ImplementStep,
  ReflectStep,
  YesterdayCheckIn,
  SessionGreeting,
  CelebrationMessage,
  PersonalizedMicroAction,
  CheckInResponseId,
  SessionQuestion,
  MCOption,
  QuestionFormat,
  PHASE_FORMAT_PREFERENCES,
} from "@/types/session";
import type { DiscoveryPhase, PersonalityDimension } from "@/types/personality";
import type { PsychologyModality } from "@/types/quiz";
import { generateId } from "@/lib/utils";

// ============================================================================
// SERVICE
// ============================================================================

export class DailySessionService {
  private static instance: DailySessionService;

  private constructor() {}

  static getInstance(): DailySessionService {
    if (!DailySessionService.instance) {
      DailySessionService.instance = new DailySessionService();
    }
    return DailySessionService.instance;
  }

  /**
   * Generate a complete daily session for a user.
   * This is the main entry point for session generation.
   *
   * Flow:
   * 1. Build greeting from archetype config
   * 2. Build yesterday check-in if day > 1 and yesterdayAction exists
   * 3. Generate Learn step via AI (the big call)
   * 4. Build Implement step from micro-action template library
   * 5. Build Reflect step
   * 6. Build celebration message
   * 7. Return complete DailySession object
   */
  async generateSession(input: SessionGenerationInput): Promise<DailySession> {
    const greeting = this.buildGreeting(input);

    const yesterdayCheckIn =
      input.discoveryDay > 1 && input.yesterdayAction
        ? this.buildYesterdayCheckIn(
            input.yesterdayAction,
            input.identityArchetype
          )
        : undefined;

    const learn = await this.generateLearnStep(input);
    const implement = this.buildImplementStep(input);
    const reflect = this.buildReflectStep(input);
    const celebration = this.buildCelebration(input);

    const session: DailySession = {
      id: generateId(12),
      userId: input.userId,
      dayNumber: input.discoveryDay,
      phase: input.discoveryPhase,
      createdAt: new Date().toISOString(),
      greeting,
      yesterdayCheckIn,
      learn,
      implement,
      reflect,
      celebration,
    };

    return session;
  }

  // ==========================================================================
  // GREETING
  // ==========================================================================

  /**
   * Build the session greeting personalized to the user's archetype.
   */
  private buildGreeting(input: SessionGenerationInput): SessionGreeting {
    const text = getGreeting(input.identityArchetype, input.userName);

    const subtitle =
      input.discoveryDay <= 14
        ? `Day ${input.discoveryDay} of your journey`
        : `Session ${input.discoveryDay - 14}`;

    return { text, subtitle };
  }

  // ==========================================================================
  // YESTERDAY CHECK-IN
  // ==========================================================================

  /**
   * Build the yesterday check-in flow for Day 2+.
   * Shows the micro-action they committed to and asks how it went.
   */
  private buildYesterdayCheckIn(
    yesterdayAction: string,
    archetype: string
  ): YesterdayCheckIn {
    return {
      actionReminder: `Yesterday you planned to: "${yesterdayAction}"`,
      options: [
        { id: "loved-it", text: "Tried it and it felt great", emoji: "✨" },
        {
          id: "felt-awkward",
          text: "Tried it, felt a bit awkward",
          emoji: "😅",
        },
        { id: "didnt-try", text: "Didn't get to it", emoji: "🤷" },
        { id: "modified-it", text: "Did my own version of it", emoji: "🔄" },
      ],
      acknowledgments: {
        "loved-it":
          "That's wonderful! Those moments of intentional action really add up.",
        "felt-awkward":
          "That's completely normal — growth always feels a bit uncomfortable at first. The fact that you tried matters.",
        "didnt-try":
          "No judgment at all. Every day is a fresh start. Let's focus on today.",
        "modified-it":
          "Love that you made it your own. That shows real self-awareness.",
      },
    };
  }

  // ==========================================================================
  // LEARN STEP (AI-POWERED)
  // ==========================================================================

  /**
   * Generate the Learn step via AI.
   * This is the core AI call that creates a personalized question.
   *
   * The AI generates:
   * - A question in the selected format (MC, open-ended, scale, ranking)
   * - An insight intro ("Today we're exploring...")
   * - A micro-insight to show after the user answers
   * - Reflection prompt for later
   */
  private async generateLearnStep(
    input: SessionGenerationInput
  ): Promise<LearnStep> {
    const archetype = getArchetypeConfig(input.identityArchetype);
    const questionFormat = this.pickQuestionFormat(input.formatPreferences);

    // Build the system prompt
    const systemPrompt = `You are a warm, knowledgeable relationship coach creating a daily session for someone working on their relationship. You speak like a trusted friend who happens to know psychology.

This user identifies as a "${archetype.label}" — ${archetype.contentFraming.insightStyle}

Their question tone preference: ${archetype.contentFraming.questionTone}

IMPORTANT RULES:
- This is a SOLO-FIRST app. Frame everything as "making me a better me for us"
- Questions should feel like connection exercises, NOT personality tests
- Use warm, conversational language — no clinical terms
- NEVER sound like an assessment or quiz
- Match the intimacy level to their comfort (currently Day ${input.discoveryDay})`;

    // Build the user prompt
    const userPrompt = `Generate a personalized daily session question for ${input.userName}.

CONTEXT:
- Discovery Day: ${input.discoveryDay}
- Phase: ${input.discoveryPhase}
- Onboarding Goals: ${input.onboardingGoals.join(", ")}
- Profile Context: ${input.profileContextSummary}
- Relationship Mode: ${input.relationshipMode}
${input.partnerName ? `- Partner Name: ${input.partnerName}` : ""}

QUESTION FORMAT: ${questionFormat}

${
  questionFormat === "multiple-choice"
    ? `For multiple-choice questions, provide 3-4 options. Each option should have signalHints that map to personality dimensions:
{
  "id": "option-1",
  "text": "Option text here",
  "signalHints": [
    {
      "dimension": "attachment",
      "indicator": "secure-base-seeking",
      "strength": 0.7
    }
  ]
}`
    : ""
}

${
  questionFormat === "scale"
    ? `For scale questions, provide:
- scaleMin: 1
- scaleMax: 5
- scaleLabels: ["Not at all", "Very much"]`
    : ""
}

${
  questionFormat === "ranking"
    ? `For ranking questions, provide 4-5 items to rank in order of importance/preference.`
    : ""
}

RESPOND IN JSON FORMAT:
{
  "questionText": "The actual question for the user",
  "format": "${questionFormat}",
  ${questionFormat === "multiple-choice" ? '"options": [/* array of option objects with signalHints */],' : ""}
  ${questionFormat === "scale" ? '"scaleMin": 1, "scaleMax": 5, "scaleLabels": ["label1", "label2"],' : ""}
  ${questionFormat === "ranking" ? '"rankingItems": ["item1", "item2", "item3", "item4"],' : ""}
  "targetDimensions": ["dimension1", "dimension2"],
  "intimacyLevel": 1-5,
  "modality": "gottman" | "attachment" | "eft" | "cbt" | "loveLanguages" | "nvc" | "mindfulness",
  "insight": "Brief intro before the question",
  "microInsight": "Shown AFTER they answer",
  "reflectionPrompt": "Evening reflection prompt"
}`;

    try {
      const response = await AIModelService.getInstance().complete({
        taskType: "daily-session",
        systemPrompt,
        userPrompt,
        jsonMode: true,
        temperature: 0.7,
      });

      // Parse the JSON response
      const parsed = JSON.parse(response.content);

      // Build the question object
      const question: SessionQuestion = {
        id: generateId(8),
        text: parsed.questionText,
        format: parsed.format,
        targetDimensions: parsed.targetDimensions,
        intimacyLevel: parsed.intimacyLevel,
        modality: parsed.modality,
      };

      // Add format-specific fields
      if (parsed.format === "multiple-choice" && parsed.options) {
        question.options = parsed.options;
      }
      if (parsed.format === "scale") {
        question.scaleMin = parsed.scaleMin || 1;
        question.scaleMax = parsed.scaleMax || 5;
        question.scaleLabels = parsed.scaleLabels;
      }
      if (parsed.format === "ranking" && parsed.rankingItems) {
        question.rankingItems = parsed.rankingItems;
      }

      return {
        question,
        insight: parsed.insight,
        microInsight: parsed.microInsight,
        modality: parsed.modality,
      };
    } catch (error) {
      console.error("AI Learn step generation failed:", error);
      return this.buildFallbackLearnStep(input);
    }
  }

  /**
   * Fallback Learn step if AI fails.
   * Returns a simple open-ended question appropriate for the phase.
   */
  private buildFallbackLearnStep(
    input: SessionGenerationInput
  ): LearnStep {
    const phaseQuestions: Record<string, any> = {
      "self-awareness": {
        text: "What's one thing that always makes you feel connected to the people you love?",
        modality: "attachment" as PsychologyModality,
        targetDimensions: ["attachment", "emotionalExpression"],
        intimacyLevel: 2,
      },
      rhythm: {
        text: "What's one thing that always makes you feel connected to the people you love?",
        modality: "attachment" as PsychologyModality,
        targetDimensions: ["attachment", "emotionalExpression"],
        intimacyLevel: 2,
      },
      "behavior-change": {
        text: "When you've had a difficult day, what does support look like for you?",
        modality: "eft" as PsychologyModality,
        targetDimensions: ["attachment", "loveLanguage"],
        intimacyLevel: 3,
      },
      deepening: {
        text: "When you've had a difficult day, what does support look like for you?",
        modality: "eft" as PsychologyModality,
        targetDimensions: ["attachment", "loveLanguage"],
        intimacyLevel: 3,
      },
      "skill-building": {
        text: "Think of a recent disagreement — what would you do differently if you could replay it?",
        modality: "gottman" as PsychologyModality,
        targetDimensions: ["conflict", "emotionalExpression"],
        intimacyLevel: 3,
      },
      navigating: {
        text: "Think of a recent disagreement — what would you do differently if you could replay it?",
        modality: "gottman" as PsychologyModality,
        targetDimensions: ["conflict", "emotionalExpression"],
        intimacyLevel: 3,
      },
      integration: {
        text: "What part of yourself are you most proud of in how you show up in relationships?",
        modality: "narrative" as PsychologyModality,
        targetDimensions: ["relationalIdentity", "values"],
        intimacyLevel: 4,
      },
      layers: {
        text: "What part of yourself are you most proud of in how you show up in relationships?",
        modality: "narrative" as PsychologyModality,
        targetDimensions: ["relationalIdentity", "values"],
        intimacyLevel: 4,
      },
      mirror: {
        text: "What part of yourself are you most proud of in how you show up in relationships?",
        modality: "narrative" as PsychologyModality,
        targetDimensions: ["relationalIdentity", "values"],
        intimacyLevel: 4,
      },
    };

    const fallbackData =
      phaseQuestions[input.discoveryPhase] || phaseQuestions["self-awareness"];

    const question: SessionQuestion = {
      id: generateId(8),
      text: fallbackData.text,
      format: "open-ended",
      targetDimensions: fallbackData.targetDimensions,
      intimacyLevel: fallbackData.intimacyLevel,
      modality: fallbackData.modality,
    };

    return {
      question,
      insight: getLearnIntro(input.identityArchetype),
      microInsight: "Thank you for sharing that. Your answer helps us understand you better.",
      modality: fallbackData.modality,
    };
  }

  // ==========================================================================
  // IMPLEMENT STEP (MICRO-ACTION)
  // ==========================================================================

  /**
   * Build the Implement step by selecting and personalizing a micro-action.
   * Uses the template library and archetype preferences.
   */
  private buildImplementStep(input: SessionGenerationInput): ImplementStep {
    const archetype = getArchetypeConfig(input.identityArchetype);

    // Select primary micro-action
    const primaryTemplate = selectTemplate(
      input.discoveryDay,
      archetype.microActionPreferences.preferredCategories,
      input.previousQuestionIds,
      input.relationshipMode
    );

    if (!primaryTemplate) {
      // Fallback if no template found
      return {
        microAction: this.buildFallbackMicroAction(input),
      };
    }

    const primaryAction = this.personalizeMicroAction(
      primaryTemplate,
      input
    );

    // Select alternative micro-action
    const alternativeTemplate = selectTemplate(
      input.discoveryDay,
      archetype.microActionPreferences.preferredCategories,
      [...input.previousQuestionIds, primaryTemplate.id],
      input.relationshipMode
    );

    const alternative = alternativeTemplate
      ? this.personalizeMicroAction(alternativeTemplate, input)
      : undefined;

    return {
      microAction: primaryAction,
      alternative,
    };
  }

  /**
   * Personalize a micro-action template for the user.
   */
  private personalizeMicroAction(
    template: MicroActionTemplate,
    input: SessionGenerationInput
  ): PersonalizedMicroAction {
    const archetype = getArchetypeConfig(input.identityArchetype);

    // Choose base text based on relationship mode
    let baseText =
      input.relationshipMode === "solo"
        ? template.soloVersion
        : template.partnerVersion;

    // Check for archetype-specific variant
    if (
      template.archetypeVariants &&
      template.archetypeVariants[input.identityArchetype]
    ) {
      baseText = template.archetypeVariants[input.identityArchetype]!;
    }

    // Do basic substitutions
    let personalizedText = baseText.replace(
      /{partner}/g,
      input.partnerName || "your partner"
    );
    personalizedText = personalizedText.replace(/{name}/g, input.userName);

    // TODO: For premium users, could call AI to further personalize
    // For now, just do template substitution

    return {
      templateId: template.id,
      baseText: template.text,
      personalizedText,
      category: template.category,
      difficulty: template.difficulty,
      estimatedMinutes: template.estimatedMinutes,
      soloFriendly: input.relationshipMode === "solo",
    };
  }

  /**
   * Fallback micro-action if template selection fails.
   */
  private buildFallbackMicroAction(
    input: SessionGenerationInput
  ): PersonalizedMicroAction {
    const text =
      input.relationshipMode === "solo"
        ? "Take 3 minutes to write down one thing you appreciate about yourself in relationships"
        : `Tell ${input.partnerName || "your partner"} one specific thing you appreciate about them`;

    return {
      templateId: "fallback-1",
      baseText: text,
      personalizedText: text,
      category: "awareness",
      difficulty: 1,
      estimatedMinutes: 3,
      soloFriendly: true,
    };
  }

  // ==========================================================================
  // REFLECT STEP
  // ==========================================================================

  /**
   * Build the Reflect step.
   * This is typically an evening prompt to help integrate the day's learning.
   */
  private buildReflectStep(input: SessionGenerationInput): ReflectStep {
    const archetype = getArchetypeConfig(input.identityArchetype);

    // Reflection prompts based on archetype style
    const reflectionPrompts: Record<string, string[]> = {
      "calm-anchor": [
        "As you wind down tonight, notice: What moment today made you feel most grounded?",
        "Before bed, reflect: When did you bring calm to a situation today?",
        "Tonight, gently observe: What helped you stay centered today?",
      ],
      "compassionate-listener": [
        "Tonight, check in with yourself: What did you learn about someone today?",
        "Before sleep, reflect: When did you truly listen today?",
        "As you wind down, notice: What emotion did you attune to today?",
      ],
      "growth-seeker": [
        "Tonight, track your progress: What did you do differently today?",
        "Before bed, reflect: What did you discover about yourself today?",
        "As you wind down, notice: What growth edge did you touch today?",
      ],
      "connection-builder": [
        "Tonight, appreciate: What moment of connection did you create today?",
        "Before sleep, reflect: When did you feel closest to someone today?",
        "As you wind down, notice: What bridge did you build today?",
      ],
    };

    const prompts =
      reflectionPrompts[input.identityArchetype] ||
      reflectionPrompts["calm-anchor"];
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];

    return {
      prompt,
      format: "open-ended",
      relatedToLearn: true,
    };
  }

  // ==========================================================================
  // CELEBRATION
  // ==========================================================================

  /**
   * Build the celebration message shown when the user completes the session.
   */
  private buildCelebration(
    input: SessionGenerationInput
  ): CelebrationMessage {
    const text = getCelebration(input.identityArchetype, input.userName);

    const archetype = getArchetypeConfig(input.identityArchetype);
    const encouragement =
      archetype.celebrationMessages.sessionComplete[
        Math.floor(
          Math.random() *
            archetype.celebrationMessages.sessionComplete.length
        )
      ].replace("{name}", input.userName);

    return {
      text,
      encouragement,
      showStreak: input.discoveryDay >= 3,
      streakCount: input.discoveryDay,
    };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Pick a question format based on weighted preferences.
   * Uses random selection weighted by the percentage preferences.
   */
  private pickQuestionFormat(preferences: {
    multipleChoice: number;
    openEnded: number;
    scale: number;
    ranking: number;
  }): QuestionFormat {
    const random = Math.random() * 100;

    let cumulative = 0;
    cumulative += preferences.multipleChoice;
    if (random < cumulative) return "multiple-choice";

    cumulative += preferences.openEnded;
    if (random < cumulative) return "open-ended";

    cumulative += preferences.scale;
    if (random < cumulative) return "scale";

    return "ranking";
  }
}

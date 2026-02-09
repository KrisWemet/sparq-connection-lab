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
import {
  selectTechniqueForContext,
  getTechniquesForPhase,
  getPrimingMessage,
  getTherapeuticPattern,
  THERAPEUTIC_LANGUAGE_PATTERNS,
  ANCHORING_LABELS,
} from "@/config/psychologyFramework";
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
   * Psychology: Priming effect — the greeting sets the emotional frame for the session.
   * The priming message subtly orients the user toward the phase's emotional work.
   */
  private buildGreeting(input: SessionGenerationInput): SessionGreeting {
    const text = getGreeting(input.identityArchetype, input.userName);

    // Phase-aware priming as subtitle
    const primingMessage = getPrimingMessage(input.discoveryPhase);
    const dayLabel =
      input.discoveryDay <= 14
        ? `Day ${input.discoveryDay}`
        : `Session ${input.discoveryDay - 14}`;

    return { text, subtitle: `${dayLabel} · ${primingMessage}` };
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

    // Select a psychology technique appropriate for this phase and step
    const technique = selectTechniqueForContext(input.discoveryPhase, "learn");
    const insightTechnique = selectTechniqueForContext(input.discoveryPhase, "insight");

    // Build psychology-enriched system prompt
    const systemPrompt = `You are a warm, knowledgeable relationship coach creating a daily session for someone working on their personal growth. You speak like a trusted friend who deeply understands psychology — and you USE that knowledge to create genuinely transformative experiences.

This user identifies as a "${archetype.label}" — ${archetype.contentFraming.insightStyle}

Their question tone preference: ${archetype.contentFraming.questionTone}

PSYCHOLOGY FRAMEWORK FOR THIS SESSION:
${technique ? `Primary technique: ${technique.name} (${technique.framework})
How to apply: ${technique.promptInstruction}` : "Use general positive psychology framing."}

THERAPEUTIC LANGUAGE PATTERNS — use these naturally (not formulaically):
- Presuppositions: Use "When you notice..." and "As you continue..." (assumes positive change is happening)
- Validation first: Always acknowledge the feeling before inviting growth
- Growth mindset: Frame abilities as developable ("This is something you're building...")
- Reframing: Help users see challenges as information, not failure
- Solution-focused: Orient toward what's working, not what's broken
- Externalization: "When anxiety shows up..." (the problem is the problem, not the person)

MICRO-INSIGHT PSYCHOLOGY (this is the PEAK moment of the session):
${insightTechnique ? `Use ${insightTechnique.name}: ${insightTechnique.promptInstruction}` : "Frame as warm validation + growth observation."}
The micro-insight should:
1. VALIDATE what they shared ("The way you described X shows...")
2. REFRAME it as a strength ("That's actually a sign of...")
3. CONNECT it to growth ("As you continue to notice this...")

IMPORTANT RULES:
- This is a SOLO-FIRST app. Frame everything as "making me a better me for us"
- Questions should feel like connection exercises, NOT personality tests
- Use warm, conversational language — no clinical jargon
- NEVER sound like an assessment or quiz
- Match the intimacy level to their comfort (currently Day ${input.discoveryDay})
- Use the user's actual life context, not generic examples`;

    // Build psychology-enriched user prompt
    const scaleAnchoring = questionFormat === "scale"
      ? this.getScaleAnchoring(input.discoveryPhase)
      : null;

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
    ? `For multiple-choice questions, provide 3-4 options. Frame options as "which resonates most?" — never right/wrong. Each option should feel like a genuine reflection of a different way of being. Include signalHints for personality dimension mapping:
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
    ? `For scale questions, use GROWTH-ORIENTED anchoring labels that frame the low end as "still developing" (not failure) and the high end as "comes naturally" (not perfect):
- scaleMin: 1
- scaleMax: 5
- scaleLabels: ${scaleAnchoring ? JSON.stringify(scaleAnchoring) : '["Still growing into this", "This comes naturally to me"]'}
The labels should prime self-compassion: wherever they land is valid.`
    : ""
}

${
  questionFormat === "ranking"
    ? `For ranking questions, provide 4-5 items to rank in order of importance/preference. Frame it as "What matters most to you?" — no wrong order.`
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
  "modality": "gottman" | "attachment" | "eft" | "cbt" | "loveLanguages" | "nvc" | "mindfulness" | "narrative" | "positive-psychology",
  "insight": "Brief intro before the question (use presuppositional language)",
  "microInsight": "Shown AFTER they answer — validate + reframe + connect to growth",
  "reflectionPrompt": "Evening reflection prompt using archetype-specific language"
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
   * Build the Reflect step with psychology-informed prompts.
   *
   * Psychology techniques applied:
   * - Archetype-specific framing (keeps the user in their identity)
   * - Phase-appropriate depth (CBT thought records in navigating, gratitude in rhythm)
   * - Presuppositional language ("As you notice..." assumes they will)
   * - Body-based awareness prompts (where do you feel it?)
   * - Narrative therapy reauthoring (later phases)
   */
  private buildReflectStep(input: SessionGenerationInput): ReflectStep {
    const reflectTechnique = selectTechniqueForContext(input.discoveryPhase, "reflect");

    // Archetype × Phase reflection matrix — deeper than static prompts
    const reflectionPrompts: Record<string, Record<string, string[]>> = {
      "calm-anchor": {
        rhythm: [
          "As you wind down tonight, notice: What moment today made you feel most grounded?",
          "Before bed, take three slow breaths and notice where calm lives in your body right now.",
          "Tonight, gently observe: What one thing anchored you today?",
        ],
        deepening: [
          "As you settle in tonight, notice: What emotion surprised you today? Where did you feel it in your body?",
          "Before sleep, reflect: When did your steadiness create safety for someone else today?",
          "Tonight, sit with this: What feeling did you notice but choose not to react to today?",
        ],
        navigating: [
          "Tonight, reflect: When tension arose today, what helped you stay grounded instead of reactive?",
          "Before bed, notice: What was the thought that came before the feeling? (Situation → Thought → Feeling → Response)",
          "As you wind down: If you could replay one moment today with even more calm, what would you do differently?",
        ],
        layers: [
          "Tonight, go deeper: What part of your steadiness are you most proud of? What does it cost you?",
          "Before sleep, notice: When do you use calm as a strength, and when might it be a shield?",
          "As you wind down: What would it look like to be both grounded AND fully vulnerable?",
        ],
        mirror: [
          "Tonight, celebrate: How has your sense of calm evolved over these past days?",
          "Before sleep, notice: What new understanding of yourself feels most true right now?",
          "As you wind down: Write one sentence that captures who you're becoming as a partner.",
        ],
      },
      "compassionate-listener": {
        rhythm: [
          "Tonight, check in with yourself: What did you hear today that you might normally have missed?",
          "Before sleep, reflect: When did you truly listen — not just with your ears, but with your heart?",
          "As you wind down: What emotion did someone share today, and how did it land in you?",
        ],
        deepening: [
          "Tonight, turn your empathy inward: What are YOU feeling right now? Name it without judging it.",
          "Before sleep: What need were you aware of in someone today? What need of yours went unspoken?",
          "As you wind down, notice: Where does empathy live in your body?",
        ],
        navigating: [
          "Tonight, reflect: When someone expressed frustration today, what was the feeling underneath the words?",
          "Before bed: When you heard something hard today, what was your first instinct — to fix, to feel, or to flee?",
          "As you wind down: What would it look like to listen to yourself with the same compassion you give others?",
        ],
        layers: [
          "Tonight, go deeper: Is there a feeling you're better at hearing in others than in yourself?",
          "Before sleep: What part of your listening is pure gift, and what part is avoiding your own voice?",
          "As you wind down: What would you hear if you listened to your own heart as deeply as you listen to others?",
        ],
        mirror: [
          "Tonight, celebrate: How has your capacity for empathy grown — and what have you learned about your own needs?",
          "Before sleep: What's the most important thing these days have taught you about listening to yourself?",
          "As you wind down: Write one sentence about the listener you're becoming.",
        ],
      },
      "growth-seeker": {
        rhythm: [
          "Tonight, track your progress: What did you learn about yourself today that you didn't know yesterday?",
          "Before bed, reflect: What's one thing you did today that your past self wouldn't have done?",
          "As you wind down: Where do you feel your growth edge right now?",
        ],
        deepening: [
          "Tonight, go deeper: What pattern did you notice in yourself today? What does it tell you?",
          "Before sleep: What emotion felt unfamiliar today? Lean into it — that's where growth lives.",
          "As you wind down, notice: Where in your body do you feel the pull toward growth?",
        ],
        navigating: [
          "Tonight, experiment: Replay one challenging moment from today. What was your automatic thought? What's an alternative thought? (CBT thought record)",
          "Before bed: What assumption about yourself got challenged today? How does it feel to hold that uncertainty?",
          "As you wind down: What skill are you building right now that will matter six months from now?",
        ],
        layers: [
          "Tonight, go deeper: What's a growth edge that scares you? What would it mean to lean into it?",
          "Before sleep: Is there a story you tell yourself about relationships that might be worth rewriting?",
          "As you wind down: If you could send a message to yourself six months from now, what would you say about today's work?",
        ],
        mirror: [
          "Tonight, celebrate: Map your growth from Day 1 to now. What's changed that you can name?",
          "Before sleep: What discovery about yourself surprised you most during this journey?",
          "As you wind down: Write one sentence about the partner you're evolving into.",
        ],
      },
      "connection-builder": {
        rhythm: [
          "Tonight, appreciate: What moment of connection did you create or notice today?",
          "Before sleep, reflect: When did you feel closest to someone today? What made it special?",
          "As you wind down: What small gesture today carried more meaning than its size?",
        ],
        deepening: [
          "Tonight, go deeper: What connection did you crave today? What would have fulfilled it?",
          "Before sleep: What emotion did you share openly today? How did it feel to be seen?",
          "As you wind down, notice: What does connection feel like in your body?",
        ],
        navigating: [
          "Tonight, reflect: When distance appeared between you and someone today, what was underneath it?",
          "Before bed: Think of a repair attempt you made or received today. What made it work (or not)?",
          "As you wind down: What's one thing you could say tomorrow to create a moment of reconnection?",
        ],
        layers: [
          "Tonight, go deeper: What's the connection you want most that you haven't asked for yet?",
          "Before sleep: Is there a way you seek connection that sometimes pushes it away? What would the alternative look like?",
          "As you wind down: What does your ideal moment of deep connection look and feel like?",
        ],
        mirror: [
          "Tonight, celebrate: How has the quality of your connections shifted over these days?",
          "Before sleep: What new thread of connection have you woven that didn't exist before?",
          "As you wind down: Write one sentence about the connector you're becoming.",
        ],
      },
    };

    const archetypePrompts = reflectionPrompts[input.identityArchetype] || reflectionPrompts["calm-anchor"];
    const phasePrompts = archetypePrompts[input.discoveryPhase] || archetypePrompts["rhythm"];
    const prompt = phasePrompts[Math.floor(Math.random() * phasePrompts.length)];

    // For navigating/layers phases, use guided format with sub-prompts
    if (
      (input.discoveryPhase === "navigating" || input.discoveryPhase === "layers") &&
      reflectTechnique
    ) {
      return {
        prompt,
        format: "guided",
        guidedPrompts: [
          prompt,
          "What did you notice in your body as you reflected on this?",
          "What's one small thing you could do differently tomorrow based on this awareness?",
        ],
        relatedToLearn: true,
      };
    }

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

  /**
   * Get growth-oriented scale anchoring labels based on the discovery phase.
   * Psychology: Anchoring effect — the labels significantly influence responses
   * and self-perception. We use labels that frame the low end as growth-in-progress
   * (not failure) and the high end as natural strength (not perfection).
   */
  private getScaleAnchoring(phase: DiscoveryPhase): [string, string] {
    const anchors: Record<DiscoveryPhase, [string, string]> = {
      rhythm: ANCHORING_LABELS.comfortLevel as [string, string],
      deepening: ANCHORING_LABELS.awareness as [string, string],
      navigating: ANCHORING_LABELS.growthOriented as [string, string],
      layers: ANCHORING_LABELS.importance as [string, string],
      mirror: ANCHORING_LABELS.frequency as [string, string],
    };
    return anchors[phase] || ANCHORING_LABELS.growthOriented as [string, string];
  }
}

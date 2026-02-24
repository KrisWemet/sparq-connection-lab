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
  getCoachingPattern,
  COACHING_LANGUAGE_PATTERNS,
  ANCHORING_LABELS,
  buildAttachmentPromptSection,
  getAttachmentLanguage,
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
            input.identityArchetype,
            input.attachmentStyle
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
    archetype: string,
    attachmentStyle?: string
  ): YesterdayCheckIn {
    const lang = getAttachmentLanguage(attachmentStyle);

    return {
      actionReminder: `Yesterday you planned to: "${yesterdayAction}"`,
      options: [
        { id: "loved-it", text: "Did it — felt good!", emoji: "✨" },
        { id: "felt-awkward", text: "Tried it, felt weird", emoji: "😅" },
        { id: "didnt-try", text: "Didn't get to it", emoji: "🤷" },
        { id: "modified-it", text: "Did my own version", emoji: "🔄" },
      ],
      acknowledgments: {
        "loved-it":
          "That makes complete sense! Small steps like this really do add up over time.",
        "felt-awkward":
          "That's completely normal! New things often feel awkward at first. The fact that you tried? That's what counts.",
        "didnt-try": lang.missedActionResponse,
        "modified-it":
          "That's wonderful — you made it your own. That shows you really know yourself.",
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

    // Build attachment-aware language rules
    const attachmentRules = buildAttachmentPromptSection(input.attachmentStyle);
    const attachmentLang = getAttachmentLanguage(input.attachmentStyle);

    // Build psychology-enriched system prompt
    const systemPrompt = `You are a warm, caring friend helping someone become a better partner. You know a lot about relationships and people — but you never show off that knowledge. You just use it to say the right thing at the right time.

VOICE AND READING LEVEL:
- Write at a 4th grade reading level. Short sentences. Simple words. No jargon.
- Sound like a kind friend and coach, not a textbook.
- NEVER mention psychology terms, framework names, or technique names. The user doesn't want to know WHY it works — they want the transformation.
- NEVER use words like: "attachment style", "CBT", "NVC", "cognitive reframing", "presupposition", "narrative therapy", "emotional regulation", "vulnerability", "intimacy profile", "therapeutic", "therapy", "therapist", "modality", "framework"
- DO use words like: "notice", "try", "feels like", "what works for you", "that makes sense", "here's what's cool about that"
- Keep everything warm and real. Like texting a friend who really gets you.

WHO THIS PERSON IS:
They see themselves as a "${archetype.label}" — ${archetype.contentFraming.insightStyle}
Tone: ${archetype.contentFraming.questionTone}

${attachmentRules}

HOW TO WRITE QUESTIONS AND INSIGHTS:
${technique ? technique.promptInstruction : "Ask about their real life. Keep it simple and warm."}
- Questions should feel like a good conversation, not a test
- "Which of these sounds most like you?" not "Select the option that best describes your behavior pattern"
- Always make every answer feel like a good answer
- Say "When you notice..." not "If you notice..." (assume good things are happening)
- Always say something kind about what they shared before suggesting anything new
- When something is hard, call it "a tough spot" not "a challenge to your emotional processing"

THE INSIGHT AFTER THEY ANSWER (this is the most important part):
${insightTechnique ? insightTechnique.promptInstruction : "Say something warm about what their answer shows."}
1. Say back what you heard: "The way you talked about X..."
2. Name it as a strength: "That shows you really..."
3. Connect it to their life: "As you keep noticing this..."
Keep it to 2-3 short sentences. Make them feel seen.
${attachmentLang.insightFraming}

CORE RULES:
- This is a SOLO-FIRST app. "Making me a better me for us"
- Day ${input.discoveryDay} — ${input.discoveryDay <= 3 ? "keep it light and warm, we're just getting to know them" : input.discoveryDay <= 7 ? "they're settling in, can go a bit deeper" : input.discoveryDay <= 12 ? "they trust us now, okay to explore harder stuff gently" : "celebrate how far they've come"}
- Simple words. Short sentences. Warm tone. No labels. Just help.`;

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
        text: "As you think about the people you love, what helps you feel most connected to them?",
        modality: "attachment" as PsychologyModality,
        targetDimensions: ["attachment", "emotionalExpression"],
        intimacyLevel: 2,
      },
      rhythm: {
        text: "As you think about the people you love, what helps you feel most connected to them?",
        modality: "attachment" as PsychologyModality,
        targetDimensions: ["attachment", "emotionalExpression"],
        intimacyLevel: 2,
      },
      "behavior-change": {
        text: "When a difficult day shows up, what kind of support helps you find your footing again?",
        modality: "eft" as PsychologyModality,
        targetDimensions: ["attachment", "loveLanguage"],
        intimacyLevel: 3,
      },
      deepening: {
        text: "When a difficult day shows up, what kind of support helps you find your footing again?",
        modality: "eft" as PsychologyModality,
        targetDimensions: ["attachment", "loveLanguage"],
        intimacyLevel: 3,
      },
      "skill-building": {
        text: "As you think about a recent disagreement, what would you try differently if you could explore it again?",
        modality: "gottman" as PsychologyModality,
        targetDimensions: ["conflict", "emotionalExpression"],
        intimacyLevel: 3,
      },
      navigating: {
        text: "As you think about a recent disagreement, what would you try differently if you could explore it again?",
        modality: "gottman" as PsychologyModality,
        targetDimensions: ["conflict", "emotionalExpression"],
        intimacyLevel: 3,
      },
      integration: {
        text: "As you reflect on how you show up in relationships, what are you most proud of?",
        modality: "narrative" as PsychologyModality,
        targetDimensions: ["relationalIdentity", "values"],
        intimacyLevel: 4,
      },
      layers: {
        text: "As you reflect on how you show up in relationships, what are you most proud of?",
        modality: "narrative" as PsychologyModality,
        targetDimensions: ["relationalIdentity", "values"],
        intimacyLevel: 4,
      },
      mirror: {
        text: "As you reflect on how you show up in relationships, what are you most proud of?",
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
   *
   * All prompts are written at a 4th grade reading level.
   * No psychology labels or clinical terms appear in user-facing text.
   * Techniques are embedded invisibly in HOW we ask, not labeled.
   */
  private buildReflectStep(input: SessionGenerationInput): ReflectStep {
    const reflectTechnique = selectTechniqueForContext(input.discoveryPhase, "reflect");

    // Simple, warm reflection prompts — archetype × phase
    // No jargon. No labels. Just good questions.
    const reflectionPrompts: Record<string, Record<string, string[]>> = {
      "calm-anchor": {
        rhythm: [
          "As you reflect on today, what moment stands out where you felt most at peace?",
          "Take three slow breaths. As you notice, where do you feel calm in your body right now?",
          "What one thing helped you stay steady today?",
        ],
        deepening: [
          "As you look back, what feeling showed up that surprised you? Where in your body did you notice it?",
          "When did your calm presence help someone else feel safe today?",
          "What feeling showed up today that you chose not to react to?",
        ],
        navigating: [
          "When tension showed up today, what helped you find your steadiness again?",
          "Think about a hard moment today. What thought showed up first, then what feeling followed?",
          "As you imagine redoing one moment with even more calm, what would be different?",
        ],
        layers: [
          "What part of your calm are you most proud of? When might it also be protecting you?",
          "When is your calm a strength, and when might it be keeping something at a distance?",
          "What would it look like to be steady AND open at the same time?",
        ],
        mirror: [
          "As you look back, how has your sense of calm shifted over these past days?",
          "What new thing about yourself feels most true right now?",
          "Finish this sentence: As a partner, I'm becoming someone who...",
        ],
      },
      "compassionate-listener": {
        rhythm: [
          "As you reflect on today, what did you hear that you might normally have missed?",
          "When did you really listen today — not just the words, but what was underneath them?",
          "What feeling did someone share with you today? As you notice, how did it land?",
        ],
        deepening: [
          "Check in with yourself: How are YOU feeling right now? Just name it — whatever's there.",
          "What did someone need from you today? What did you need that you didn't say?",
          "As you notice, where in your body do you feel it when you care about someone?",
        ],
        navigating: [
          "When someone was upset today, what was the real feeling underneath their words?",
          "When you heard something hard today, did you want to fix it, feel it, or step back?",
          "What would it look like to listen to yourself with the same care you give others?",
        ],
        layers: [
          "Is there a feeling you hear better in other people than in yourself?",
          "Which part of your listening is a gift, and which part might be keeping your own voice quiet?",
          "What would you hear if you listened to your own heart the way you listen to everyone else?",
        ],
        mirror: [
          "As you look back, how has your ability to really hear people grown? What have you learned about your own needs?",
          "What's the biggest thing these days have taught you about listening to yourself?",
          "Finish this sentence: As a listener, I'm becoming someone who...",
        ],
      },
      "growth-seeker": {
        rhythm: [
          "As you look back, what did you discover about yourself today that you didn't know yesterday?",
          "What's one thing you did today that your past self wouldn't have?",
          "As you notice, where do you feel yourself stretching right now?",
        ],
        deepening: [
          "What pattern showed up in yourself today? As you get curious, what might it mean?",
          "What feeling showed up today that was new or unfamiliar? That's usually where the growth is.",
          "As you notice, where in your body do you feel it when you're growing?",
        ],
        navigating: [
          "Pick one hard moment from today. What thought showed up first? Now — what's another way to see it?",
          "What did you believe about yourself that got shaken up today?",
          "What skill are you building right now that you'll appreciate six months from now?",
        ],
        layers: [
          "What growth edge feels a little scary? What would it mean to explore it?",
          "Is there a story you tell yourself about love that might be ready for an update?",
          "If you could send a note to yourself six months from now, what would you say about today?",
        ],
        mirror: [
          "As you look back to Day 1, what's different now? Name what you notice.",
          "What surprised you most about what you learned about yourself?",
          "Finish this sentence: As a partner, I'm growing into someone who...",
        ],
      },
      "connection-builder": {
        rhythm: [
          "As you reflect on today, what moment of closeness did you notice or create?",
          "When did you feel closest to someone today? As you remember, what made it special?",
          "What small thing today meant more than it looked?",
        ],
        deepening: [
          "What kind of closeness showed up as a want today? What would have given you that?",
          "What did you share openly today? As you notice, how did it feel to be really seen?",
          "As you check in, where in your body do you feel it when you're connected to someone?",
        ],
        navigating: [
          "When distance showed up with someone today, what was really going on underneath?",
          "Did you try to bridge something with someone today? What worked? What would you try differently?",
          "What's one thing you could offer tomorrow to feel closer to someone?",
        ],
        layers: [
          "What's the closeness you want most but haven't asked for yet?",
          "Is there a way you try to connect that sometimes creates distance? What might you try instead?",
          "Picture your best moment of real closeness. As you imagine it, what does it look and feel like?",
        ],
        mirror: [
          "As you look back, how have your connections shifted over these past days?",
          "What new kind of closeness have you built that wasn't there before?",
          "Finish this sentence: As a connector, I'm becoming someone who...",
        ],
      },
    };

    const archetypePrompts = reflectionPrompts[input.identityArchetype] || reflectionPrompts["calm-anchor"];
    const phasePrompts = archetypePrompts[input.discoveryPhase] || archetypePrompts["rhythm"];
    const prompt = phasePrompts[Math.floor(Math.random() * phasePrompts.length)];

    // For navigating/layers phases, add gentle guided sub-prompts
    if (
      (input.discoveryPhase === "navigating" || input.discoveryPhase === "layers") &&
      reflectTechnique
    ) {
      return {
        prompt,
        format: "guided",
        guidedPrompts: [
          prompt,
          "Where did you feel that in your body?",
          "What's one small thing you could try differently tomorrow?",
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

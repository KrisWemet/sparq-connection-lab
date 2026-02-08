import { apiConfig } from "@/lib/api-config";
import type {
  PersonalitySignal,
  ResponseAnalysisInput,
  ResponseAnalysisOutput,
  DimensionConfidence,
  PersonalityDimension,
} from "@/types/personality";

/**
 * PersonalityInferenceService
 *
 * Analyzes user responses to daily questions and extracts personality signals
 * across 7 dimensions: attachment, loveLanguage, conflict, emotionalExpression,
 * values, intimacy, relationalIdentity.
 *
 * Each response is sent to the AI with context about the question modality
 * and what's already known about the user. The AI returns structured signals
 * that feed into the personality profile builder.
 */
export class PersonalityInferenceService {
  private static instance: PersonalityInferenceService;

  private constructor() {}

  static getInstance(): PersonalityInferenceService {
    if (!PersonalityInferenceService.instance) {
      PersonalityInferenceService.instance = new PersonalityInferenceService();
    }
    return PersonalityInferenceService.instance;
  }

  /**
   * Analyze a single user response and extract personality signals.
   *
   * This is called after every question the user answers during the
   * 14-day discovery period (and continues refining after).
   */
  async analyzeResponse(input: ResponseAnalysisInput): Promise<ResponseAnalysisOutput> {
    const { openai } = apiConfig.apiKeys;

    if (!openai) {
      console.warn("OpenAI API key not configured — skipping personality inference");
      return { signals: [], confidenceUpdates: [], memoryNotes: [] };
    }

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildAnalysisPrompt(input);

    try {
      const response = await fetch(`${apiConfig.endpoints.openai}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openai}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 1200,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`Inference API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Empty response from inference API");
      }

      return this.parseAnalysisResponse(content, input);
    } catch (error) {
      console.error("Personality inference failed:", error);
      return { signals: [], confidenceUpdates: [], memoryNotes: [] };
    }
  }

  private buildSystemPrompt(): string {
    return `You are a relationship psychology expert analyzing user responses to extract personality signals. You specialize in Attachment Theory, Gottman Method, Love Languages, CBT, and Emotional Focused Therapy.

Your job is to read a user's response to a relationship question and identify what it reveals about their personality across these dimensions:

1. **attachment** — Attachment style signals. Look for: proximity-seeking vs. independence, fear of abandonment vs. discomfort with closeness, how they describe needing their partner.
2. **loveLanguage** — How they give and receive love. Look for: references to words/verbal affirmation, quality time together, physical closeness, doing things for partner, gift-giving/thoughtfulness.
3. **conflict** — How they handle disagreement. Look for: pursuing engagement vs. withdrawing, criticism patterns, defensiveness, repair attempts, conflict avoidance.
4. **emotionalExpression** — Emotional depth and vulnerability. Look for: emotional vocabulary range, willingness to share feelings, cognitive vs. feeling-based processing, how they regulate emotions.
5. **values** — Core values and meaning-making. Look for: what they prioritize (growth, stability, adventure, security, authenticity), autonomy vs. togetherness, future orientation.
6. **intimacy** — Comfort with emotional and physical closeness. Look for: how readily they discuss intimate topics, physical vs. emotional emphasis, novelty-seeking vs. comfort-seeking.
7. **relationalIdentity** — How they see themselves as a partner. Look for: role patterns, independence vs. merged identity, how they describe their contribution to the relationship.

For each signal you extract:
- Specify which dimension it informs
- Provide a brief observation (what you noticed)
- Rate the signal strength (0.0-1.0, where 1.0 = very clear signal)
- Name the specific trait it points toward

Not every response will contain signals for all dimensions. Only report what you genuinely observe. Do not invent or extrapolate beyond what the response shows. Quality over quantity.

Respond with a JSON object containing:
{
  "signals": [{ "dimension", "observation", "strength", "indicator" }],
  "memoryNotes": ["notable observations worth remembering for future context"]
}`;
  }

  private buildAnalysisPrompt(input: ResponseAnalysisInput): string {
    const existingContext = this.summarizeExistingProfile(input.existingProfile);

    return `Analyze this user response for personality signals.

**Question asked** (${input.questionModality} framework, ${input.questionCategory} category, intimacy level ${input.questionIntimacyLevel}/5):
"${input.questionText}"

**User's response**:
"${input.userResponse}"

**Discovery day**: ${input.discoveryDay} of 14
**What we already know about this user**: ${existingContext}

Extract personality signals from the response. Focus on what's genuinely revealed, not what you'd expect. If the response is brief or surface-level, that itself is a signal about emotional expression style.`;
  }

  private summarizeExistingProfile(profile: Partial<ResponseAnalysisInput["existingProfile"]>): string {
    if (!profile || Object.keys(profile).length === 0) {
      return "This is early in the discovery period. No significant profile data yet.";
    }

    const parts: string[] = [];

    if (profile.attachment) {
      const att = profile.attachment;
      if (att.observations && att.observations.length > 0) {
        parts.push(`Attachment signals so far: ${att.observations.slice(-3).join("; ")}`);
      }
    }

    if (profile.values?.coreValues && profile.values.coreValues.length > 0) {
      parts.push(`Emerging values: ${profile.values.coreValues.join(", ")}`);
    }

    if (profile.emotional) {
      parts.push(`Emotional expression depth: ${profile.emotional.vocabularyDepth || "unknown"}`);
    }

    return parts.length > 0
      ? parts.join(". ")
      : "Early signals collected but no strong patterns established yet.";
  }

  private parseAnalysisResponse(
    raw: string,
    input: ResponseAnalysisInput
  ): ResponseAnalysisOutput {
    try {
      const parsed = JSON.parse(raw);
      const now = new Date().toISOString();

      const signals: PersonalitySignal[] = (parsed.signals || []).map(
        (s: { dimension: string; observation: string; strength: number; indicator: string }) => ({
          dimension: s.dimension as PersonalityDimension,
          sourceModality: input.questionModality,
          observation: s.observation,
          strength: Math.min(1, Math.max(0, s.strength)),
          indicator: s.indicator,
          capturedAt: now,
          discoveryDay: input.discoveryDay,
        })
      );

      // Calculate confidence updates based on signal accumulation
      const confidenceUpdates = this.calculateConfidenceUpdates(signals, input.discoveryDay);

      return {
        signals,
        confidenceUpdates,
        memoryNotes: parsed.memoryNotes || [],
      };
    } catch (error) {
      console.error("Failed to parse inference response:", error);
      return { signals: [], confidenceUpdates: [], memoryNotes: [] };
    }
  }

  /**
   * Calculate how confident we are in each dimension based on signal
   * accumulation. Confidence grows with more signals but has diminishing
   * returns — the first few signals per dimension are most valuable.
   */
  private calculateConfidenceUpdates(
    newSignals: PersonalitySignal[],
    discoveryDay: number
  ): DimensionConfidence[] {
    const dimensionSignalCounts = new Map<PersonalityDimension, number>();

    for (const signal of newSignals) {
      const current = dimensionSignalCounts.get(signal.dimension) || 0;
      dimensionSignalCounts.set(signal.dimension, current + 1);
    }

    return Array.from(dimensionSignalCounts.entries()).map(([dimension, count]) => {
      // Confidence grows logarithmically — lots of early signal, diminishing returns
      // By day 14 with consistent responses, most dimensions should be > 0.7
      const baseConfidence = Math.min(1, Math.log2(count + 1) / 4);
      // Boost confidence slightly as discovery progresses (more context = better reads)
      const dayBoost = (discoveryDay / 14) * 0.15;
      const confidence = Math.min(1, baseConfidence + dayBoost);

      return {
        dimension,
        confidence,
        signalCount: count,
        isReliable: confidence >= 0.5,
      };
    });
  }
}

import { AIModelService } from "@/services/aiModelService";
import type {
  PersonalityProfile,
  MirrorNarrative,
  PersonalityDimension,
} from "@/types/personality";

/**
 * MirrorNarrativeService
 *
 * Generates the Day 14 "we see you" narrative — a warm, personal
 * reflection of who the user is as a partner and what makes their
 * relationship unique.
 *
 * This is the emotional payoff of the 14-day discovery period.
 * It synthesizes the full personality profile into approachable,
 * strength-framed language that makes people feel genuinely seen.
 */
export class MirrorNarrativeService {
  private static instance: MirrorNarrativeService;

  private constructor() {}

  static getInstance(): MirrorNarrativeService {
    if (!MirrorNarrativeService.instance) {
      MirrorNarrativeService.instance = new MirrorNarrativeService();
    }
    return MirrorNarrativeService.instance;
  }

  /**
   * Generate the mirror narrative for Day 14 (or whenever the profile
   * has enough confident dimensions to deliver a meaningful reflection).
   */
  async generateNarrative(
    profile: PersonalityProfile,
    userName: string,
    partnerName?: string
  ): Promise<MirrorNarrative> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildNarrativePrompt(profile, userName, partnerName);

    try {
      const aiService = AIModelService.getInstance();
      const response = await aiService.complete({
        taskType: "mirror-narrative",
        systemPrompt,
        userPrompt,
        temperature: 0.7,
        maxTokens: 2000,
        jsonMode: true,
      });

      if (!response.content) {
        throw new Error("Empty response from narrative generation");
      }

      return this.parseNarrativeResponse(response.content, profile);
    } catch (error) {
      console.error("Mirror narrative generation failed:", error);
      return this.buildFallbackNarrative(profile, userName, partnerName);
    }
  }

  private buildSystemPrompt(): string {
    return `You are a warm, insightful relationship psychologist writing a personal reflection for a couple after 14 days of getting to know them through their daily responses.

Your voice is: warm, genuine, specific, celebratory. You write like a trusted friend who happens to understand attachment theory and love languages deeply — but you never sound clinical.

Rules:
- Frame EVERYTHING as a strength or natural tendency, never as a problem or diagnosis
- Use the couple's names throughout to make it personal
- Reference specific patterns from their responses (the observations provided)
- Keep the narrative conversational — like a heartfelt letter, not a report
- Avoid jargon. Say "you tend to seek closeness when things feel uncertain" not "anxious attachment style"
- Celebrate what makes THIS couple unique, not generic relationship advice
- The tone should make someone tear up a little because they feel truly seen
- End with a forward-looking statement about their growth together

Respond with JSON:
{
  "narrative": "The full 3-5 paragraph personal narrative",
  "dimensionSummaries": [{
    "dimension": "attachment|loveLanguage|conflict|emotionalExpression|values|intimacy|relationalIdentity",
    "title": "Short warm title for this dimension",
    "description": "2-3 sentences about what was discovered",
    "strengthFrame": "How this trait is a strength in their relationship"
  }],
  "recommendations": [{
    "journeyId": "journey-id",
    "reason": "Why this journey would be meaningful for them specifically"
  }],
  "coreInsight": "A single sentence capturing the most important thing about this couple"
}`;
  }

  private buildNarrativePrompt(
    profile: PersonalityProfile,
    userName: string,
    partnerName?: string
  ): string {
    const partner = partnerName || "your partner";

    // Build dimension summaries from profile data
    const attachmentDesc = this.describeAttachment(profile);
    const loveLanguageDesc = this.describeLoveLanguages(profile);
    const conflictDesc = this.describeConflict(profile);
    const emotionalDesc = this.describeEmotional(profile);
    const valuesDesc = this.describeValues(profile);
    const intimacyDesc = this.describeIntimacy(profile);

    // Collect key observations from signals
    const keyObservations = profile.signals
      .filter((s) => s.strength > 0.6)
      .slice(-15)
      .map((s) => `- ${s.observation} (from ${s.sourceModality} question)`)
      .join("\n");

    return `Write a personal mirror narrative for ${userName} (partner: ${partner}).

**Over the past ${profile.discovery.responsesAnalyzed} responses across 14 days, here's what we've learned:**

**Attachment Style**: ${attachmentDesc}
**Love Languages**: ${loveLanguageDesc}
**Conflict Style**: ${conflictDesc}
**Emotional Expression**: ${emotionalDesc}
**Core Values**: ${valuesDesc}
**Intimacy Profile**: ${intimacyDesc}

**Notable observations from their responses:**
${keyObservations || "Multiple signals across all dimensions — sufficient for a meaningful narrative."}

**Confidence levels:**
${profile.confidence.map((c) => `- ${c.dimension}: ${Math.round(c.confidence * 100)}% (${c.isReliable ? "reliable" : "emerging"})`).join("\n")}

Write the narrative focusing on dimensions where confidence is highest. For lower-confidence dimensions, frame observations as "we're beginning to see" rather than definitive statements.

For journey recommendations, choose from: love-languages, communication, trust-vulnerability, intimacy-connection, conflict-resolution, attachment-healing, emotional-intelligence, relationship-renewal, values-alignment.`;
  }

  // ─── Dimension Descriptions ─────────────────────────────────────────────

  private describeAttachment(profile: PersonalityProfile): string {
    const { attachmentStyle, attachment } = profile;
    const styleMap: Record<string, string> = {
      secure: "Shows secure tendencies — comfortable with both closeness and independence",
      "anxious-preoccupied": `Tends to seek reassurance and closeness (anxiety: ${Math.round(attachment.anxietyLevel * 100)}%). Values connection deeply and is attuned to the emotional temperature of the relationship`,
      "dismissive-avoidant": `Values independence and self-reliance (avoidance: ${Math.round(attachment.avoidanceLevel * 100)}%). Processes emotions internally before sharing`,
      "fearful-avoidant": `Shows both desire for closeness and caution about vulnerability (anxiety: ${Math.round(attachment.anxietyLevel * 100)}%, avoidance: ${Math.round(attachment.avoidanceLevel * 100)}%)`,
    };
    return styleMap[attachmentStyle] || "Still emerging — insufficient signals yet.";
  }

  private describeLoveLanguages(profile: PersonalityProfile): string {
    const { ranked, scores } = profile.loveLanguages;
    if (ranked.length === 0) return "Not yet determined.";

    const top = ranked.slice(0, 2).map((l) => {
      const score = Math.round((scores[l] || 0) * 100);
      return `${l.replace(/-/g, " ")} (${score}%)`;
    });
    return `Primary: ${top[0]}${top[1] ? `, Secondary: ${top[1]}` : ""}`;
  }

  private describeConflict(profile: PersonalityProfile): string {
    const { primaryPattern, repairCapacity, horsemen } = profile.conflict;
    const patternDesc: Record<string, string> = {
      pursuer: "Engages actively in conflict — seeks resolution through discussion and directness",
      withdrawer: "Tends to step back during disagreements — needs space to process before engaging",
      validator: "Approaches conflict with calm and seeks mutual understanding",
      volatile: "Passionate and direct in disagreements — but also passionate in repair",
      "conflict-avoidant": "Prefers to keep the peace — may sidestep difficult conversations",
    };

    const activeHorsemen = Object.entries(horsemen)
      .filter(([, v]) => v > 0.4)
      .map(([k]) => k);

    let desc = patternDesc[primaryPattern] || "Pattern still emerging.";
    desc += ` Repair capacity: ${Math.round(repairCapacity * 100)}%.`;
    if (activeHorsemen.length > 0) {
      desc += ` Watch areas: ${activeHorsemen.join(", ")}.`;
    }
    return desc;
  }

  private describeEmotional(profile: PersonalityProfile): string {
    const { opennessToVulnerability, vocabularyDepth, processingStyle } = profile.emotional;
    return `Vulnerability openness: ${Math.round(opennessToVulnerability * 100)}%. Emotional vocabulary: ${vocabularyDepth}. Processing style: ${processingStyle}.`;
  }

  private describeValues(profile: PersonalityProfile): string {
    const { coreValues, growthOrientation } = profile.values;
    if (coreValues.length === 0) return "Still emerging from responses.";

    const orientation = growthOrientation > 0.6 ? "growth-oriented" : growthOrientation < 0.4 ? "stability-seeking" : "balanced";
    return `Core values: ${coreValues.join(", ")}. Orientation: ${orientation}.`;
  }

  private describeIntimacy(profile: PersonalityProfile): string {
    const { emotionalComfort, physicalComfort, progressionRate } = profile.intimacy;
    return `Emotional comfort: ${Math.round(emotionalComfort * 100)}%. Physical comfort: ${Math.round(physicalComfort * 100)}%. Progression: ${progressionRate}.`;
  }

  // ─── Response Parsing ───────────────────────────────────────────────────

  private parseNarrativeResponse(raw: string, profile: PersonalityProfile): MirrorNarrative {
    try {
      const parsed = JSON.parse(raw);

      return {
        narrative: parsed.narrative || "",
        dimensionSummaries: (parsed.dimensionSummaries || []).map(
          (s: { dimension: string; title: string; description: string; strengthFrame: string }) => ({
            dimension: s.dimension as PersonalityDimension,
            title: s.title,
            description: s.description,
            strengthFrame: s.strengthFrame,
          })
        ),
        recommendations: parsed.recommendations || [],
        coreInsight: parsed.coreInsight || "",
      };
    } catch (error) {
      console.error("Failed to parse narrative response:", error);
      return this.buildFallbackNarrative(profile, "there", undefined);
    }
  }

  // ─── Fallback Narrative ─────────────────────────────────────────────────

  private buildFallbackNarrative(
    profile: PersonalityProfile,
    userName: string,
    partnerName?: string
  ): MirrorNarrative {
    const partner = partnerName || "your partner";
    const responsesCount = profile.discovery.responsesAnalyzed;

    return {
      narrative: `${userName}, over the past two weeks and ${responsesCount} conversations, something beautiful has come into focus about you and ${partner}.\n\nThe way you show up in this relationship — your willingness to reflect, to be honest, to keep showing up day after day — that tells us something important. You care deeply about this connection, and that care shows in everything you've shared.\n\nWhat we've seen is a couple with real depth. You have your own unique rhythm of closeness and independence, your own way of navigating the hard conversations, and your own language of love that's been shaped by everything you've been through together.\n\nThis is just the beginning. The patterns we've noticed are starting points, not fixed labels. They're invitations to understand each other more deeply — and to grow in the directions that matter most to you both.`,
      dimensionSummaries: profile.confidence
        .filter((c) => c.isReliable)
        .map((c) => ({
          dimension: c.dimension,
          title: this.getDimensionTitle(c.dimension),
          description: `Based on ${c.signalCount} signals, we're seeing clear patterns in how you approach ${c.dimension.replace(/([A-Z])/g, " $1").toLowerCase()}.`,
          strengthFrame: "This is a natural part of who you are — and understanding it gives you power to grow.",
        })),
      recommendations: [
        {
          journeyId: "communication",
          reason: `Building on what you've shared, deeper communication practices could help you and ${partner} express what matters most.`,
        },
      ],
      coreInsight: `You and ${partner} have a foundation worth building on — and the fact that you're here says everything about where this is headed.`,
    };
  }

  private getDimensionTitle(dimension: PersonalityDimension): string {
    const titles: Record<PersonalityDimension, string> = {
      attachment: "How You Connect",
      loveLanguage: "How You Love",
      conflict: "How You Navigate Storms",
      emotionalExpression: "How You Feel",
      values: "What Drives You",
      intimacy: "How You Get Close",
      relationalIdentity: "Who You Are Together",
    };
    return titles[dimension] || dimension;
  }
}

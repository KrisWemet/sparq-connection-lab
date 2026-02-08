import { getMemoryService } from "@/services/memoryService";
import type {
  PersonalityProfile,
  PersonalitySignal,
  DimensionConfidence,
  ProfileContext,
  DiscoveryPhase,
  DiscoveryProgress,
  PersonalityDimension,
  AttachmentStyle,
  AttachmentSignals,
  LoveLanguageProfile,
  LoveLanguage,
  ConflictProfile,
  ConflictPattern,
  EmotionalProfile,
  ValuesProfile,
  IntimacyProfile,
} from "@/types/personality";
import type { PsychologyModality } from "@/types/quiz";

const PROFILE_MEMORY_KEY = "personality_profile";
const SIGNALS_MEMORY_KEY = "personality_signals";

/**
 * PersonalityProfileService
 *
 * Aggregates personality signals into a structured profile.
 * Persists via the existing SupabaseMemory system.
 * Produces ProfileContext objects for AI prompt injection.
 */
export class PersonalityProfileService {
  private static instance: PersonalityProfileService;
  private cachedProfile: PersonalityProfile | null = null;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): PersonalityProfileService {
    if (!PersonalityProfileService.instance) {
      PersonalityProfileService.instance = new PersonalityProfileService();
    }
    return PersonalityProfileService.instance;
  }

  /** Initialize for a specific user — call on auth */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    this.cachedProfile = await this.loadProfile(userId);
  }

  /** Get the current profile (from cache or storage) */
  async getProfile(): Promise<PersonalityProfile | null> {
    if (!this.userId) return null;
    if (this.cachedProfile) return this.cachedProfile;
    this.cachedProfile = await this.loadProfile(this.userId);
    return this.cachedProfile;
  }

  /**
   * Ingest new signals from the inference engine.
   * Updates the profile, recalculates dimensions, persists.
   */
  async ingestSignals(
    newSignals: PersonalitySignal[],
    confidenceUpdates: DimensionConfidence[],
    memoryNotes: string[]
  ): Promise<PersonalityProfile> {
    if (!this.userId) throw new Error("ProfileService not initialized");

    let profile = this.cachedProfile || this.createEmptyProfile(this.userId);

    // Append signals
    profile.signals = [...profile.signals, ...newSignals];

    // Merge confidence updates
    for (const update of confidenceUpdates) {
      const existing = profile.confidence.find((c) => c.dimension === update.dimension);
      if (existing) {
        // Combine: take max confidence, sum signal counts
        existing.confidence = Math.max(existing.confidence, update.confidence);
        existing.signalCount += update.signalCount;
        existing.isReliable = existing.confidence >= 0.5;
      } else {
        profile.confidence.push(update);
      }
    }

    // Update discovery progress
    profile.discovery.responsesAnalyzed += 1;
    if (newSignals.length > 0) {
      const revealedSet = new Set(profile.discovery.dimensionsRevealed);
      for (const conf of profile.confidence) {
        if (conf.isReliable) {
          revealedSet.add(conf.dimension);
        }
      }
      profile.discovery.dimensionsRevealed = Array.from(revealedSet);
    }

    // Recalculate all dimension scores from accumulated signals
    profile = this.recalculateDimensions(profile);
    profile.updatedAt = new Date().toISOString();

    // Persist
    this.cachedProfile = profile;
    await this.saveProfile(profile);

    // Store memory notes for future context
    if (memoryNotes.length > 0) {
      await this.storeMemoryNotes(memoryNotes);
    }

    return profile;
  }

  /** Advance the discovery day (called once per day) */
  async advanceDiscoveryDay(): Promise<void> {
    if (!this.userId) return;
    const profile = await this.getProfile();
    if (!profile) return;

    const nextDay = Math.min(14, profile.discovery.currentDay + 1);
    profile.discovery.currentDay = nextDay;
    profile.discovery.currentPhase = this.getPhaseForDay(nextDay);

    this.cachedProfile = profile;
    await this.saveProfile(profile);
  }

  /**
   * Build a lightweight ProfileContext for AI prompt injection.
   * This is what gets passed to question generation, AI therapist, etc.
   */
  async buildProfileContext(
    userName: string,
    partnerName?: string,
    relationshipStructure?: string
  ): Promise<ProfileContext> {
    const profile = await this.getProfile();

    if (!profile) {
      return {
        userName,
        partnerName,
        relationshipStructure,
        discoveryDay: 1,
        discoveryPhase: "rhythm",
        knownTraits: "No personality data gathered yet.",
        uncertainDimensions: [
          "attachment",
          "loveLanguage",
          "conflict",
          "emotionalExpression",
          "values",
          "intimacy",
          "relationalIdentity",
        ],
        comfortLevel: 0.3,
        preferredModalities: [],
        sensitivities: [],
      };
    }

    return {
      userName,
      partnerName,
      relationshipStructure,
      discoveryDay: profile.discovery.currentDay,
      discoveryPhase: profile.discovery.currentPhase,
      knownTraits: this.buildTraitSummary(profile),
      uncertainDimensions: this.getUncertainDimensions(profile),
      comfortLevel: profile.emotional.opennessToVulnerability,
      preferredModalities: this.identifyPreferredModalities(profile),
      sensitivities: this.identifySensitivities(profile),
    };
  }

  // ─── Phase Mapping ──────────────────────────────────────────────────────

  private getPhaseForDay(day: number): DiscoveryPhase {
    if (day <= 3) return "rhythm";
    if (day <= 6) return "deepening";
    if (day <= 9) return "navigating";
    if (day <= 12) return "layers";
    return "mirror";
  }

  // ─── Dimension Recalculation ────────────────────────────────────────────

  private recalculateDimensions(profile: PersonalityProfile): PersonalityProfile {
    const signals = profile.signals;

    profile.attachment = this.calculateAttachment(signals);
    profile.attachmentStyle = this.deriveAttachmentStyle(profile.attachment);
    profile.loveLanguages = this.calculateLoveLanguages(signals);
    profile.conflict = this.calculateConflict(signals);
    profile.emotional = this.calculateEmotional(signals);
    profile.values = this.calculateValues(signals);
    profile.intimacy = this.calculateIntimacy(signals);

    return profile;
  }

  private calculateAttachment(signals: PersonalitySignal[]): AttachmentSignals {
    const attachmentSignals = signals.filter((s) => s.dimension === "attachment");

    let anxietySum = 0;
    let avoidanceSum = 0;
    let anxietyCount = 0;
    let avoidanceCount = 0;
    const observations: string[] = [];

    for (const signal of attachmentSignals) {
      observations.push(signal.observation);
      const indicator = signal.indicator.toLowerCase();

      if (
        indicator.includes("anxious") ||
        indicator.includes("reassurance") ||
        indicator.includes("abandonment") ||
        indicator.includes("clingy") ||
        indicator.includes("preoccupied")
      ) {
        anxietySum += signal.strength;
        anxietyCount++;
      }

      if (
        indicator.includes("avoidant") ||
        indicator.includes("independence") ||
        indicator.includes("distance") ||
        indicator.includes("dismissive") ||
        indicator.includes("withdraw")
      ) {
        avoidanceSum += signal.strength;
        avoidanceCount++;
      }

      // Secure signals reduce both
      if (
        indicator.includes("secure") ||
        indicator.includes("comfortable") ||
        indicator.includes("balanced")
      ) {
        anxietySum -= signal.strength * 0.3;
        avoidanceSum -= signal.strength * 0.3;
      }
    }

    return {
      anxietyLevel: anxietyCount > 0 ? Math.max(0, Math.min(1, anxietySum / anxietyCount)) : 0.3,
      avoidanceLevel:
        avoidanceCount > 0 ? Math.max(0, Math.min(1, avoidanceSum / avoidanceCount)) : 0.3,
      observations: observations.slice(-10), // Keep most recent 10
    };
  }

  private deriveAttachmentStyle(attachment: AttachmentSignals): AttachmentStyle {
    const { anxietyLevel, avoidanceLevel } = attachment;

    if (anxietyLevel < 0.4 && avoidanceLevel < 0.4) return "secure";
    if (anxietyLevel >= 0.4 && avoidanceLevel < 0.4) return "anxious-preoccupied";
    if (anxietyLevel < 0.4 && avoidanceLevel >= 0.4) return "dismissive-avoidant";
    return "fearful-avoidant";
  }

  private calculateLoveLanguages(signals: PersonalitySignal[]): LoveLanguageProfile {
    const llSignals = signals.filter((s) => s.dimension === "loveLanguage");

    const scores: Record<LoveLanguage, number> = {
      "words-of-affirmation": 0,
      "quality-time": 0,
      "physical-touch": 0,
      "acts-of-service": 0,
      "receiving-gifts": 0,
    };

    const counts: Record<LoveLanguage, number> = { ...scores };

    for (const signal of llSignals) {
      const indicator = signal.indicator.toLowerCase();

      const languageMap: Record<string, LoveLanguage> = {
        words: "words-of-affirmation",
        affirmation: "words-of-affirmation",
        verbal: "words-of-affirmation",
        compliment: "words-of-affirmation",
        quality: "quality-time",
        "together time": "quality-time",
        presence: "quality-time",
        undivided: "quality-time",
        physical: "physical-touch",
        touch: "physical-touch",
        hug: "physical-touch",
        hold: "physical-touch",
        acts: "acts-of-service",
        service: "acts-of-service",
        help: "acts-of-service",
        chore: "acts-of-service",
        gift: "receiving-gifts",
        surprise: "receiving-gifts",
        thoughtful: "receiving-gifts",
      };

      for (const [keyword, language] of Object.entries(languageMap)) {
        if (indicator.includes(keyword)) {
          scores[language] += signal.strength;
          counts[language]++;
          break;
        }
      }
    }

    // Normalize scores
    for (const lang of Object.keys(scores) as LoveLanguage[]) {
      if (counts[lang] > 0) {
        scores[lang] = scores[lang] / counts[lang];
      }
    }

    // Rank by score
    const ranked = (Object.entries(scores) as [LoveLanguage, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    return { ranked, scores };
  }

  private calculateConflict(signals: PersonalitySignal[]): ConflictProfile {
    const conflictSignals = signals.filter((s) => s.dimension === "conflict");

    const patternScores: Record<ConflictPattern, number> = {
      pursuer: 0,
      withdrawer: 0,
      validator: 0,
      volatile: 0,
      "conflict-avoidant": 0,
    };

    const horsemen = { criticism: 0, contempt: 0, defensiveness: 0, stonewalling: 0 };
    const horsemenCounts = { criticism: 0, contempt: 0, defensiveness: 0, stonewalling: 0 };

    let repairSum = 0;
    let repairCount = 0;
    const triggers: string[] = [];

    for (const signal of conflictSignals) {
      const indicator = signal.indicator.toLowerCase();

      // Pattern detection
      if (indicator.includes("pursu") || indicator.includes("escalat") || indicator.includes("demand")) {
        patternScores.pursuer += signal.strength;
      }
      if (indicator.includes("withdraw") || indicator.includes("shut down") || indicator.includes("stonewall")) {
        patternScores.withdrawer += signal.strength;
      }
      if (indicator.includes("validat") || indicator.includes("compromis") || indicator.includes("calm")) {
        patternScores.validator += signal.strength;
      }
      if (indicator.includes("avoid") || indicator.includes("sidestep") || indicator.includes("ignore")) {
        patternScores["conflict-avoidant"] += signal.strength;
      }
      if (indicator.includes("intense") || indicator.includes("passionat") || indicator.includes("volatile")) {
        patternScores.volatile += signal.strength;
      }

      // Horsemen
      if (indicator.includes("critic")) {
        horsemen.criticism += signal.strength;
        horsemenCounts.criticism++;
      }
      if (indicator.includes("contempt") || indicator.includes("disgust")) {
        horsemen.contempt += signal.strength;
        horsemenCounts.contempt++;
      }
      if (indicator.includes("defensiv")) {
        horsemen.defensiveness += signal.strength;
        horsemenCounts.defensiveness++;
      }
      if (indicator.includes("stonewall") || indicator.includes("shut down")) {
        horsemen.stonewalling += signal.strength;
        horsemenCounts.stonewalling++;
      }

      // Repair capacity
      if (indicator.includes("repair") || indicator.includes("apologiz") || indicator.includes("reconnect")) {
        repairSum += signal.strength;
        repairCount++;
      }

      // Collect trigger themes from observations
      if (signal.observation.includes("trigger")) {
        triggers.push(signal.observation);
      }
    }

    // Find primary pattern
    const primaryPattern = (
      Object.entries(patternScores) as [ConflictPattern, number][]
    ).sort((a, b) => b[1] - a[1])[0][0];

    // Normalize horsemen
    for (const key of Object.keys(horsemen) as (keyof typeof horsemen)[]) {
      if (horsemenCounts[key] > 0) {
        horsemen[key] = Math.min(1, horsemen[key] / horsemenCounts[key]);
      }
    }

    return {
      primaryPattern,
      horsemen,
      repairCapacity: repairCount > 0 ? Math.min(1, repairSum / repairCount) : 0.5,
      triggerThemes: triggers.slice(-5),
    };
  }

  private calculateEmotional(signals: PersonalitySignal[]): EmotionalProfile {
    const emotionalSignals = signals.filter((s) => s.dimension === "emotionalExpression");

    let vulnerabilitySum = 0;
    let vulnerabilityCount = 0;
    let depthSignals = 0;

    for (const signal of emotionalSignals) {
      const indicator = signal.indicator.toLowerCase();

      if (indicator.includes("vulnerab") || indicator.includes("open") || indicator.includes("shar")) {
        vulnerabilitySum += signal.strength;
        vulnerabilityCount++;
      }

      if (signal.strength > 0.6) {
        depthSignals++;
      }
    }

    const openness =
      vulnerabilityCount > 0 ? Math.min(1, vulnerabilitySum / vulnerabilityCount) : 0.4;

    // Vocabulary depth based on signal richness
    let vocabularyDepth: EmotionalProfile["vocabularyDepth"] = "moderate";
    if (depthSignals > 5) vocabularyDepth = "rich";
    else if (depthSignals < 2) vocabularyDepth = "limited";

    return {
      opennessToVulnerability: openness,
      vocabularyDepth,
      processingStyle: "reflective", // Refined as more signals come in
      regulationStrategy: "co-regulation", // Default, refined over time
    };
  }

  private calculateValues(signals: PersonalitySignal[]): ValuesProfile {
    const valuesSignals = signals.filter((s) => s.dimension === "values");

    const valueCounts = new Map<string, number>();
    let growthSum = 0;
    let growthCount = 0;
    let autonomySum = 0;
    let autonomyCount = 0;

    for (const signal of valuesSignals) {
      // Extract value keywords
      const indicator = signal.indicator.toLowerCase();
      valueCounts.set(indicator, (valueCounts.get(indicator) || 0) + signal.strength);

      if (indicator.includes("growth") || indicator.includes("change") || indicator.includes("learn")) {
        growthSum += signal.strength;
        growthCount++;
      }
      if (indicator.includes("stability") || indicator.includes("security") || indicator.includes("routine")) {
        growthSum -= signal.strength * 0.5;
        growthCount++;
      }
      if (indicator.includes("independence") || indicator.includes("autonomy") || indicator.includes("space")) {
        autonomySum += signal.strength;
        autonomyCount++;
      }
      if (indicator.includes("togetherness") || indicator.includes("shared") || indicator.includes("we")) {
        autonomySum -= signal.strength * 0.5;
        autonomyCount++;
      }
    }

    // Top values by frequency
    const coreValues = Array.from(valueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value]) => value);

    return {
      coreValues,
      growthOrientation: growthCount > 0 ? Math.max(0, Math.min(1, 0.5 + growthSum / growthCount)) : 0.5,
      autonomyInterdependence:
        autonomyCount > 0 ? Math.max(0, Math.min(1, 0.5 - autonomySum / autonomyCount)) : 0.5,
    };
  }

  private calculateIntimacy(signals: PersonalitySignal[]): IntimacyProfile {
    const intimacySignals = signals.filter((s) => s.dimension === "intimacy");

    let emotionalSum = 0;
    let emotionalCount = 0;
    let physicalSum = 0;
    let physicalCount = 0;
    let noveltySum = 0;
    let noveltyCount = 0;

    for (const signal of intimacySignals) {
      const indicator = signal.indicator.toLowerCase();

      if (indicator.includes("emotional") || indicator.includes("deep") || indicator.includes("connect")) {
        emotionalSum += signal.strength;
        emotionalCount++;
      }
      if (indicator.includes("physical") || indicator.includes("touch") || indicator.includes("sensual")) {
        physicalSum += signal.strength;
        physicalCount++;
      }
      if (indicator.includes("novel") || indicator.includes("adventur") || indicator.includes("explor")) {
        noveltySum += signal.strength;
        noveltyCount++;
      }
    }

    const emotionalComfort = emotionalCount > 0 ? Math.min(1, emotionalSum / emotionalCount) : 0.4;
    const physicalComfort = physicalCount > 0 ? Math.min(1, physicalSum / physicalCount) : 0.3;

    let progressionRate: IntimacyProfile["progressionRate"] = "moderate";
    if (emotionalComfort > 0.7 && physicalComfort > 0.6) progressionRate = "eager";
    else if (emotionalComfort < 0.4 || physicalComfort < 0.3) progressionRate = "cautious";

    return {
      emotionalComfort,
      physicalComfort,
      noveltyPreference: noveltyCount > 0 ? Math.min(1, noveltySum / noveltyCount) : 0.5,
      progressionRate,
    };
  }

  // ─── Profile Context Helpers ────────────────────────────────────────────

  private buildTraitSummary(profile: PersonalityProfile): string {
    const parts: string[] = [];

    const attConf = profile.confidence.find((c) => c.dimension === "attachment");
    if (attConf?.isReliable) {
      parts.push(`Attachment style leans ${profile.attachmentStyle.replace("-", " ")}`);
    }

    const llConf = profile.confidence.find((c) => c.dimension === "loveLanguage");
    if (llConf?.isReliable && profile.loveLanguages.ranked.length > 0) {
      const primary = profile.loveLanguages.ranked[0].replace(/-/g, " ");
      parts.push(`Primary love language appears to be ${primary}`);
    }

    const confConf = profile.confidence.find((c) => c.dimension === "conflict");
    if (confConf?.isReliable) {
      parts.push(`In conflict, tends toward ${profile.conflict.primaryPattern} pattern`);
    }

    const emoConf = profile.confidence.find((c) => c.dimension === "emotionalExpression");
    if (emoConf?.isReliable) {
      parts.push(`Emotional vocabulary is ${profile.emotional.vocabularyDepth}, vulnerability openness at ${Math.round(profile.emotional.opennessToVulnerability * 100)}%`);
    }

    if (profile.values.coreValues.length > 0) {
      parts.push(`Core values: ${profile.values.coreValues.slice(0, 3).join(", ")}`);
    }

    return parts.length > 0
      ? parts.join(". ") + "."
      : "Still in early discovery — gathering initial signals.";
  }

  private getUncertainDimensions(profile: PersonalityProfile): PersonalityDimension[] {
    const allDimensions: PersonalityDimension[] = [
      "attachment",
      "loveLanguage",
      "conflict",
      "emotionalExpression",
      "values",
      "intimacy",
      "relationalIdentity",
    ];

    return allDimensions.filter((dim) => {
      const conf = profile.confidence.find((c) => c.dimension === dim);
      return !conf || !conf.isReliable;
    });
  }

  private identifyPreferredModalities(profile: PersonalityProfile): PsychologyModality[] {
    // Determine which modalities the user responds to most richly
    const modalityCounts = new Map<PsychologyModality, number>();

    for (const signal of profile.signals) {
      if (signal.strength > 0.5) {
        const count = modalityCounts.get(signal.sourceModality) || 0;
        modalityCounts.set(signal.sourceModality, count + 1);
      }
    }

    return Array.from(modalityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([modality]) => modality);
  }

  private identifySensitivities(profile: PersonalityProfile): string[] {
    const sensitivities: string[] = [];

    // If avoidant, flag intimacy topics as sensitive
    if (profile.attachment.avoidanceLevel > 0.6) {
      sensitivities.push("high-vulnerability emotional disclosure");
    }

    // If anxious, flag abandonment/separation themes
    if (profile.attachment.anxietyLevel > 0.6) {
      sensitivities.push("themes of separation or rejection");
    }

    // If low physical comfort, flag physical intimacy topics
    if (profile.intimacy.physicalComfort < 0.3) {
      sensitivities.push("explicit physical intimacy questions");
    }

    // Conflict triggers
    if (profile.conflict.triggerThemes.length > 0) {
      sensitivities.push(...profile.conflict.triggerThemes.slice(0, 2));
    }

    return sensitivities;
  }

  // ─── Persistence ────────────────────────────────────────────────────────

  private async loadProfile(userId: string): Promise<PersonalityProfile | null> {
    try {
      const memory = getMemoryService(userId);
      const stored = await memory.get(PROFILE_MEMORY_KEY);
      if (stored) {
        return stored as PersonalityProfile;
      }
    } catch (error) {
      console.error("Failed to load personality profile:", error);
    }
    return null;
  }

  private async saveProfile(profile: PersonalityProfile): Promise<void> {
    if (!this.userId) return;
    try {
      const memory = getMemoryService(this.userId);
      await memory.set(PROFILE_MEMORY_KEY, profile);
    } catch (error) {
      console.error("Failed to save personality profile:", error);
    }
  }

  private async storeMemoryNotes(notes: string[]): Promise<void> {
    if (!this.userId) return;
    try {
      const memory = getMemoryService(this.userId);
      const existing = (await memory.get(SIGNALS_MEMORY_KEY)) || [];
      const updated = [
        ...existing,
        ...notes.map((note) => ({ note, timestamp: new Date().toISOString() })),
      ].slice(-50); // Keep last 50 notes
      await memory.set(SIGNALS_MEMORY_KEY, updated);
    } catch (error) {
      console.error("Failed to store memory notes:", error);
    }
  }

  // ─── Empty Profile Factory ──────────────────────────────────────────────

  private createEmptyProfile(userId: string): PersonalityProfile {
    const now = new Date().toISOString();
    return {
      userId,
      createdAt: now,
      updatedAt: now,
      attachment: { anxietyLevel: 0.3, avoidanceLevel: 0.3, observations: [] },
      attachmentStyle: "secure",
      loveLanguages: {
        ranked: [],
        scores: {
          "words-of-affirmation": 0,
          "quality-time": 0,
          "physical-touch": 0,
          "acts-of-service": 0,
          "receiving-gifts": 0,
        },
      },
      conflict: {
        primaryPattern: "validator",
        horsemen: { criticism: 0, contempt: 0, defensiveness: 0, stonewalling: 0 },
        repairCapacity: 0.5,
        triggerThemes: [],
      },
      emotional: {
        opennessToVulnerability: 0.4,
        vocabularyDepth: "moderate",
        processingStyle: "reflective",
        regulationStrategy: "co-regulation",
      },
      values: {
        coreValues: [],
        growthOrientation: 0.5,
        autonomyInterdependence: 0.5,
      },
      intimacy: {
        emotionalComfort: 0.4,
        physicalComfort: 0.3,
        noveltyPreference: 0.5,
        progressionRate: "moderate",
      },
      discovery: {
        currentDay: 1,
        currentPhase: "rhythm",
        dimensionsRevealed: [],
        responsesAnalyzed: 0,
        mirrorDelivered: false,
        startedAt: now,
      },
      confidence: [],
      signals: [],
    };
  }
}

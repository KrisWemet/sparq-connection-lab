import type { CSSProperties } from 'react';

/** A surface's purpose, never a classification of the person using it. */
export type EmotionalArea =
  | 'retreat'
  | 'connect'
  | 'journal'
  | 'games'
  | 'discover'
  | 'insights'
  | 'repair'
  | 'onboarding';

export interface EmotionValues {
  intensity: number;
  warmth: number;
  energy: number;
  depth: number;
  connection: number;
  growth: number;
  calmness: number;
  motionSeconds: number;
  bloom: number;
  flowCoherence: number;
  bridgeStrength: number;
}

/** Future, explicit appearance choices. Do not populate from inferred traits. */
export interface VisualEmotionPreferences {
  warmth?: number;
  energy?: number;
  openness?: number;
  motionSeconds?: number;
}

export const EMOTION_PRESETS: Readonly<Record<EmotionalArea, Readonly<EmotionValues>>> = {
  retreat: {
    intensity: 0.36, warmth: 0.62, energy: 0.22, depth: 0.42,
    connection: 0.36, growth: 0.35, calmness: 0.74, motionSeconds: 26,
    bloom: 0.34, flowCoherence: 0.56, bridgeStrength: 0.35,
  },
  connect: {
    intensity: 0.46, warmth: 0.78, energy: 0.3, depth: 0.44,
    connection: 0.76, growth: 0.3, calmness: 0.6, motionSeconds: 24,
    bloom: 0.3, flowCoherence: 0.58, bridgeStrength: 0.68,
  },
  journal: {
    intensity: 0.25, warmth: 0.55, energy: 0.12, depth: 0.48,
    connection: 0.2, growth: 0.28, calmness: 0.88, motionSeconds: 30,
    bloom: 0.28, flowCoherence: 0.64, bridgeStrength: 0.2,
  },
  games: {
    intensity: 0.5, warmth: 0.7, energy: 0.46, depth: 0.36,
    connection: 0.64, growth: 0.42, calmness: 0.5, motionSeconds: 20,
    bloom: 0.42, flowCoherence: 0.5, bridgeStrength: 0.54,
  },
  discover: {
    intensity: 0.44, warmth: 0.68, energy: 0.36, depth: 0.44,
    connection: 0.54, growth: 0.58, calmness: 0.58, motionSeconds: 24,
    bloom: 0.48, flowCoherence: 0.54, bridgeStrength: 0.46,
  },
  insights: {
    intensity: 0.4, warmth: 0.6, energy: 0.22, depth: 0.56,
    connection: 0.4, growth: 0.68, calmness: 0.72, motionSeconds: 28,
    bloom: 0.5, flowCoherence: 0.68, bridgeStrength: 0.5,
  },
  repair: {
    intensity: 0.18, warmth: 0.58, energy: 0.06, depth: 0.35,
    connection: 0.24, growth: 0.16, calmness: 0.96, motionSeconds: 30,
    bloom: 0.2, flowCoherence: 0.78, bridgeStrength: 0.24,
  },
  onboarding: {
    intensity: 0.5, warmth: 0.7, energy: 0.3, depth: 0.5,
    connection: 0.55, growth: 0.5, calmness: 0.68, motionSeconds: 26,
    bloom: 0.46, flowCoherence: 0.6, bridgeStrength: 0.46,
  },
};

export const INITIAL_VISUAL_GROWTH = 0.15;
const MAX_PRACTICE_DAYS = 100_000;

function finiteClamp(value: number | undefined, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

/**
 * Practice days describe participation, not emotional development or a score.
 * The first day is already beautiful; richness changes slowly over months.
 */
export function practiceDaysToGrowth(practiceDays: number): number {
  const days = finiteClamp(practiceDays, 0, MAX_PRACTICE_DAYS, 0);
  return INITIAL_VISUAL_GROWTH + (1 - INITIAL_VISUAL_GROWTH) * (1 - Math.exp(-Math.max(0, days - 1) / 180));
}

export function resolveEmotion(
  area: EmotionalArea,
  growth = INITIAL_VISUAL_GROWTH,
  preferences: VisualEmotionPreferences = {},
): EmotionValues {
  const preset = EMOTION_PRESETS[area] ?? EMOTION_PRESETS.retreat;
  const richness = (finiteClamp(growth, INITIAL_VISUAL_GROWTH, 1, INITIAL_VISUAL_GROWTH) - INITIAL_VISUAL_GROWTH)
    / (1 - INITIAL_VISUAL_GROWTH);
  const openness = finiteClamp(preferences.openness, 0, 1, 0.5);
  // Repair stays grounded even after a long practice history.
  const enrichment = richness * (area === 'repair' ? 0.35 : 1);
  return {
    intensity: finiteClamp(preset.intensity + enrichment * 0.06 - (openness - 0.5) * 0.12, 0, 1, preset.intensity),
    warmth: finiteClamp(preferences.warmth, 0, 1, preset.warmth + enrichment * 0.06),
    energy: finiteClamp(preferences.energy, 0, 1, preset.energy),
    depth: finiteClamp(preset.depth + enrichment * 0.2, 0, 1, preset.depth),
    connection: finiteClamp(preset.connection + enrichment * 0.12, 0, 1, preset.connection),
    growth: finiteClamp(preset.growth + enrichment * 0.16, 0, 1, preset.growth),
    calmness: preset.calmness,
    motionSeconds: finiteClamp(preferences.motionSeconds, 18, 30, preset.motionSeconds),
    bloom: finiteClamp(preset.bloom + enrichment * 0.26, 0, 1, preset.bloom),
    flowCoherence: finiteClamp(preset.flowCoherence + enrichment * 0.18, 0, 1, preset.flowCoherence),
    bridgeStrength: finiteClamp(preset.bridgeStrength + enrichment * 0.24, 0, 1, preset.bridgeStrength),
  };
}

type EmotionStyle = CSSProperties & Record<`--emotion-${string}`, number | string>;

export function emotionStyle(
  area: EmotionalArea,
  growth = INITIAL_VISUAL_GROWTH,
  preferences?: VisualEmotionPreferences,
): EmotionStyle {
  const emotion = resolveEmotion(area, growth, preferences);
  return {
    '--emotion-intensity': emotion.intensity,
    '--emotion-warmth': emotion.warmth,
    '--emotion-energy': emotion.energy,
    '--emotion-depth': emotion.depth,
    '--emotion-connection': emotion.connection,
    '--emotion-growth': emotion.growth,
    '--emotion-calmness': emotion.calmness,
    '--emotion-motion-duration': `${emotion.motionSeconds}s`,
    '--emotion-bloom': emotion.bloom,
    '--emotion-flow-coherence': emotion.flowCoherence,
    '--emotion-bridge-strength': emotion.bridgeStrength,
  };
}

/**
 * A versioned rendering input, suitable for a future before/after view.
 * Never add text, psychological data, or a partner's activity to this record.
 */
export interface VisualSnapshot {
  readonly version: 1;
  readonly practiceDays: number;
}

export function createVisualSnapshot(practiceDays: unknown): VisualSnapshot | null {
  if (typeof practiceDays !== 'number' || !Number.isSafeInteger(practiceDays)
    || practiceDays < 0 || practiceDays > MAX_PRACTICE_DAYS) return null;
  return { version: 1, practiceDays };
}

export function validateVisualSnapshot(value: unknown): VisualSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (record.version !== 1 || Object.keys(record).some(key => key !== 'version' && key !== 'practiceDays')) return null;
  return createVisualSnapshot(record.practiceDays);
}

export function parseVisualSnapshot(serialized: string | null): VisualSnapshot | null {
  if (!serialized || serialized.length > 128) return null;
  try {
    return validateVisualSnapshot(JSON.parse(serialized));
  } catch {
    return null;
  }
}

export function serializeVisualSnapshot(snapshot: VisualSnapshot): string | null {
  const validated = validateVisualSnapshot(snapshot);
  return validated ? JSON.stringify(validated) : null;
}

/** Missing data, a gap, or a stale response never removes visual richness. */
export function mergeVisualSnapshots(
  current: VisualSnapshot | null,
  incoming: VisualSnapshot | null,
): VisualSnapshot | null {
  if (!incoming || (current && current.practiceDays >= incoming.practiceDays)) return current;
  return incoming;
}

/** Compare factual activity and visual richness; neither is a claim of wellbeing. */
export function compareVisualSnapshots(before: VisualSnapshot, after: VisualSnapshot) {
  return {
    practiceDaysAdded: Math.max(0, after.practiceDays - before.practiceDays),
    richnessAdded: Math.max(0, practiceDaysToGrowth(after.practiceDays) - practiceDaysToGrowth(before.practiceDays)),
  };
}

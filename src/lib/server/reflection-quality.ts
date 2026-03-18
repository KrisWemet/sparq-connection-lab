// Phase 3: Reflection Quality Assessment
// Evaluates user reflection depth to nudge Peter's responses and weight trait confidence.

export interface ReflectionQuality {
  word_count: number;
  depth: 'shallow' | 'moderate' | 'deep';
  has_emotion: boolean;
  has_specific_moment: boolean;
}

const FEELING_WORDS = /\b(happy|sad|frustrated|angry|scared|loved|grateful|anxious|worried|excited|proud|ashamed|hurt|lonely|hopeful|disappointed|overwhelmed|relieved|tender|vulnerable|safe|unsafe|connected|disconnected|appreciated|ignored|heard|misunderstood|supported|abandoned)\b/i;

const TEMPORAL_MARKERS = /\b(today|tonight|this morning|this afternoon|this evening|when we|when I|when they|last night|earlier|just now|at dinner|at lunch|before bed|on the way|during)\b/i;

const LOW_EFFORT_PATTERNS = /^(fine|good|ok|okay|not bad|meh|idk|nothing|same|whatever|it was fine|it was good|it was ok|not much|all good)\b/i;

/**
 * Assess the quality/depth of a user's reflection text.
 */
export function assessReflectionQuality(text: string): ReflectionQuality {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  const word_count = words.length;

  const has_emotion = FEELING_WORDS.test(trimmed);
  const has_specific_moment = TEMPORAL_MARKERS.test(trimmed);
  const is_low_effort = LOW_EFFORT_PATTERNS.test(trimmed);

  let depth: ReflectionQuality['depth'];
  if (word_count < 15 || is_low_effort) {
    depth = 'shallow';
  } else if (word_count >= 50 && (has_emotion || has_specific_moment)) {
    depth = 'deep';
  } else {
    depth = 'moderate';
  }

  return { word_count, depth, has_emotion, has_specific_moment };
}

/**
 * Returns the confidence boost multiplier based on reflection quality.
 */
export function getConfidenceBoost(quality: ReflectionQuality): number {
  switch (quality.depth) {
    case 'deep': return 0.15;
    case 'moderate': return 0.1;
    case 'shallow': return 0.05;
  }
}

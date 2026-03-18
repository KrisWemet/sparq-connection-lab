// Phase 2: Gap-Aware Trait Inference
// Computes which psychological trait dimensions are under-profiled and
// generates subtle steering hints for morning story generation.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface TraitGap {
  trait_key: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

const CORE_TRAITS = ['attachment_style', 'love_language', 'conflict_style'] as const;

/**
 * Compute trait coverage gaps for a user.
 * Returns sorted by priority (high first).
 */
export async function computeTraitGaps(
  supabase: SupabaseClient,
  userId: string,
): Promise<TraitGap[]> {
  const { data: traits } = await supabase
    .from('profile_traits')
    .select('trait_key, confidence')
    .eq('user_id', userId)
    .in('trait_key', [...CORE_TRAITS]);

  const traitMap = new Map<string, number>();
  for (const t of traits || []) {
    traitMap.set(t.trait_key, t.confidence ?? 0);
  }

  const gaps: TraitGap[] = CORE_TRAITS.map(key => {
    const confidence = traitMap.get(key) ?? 0;
    let priority: TraitGap['priority'];
    if (confidence === 0) {
      priority = 'high';
    } else if (confidence < 0.4) {
      priority = 'medium';
    } else {
      priority = 'low';
    }
    return { trait_key: key, confidence, priority };
  });

  // Sort: high > medium > low, then by lowest confidence first
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.confidence - b.confidence);

  return gaps;
}

const STEERING_HINTS: Record<string, string> = {
  love_language:
    'Include a moment where one character notices how the other shows care — through words, actions, a small gift, quality time, or physical closeness',
  attachment_style:
    'Include a moment where one character feels uncertain about the relationship and notice how they respond — do they reach out, pull away, or feel torn',
  conflict_style:
    'Include a moment of mild disagreement and show how the characters handle it — do they talk it through, step back, or get heated',
};

/**
 * Returns a single natural steering hint for the highest-priority trait gap,
 * or null if no steering is needed.
 */
export function getSteeringHint(gaps: TraitGap[]): string | null {
  const target = gaps.find(g => g.priority === 'high' || g.priority === 'medium');
  if (!target) return null;
  return STEERING_HINTS[target.trait_key] ?? null;
}

/**
 * Returns the trait_key being steered toward, for confidence boosting.
 */
export function getSteeredTrait(gaps: TraitGap[]): string | null {
  const target = gaps.find(g => g.priority === 'high' || g.priority === 'medium');
  return target?.trait_key ?? null;
}

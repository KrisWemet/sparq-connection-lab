// Phase 2: Gap-Aware Trait Inference
// Computes which psychological trait dimensions are under-profiled and
// generates subtle steering hints for morning story generation.
//
// Phase 22 (ATTACH-SIGNAL-03): expanded to all 8 pattern dimensions from PATTERN_KEYS.

import type { SupabaseClient } from '@supabase/supabase-js';
import { PATTERN_KEYS } from '@/lib/server/attachment-context';

export interface TraitGap {
  trait_key: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

const CORE_TRAITS = PATTERN_KEYS;

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
  attachment_style:
    'Include a moment where one character feels uncertain about the relationship — notice whether they reach toward the other, pull inward, or feel pulled both ways',
  repair_style:
    'Include a small rupture between the characters — notice how the one who feels it first moves toward repair, whether through a touch, a joke, an honest sentence, or quiet space first',
  reassurance_need:
    'Include a quiet moment where one character is unsure how the other feels about them — notice what kind of signal finally settles them',
  space_preference:
    'Include a moment where the characters need to process something hard — notice whether they stay close, give each other room, or move between the two',
  stress_communication:
    'Include a scene where one character is overwhelmed — notice what shape their communication takes when they reach the edge',
  interpretation_bias:
    'Include a small ambiguous moment between them — a delayed reply, a short answer — and notice how one character makes meaning of it',
  vulnerability_pace:
    'Include a moment where one character has something tender they could share — notice how quickly or slowly they let it surface',
  worth_pattern:
    'Include a quiet moment where one character notices what makes them feel they belong in the relationship — being needed, being chosen, being capable, or simply being themselves',
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

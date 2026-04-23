// src/lib/server/attachment-context.ts
// Single source of truth for the 8 pattern dimensions (Phase 21 vocabulary contract).
// Downstream phases 22-24 depend on this module's type signature and null-safety contract.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProfileTrait } from '@/lib/peterService';

// ─── VOCABULARY ────────────────────────────────────────────────────────────────

export const PATTERN_KEYS = [
  'attachment_style',
  'repair_style',
  'reassurance_need',
  'space_preference',
  'stress_communication',
  'interpretation_bias',
  'vulnerability_pace',
  'worth_pattern',
] as const;

export type PatternKey = typeof PATTERN_KEYS[number];

/**
 * Allowed values for each pattern dimension.
 * Mirrors the vocabulary documented in the migration file.
 * Validation is enforced here in application code — not by SQL constraints.
 */
export const VALID_PATTERN_VALUES: Record<PatternKey, Set<string>> = {
  attachment_style:    new Set(['reaches_out', 'steps_back', 'feels_torn', 'feels_steady']),
  repair_style:        new Set(['reaches_out_first', 'needs_space_first', 'uses_humor', 'wants_direct_talk']),
  reassurance_need:    new Set(['frequent_check_ins', 'words_matter_most', 'actions_over_words', 'figures_it_out']),
  space_preference:    new Set(['process_together', 'process_alone_first', 'moves_between_both']),
  stress_communication: new Set(['goes_quiet', 'talks_it_through', 'gets_louder', 'needs_to_move_first']),
  interpretation_bias: new Set(['assumes_the_best', 'looks_for_patterns', 'takes_it_personally', 'asks_directly']),
  vulnerability_pace:  new Set(['opens_up_early', 'opens_slowly', 'needs_full_safety', 'struggles_to_open']),
  worth_pattern:       new Set(['tied_to_being_needed', 'tied_to_being_chosen', 'tied_to_achieving', 'relatively_stable']),
};

// ─── TYPE ──────────────────────────────────────────────────────────────────────

/**
 * All 8 inferred pattern dimensions for a user.
 * Every field is `string | null` — never `undefined`.
 * A user with no profile_traits rows returns all-null.
 */
export interface PatternContext {
  attachment_style:    string | null;
  repair_style:        string | null;
  reassurance_need:    string | null;
  space_preference:    string | null;
  stress_communication: string | null;
  interpretation_bias: string | null;
  vulnerability_pace:  string | null;
  worth_pattern:       string | null;
}

// ─── BUILDER ──────────────────────────────────────────────────────────────────

/**
 * Reads all 8 pattern dimensions from profile_traits for the given user.
 *
 * - Only dimensions with effective_weight >= 0.3 are populated; others stay null.
 * - Out-of-vocabulary values are silently discarded.
 * - Never throws — any DB error returns a fully-null PatternContext.
 *
 * This is the single entry point for reading pattern dimensions.
 * Phases 22-24 depend on this function's null-safety contract.
 */
export async function buildPatternContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<PatternContext> {
  // Initialize every field to null explicitly — no field ever returns undefined
  const context: PatternContext = {
    attachment_style:    null,
    repair_style:        null,
    reassurance_need:    null,
    space_preference:    null,
    stress_communication: null,
    interpretation_bias: null,
    vulnerability_pace:  null,
    worth_pattern:       null,
  };

  try {
    const { data } = await supabase
      .from('profile_traits')
      .select('trait_key, inferred_value, effective_weight')
      .eq('user_id', userId)
      .in('trait_key', [...PATTERN_KEYS])
      .gte('effective_weight', 0.3); // threshold applied at DB layer

    for (const row of data || []) {
      const key = row.trait_key as PatternKey;
      const allowed = VALID_PATTERN_VALUES[key];
      // Vocabulary guard: discard unknown or out-of-vocab values
      if (!allowed || !allowed.has(row.inferred_value)) continue;
      context[key] = row.inferred_value;
    }
  } catch {
    // Non-blocking — return all-null context on any DB error.
    // Callers must treat every dimension as optional.
  }

  return context;
}

// ─── CONVERSION HELPER ────────────────────────────────────────────────────────

/**
 * Converts a PatternContext to a ProfileTrait[] compatible with buildPersonalizedPrompt.
 *
 * Only non-null dimensions are included. The synthesized traits use
 * confidence: 1.0 and effective_weight: 1.0 because buildPatternContext already
 * applied the effective_weight >= 0.3 threshold at the DB layer.
 *
 * buildPersonalizedPrompt only reads trait_key and inferred_value; the numeric
 * fields are included to satisfy the ProfileTrait interface shape.
 */
export function patternContextToTraits(ctx: PatternContext): ProfileTrait[] {
  const traits: ProfileTrait[] = [];
  for (const key of PATTERN_KEYS) {
    const value = ctx[key];
    if (value !== null) {
      traits.push({
        trait_key: key,
        inferred_value: value,
        confidence: 1.0,
        effective_weight: 1.0,
      });
    }
  }
  return traits;
}

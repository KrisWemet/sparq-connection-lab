/**
 * attachment-context.ts
 *
 * Single source of truth for reading the 8 pattern dimensions from profile_traits.
 * This module is the stable interface that phases 22-24 depend on.
 *
 * Contract (load-bearing for downstream phases):
 * - buildPatternContext NEVER throws — any DB error returns all-null PatternContext
 * - Missing dimensions are always null, never undefined
 * - Only dimensions with effective_weight >= 0.3 are populated; others return null
 * - All values use plain behavioral language — no clinical labels
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProfileTrait } from '@/lib/peterService';

// ─── Pattern Dimension Keys ───────────────────────────────────────────────────

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

// ─── Vocabulary Constants (D-01 through D-08) ─────────────────────────────────

/**
 * Allowed values per dimension. Validation is enforced in application code,
 * not in SQL constraints. Values arriving from DB that are not in these Sets
 * are silently discarded (vocab guard).
 */
export const VALID_PATTERN_VALUES: Record<PatternKey, Set<string>> = {
  // D-01: How someone seeks or creates distance when they feel uncertain
  attachment_style: new Set(['reaches_out', 'steps_back', 'feels_torn', 'feels_steady']),

  // D-02: How someone initiates reconnection after friction
  repair_style: new Set(['reaches_out_first', 'needs_space_first', 'uses_humor', 'wants_direct_talk']),

  // D-03: How much external confirmation someone needs to feel secure
  reassurance_need: new Set(['frequent_check_ins', 'words_matter_most', 'actions_over_words', 'figures_it_out']),

  // D-04: How someone manages personal energy within the relationship
  space_preference: new Set(['process_together', 'process_alone_first', 'moves_between_both']),

  // D-05: How someone communicates when overwhelmed or stressed
  stress_communication: new Set(['goes_quiet', 'talks_it_through', 'gets_louder', 'needs_to_move_first']),

  // D-06: How someone interprets ambiguous partner behavior
  interpretation_bias: new Set(['assumes_the_best', 'looks_for_patterns', 'takes_it_personally', 'asks_directly']),

  // D-07: The pace at which someone opens up emotionally
  vulnerability_pace: new Set(['opens_up_early', 'opens_slowly', 'needs_full_safety', 'struggles_to_open']),

  // D-08: What makes someone feel worthy within the relationship
  worth_pattern: new Set(['tied_to_being_needed', 'tied_to_being_chosen', 'tied_to_achieving', 'relatively_stable']),
};

// ─── PatternContext Type (D-13) ───────────────────────────────────────────────

/**
 * All 8 pattern dimensions. Every field is string | null — never undefined.
 * A user with no profile_traits rows returns an object with all 8 set to null.
 */
export interface PatternContext {
  attachment_style: string | null;
  repair_style: string | null;
  reassurance_need: string | null;
  space_preference: string | null;
  stress_communication: string | null;
  interpretation_bias: string | null;
  vulnerability_pace: string | null;
  worth_pattern: string | null;
}

// ─── Builder (D-14, D-15) ────────────────────────────────────────────────────

/**
 * Reads the 8 pattern dimensions from profile_traits for the given userId.
 *
 * - Single Supabase query with .in('trait_key', PATTERN_KEYS) — not 8 separate queries
 * - effective_weight >= 0.3 filter applied at DB layer (D-15)
 * - Vocab guard discards out-of-vocabulary values (D-09)
 * - NEVER throws — try/catch returns all-null context on any error
 * - Every field initialized to null before query (prevents undefined leaking)
 *
 * Callers MUST pass userId from an authenticated context (getAuthedContext).
 * RLS also enforces user isolation at the DB layer.
 */
export async function buildPatternContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<PatternContext> {
  // Initialize every field to null explicitly — prevents undefined (Pitfall 3)
  const context: PatternContext = {
    attachment_style: null,
    repair_style: null,
    reassurance_need: null,
    space_preference: null,
    stress_communication: null,
    interpretation_bias: null,
    vulnerability_pace: null,
    worth_pattern: null,
  };

  try {
    const { data } = await supabase
      .from('profile_traits')
      .select('trait_key, inferred_value, effective_weight')
      .eq('user_id', userId)
      .in('trait_key', [...PATTERN_KEYS])
      .gte('effective_weight', 0.3); // D-15: threshold applied at DB layer

    for (const row of data || []) {
      const key = row.trait_key as PatternKey;
      const allowed = VALID_PATTERN_VALUES[key];
      if (!allowed || !allowed.has(row.inferred_value)) continue; // vocab guard per D-09
      context[key] = row.inferred_value;
    }
  } catch {
    // Non-blocking — return all-null context on any DB or network error
    // Mirrors existing non-blocking pattern from peter/morning.ts
  }

  return context;
}

// ─── Legacy Trait Reader (D-19, D-20, D-21, D-22) ────────────────────────────

/**
 * Reads love_language + conflict_style from profile_traits.
 *
 * These two keys remain a separate "legacy" surface (D-21) — they predate the
 * pattern vocabulary work and are NOT part of the 8-dimension PatternContext.
 * Phase 23 callers (morning.ts, chat.ts) use this helper INSTEAD OF an inline
 * profile_traits query so neither file contains a direct .from('profile_traits')
 * call after Phase 23 (criterion 5).
 *
 * Returns ProfileTrait[] for direct splatting into the existing traits array
 * passed to buildPersonalizedPrompt (D-22, minimal call-site diff).
 *
 * Mirrors buildPatternContext non-blocking contract: NEVER throws — returns []
 * on any DB or network error.
 *
 * Filter: effective_weight >= 0.3 (matches existing call sites, D-19).
 */
export async function buildLegacyTraits(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileTrait[]> {
  try {
    const { data } = await supabase
      .from('profile_traits')
      .select('trait_key, inferred_value, confidence, effective_weight')
      .eq('user_id', userId)
      .in('trait_key', ['love_language', 'conflict_style'])
      .gte('effective_weight', 0.3);
    return (data || []) as ProfileTrait[];
  } catch {
    return [];
  }
}

// ─── Conversion Helper (D-18) ────────────────────────────────────────────────

/**
 * Converts a PatternContext to ProfileTrait[] compatible with buildPersonalizedPrompt.
 *
 * Only non-null dimensions are included. Since buildPatternContext already applied
 * the effective_weight >= 0.3 threshold, synthesized traits use confidence: 1.0
 * and effective_weight: 1.0. buildPersonalizedPrompt only reads trait_key and
 * inferred_value to look up TRAIT_DESCRIPTIONS — the numeric fields are not used
 * for further filtering in that function.
 *
 * Usage:
 *   const ctx = await buildPatternContext(supabase, userId);
 *   const traits = patternContextToTraits(ctx);
 *   buildPersonalizedPrompt(traits, memories, basePrompt, options);
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

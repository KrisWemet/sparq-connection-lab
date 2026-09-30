import { peterChat } from '@/lib/openrouter';
import { getProfileAnalysisPrompt, PeterMessage } from '@/lib/peterService';
import { addDistilledMemories, MEMORY_KINDS, type DistilledMemory, type MemoryKind } from '@/lib/server/memory';
import { newTraitFields, reviseTrait, type TraitRow } from '@/lib/server/trait-revision';
import { maybeExtractBaseline } from '@/lib/server/baseline-snapshot';
import { loadPrivacyState } from '@/lib/server/privacy';
import { assessReflectionQuality, getConfidenceBoost } from '@/lib/server/reflection-quality';
import { VALID_PATTERN_VALUES } from '@/lib/server/attachment-context';
import type { SupabaseClient } from '@supabase/supabase-js';

interface TraitAnalysis {
  // 8 pattern dimensions (Phase 21 vocabulary)
  attachment_style?: string | null;
  repair_style?: string | null;
  reassurance_need?: string | null;
  space_preference?: string | null;
  stress_communication?: string | null;
  interpretation_bias?: string | null;
  vulnerability_pace?: string | null;
  worth_pattern?: string | null;
  // Legacy traits (still inferred, still used by Peter morning/chat personalization)
  love_language?: string | null;
  conflict_style?: string | null;
  // Emotional baseline (written to user_insights, not profile_traits)
  emotional_state?: string | null;
  reasoning?: string;
  // Person Model V1 (docs/PERSON_MODEL.md §5)
  memories?: Array<{ text?: unknown; kind?: unknown; importance?: unknown }> | null;
  self_discovery?: string | null;
  intention?: string | null;
}

// Traits that would hurt if said clumsily (docs/PERSON_MODEL.md §2).
const SENSITIVE_TRAITS = new Set(['worth_pattern']);

/** Keep only well-formed distilled memories — max 3, short, known kinds. */
export function sanitizeDistilledMemories(raw: TraitAnalysis['memories']): DistilledMemory[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(m => m && typeof m.text === 'string' && m.text.trim().length > 0)
    .filter(m => MEMORY_KINDS.includes(m.kind as MemoryKind))
    .slice(0, 3)
    .map(m => ({
      text: (m.text as string).trim().slice(0, 280),
      kind: m.kind as MemoryKind,
      importance: typeof m.importance === 'number' ? Math.min(1, Math.max(0, m.importance)) : 0.5,
    }));
}

function cleanUserText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') return null;
  return trimmed.slice(0, maxLength);
}

// All trait keys that get upserted to profile_traits.
// 8 PATTERN_KEYS + love_language + conflict_style (which remain in legacy validation).
const TRAIT_KEYS = [
  'attachment_style',
  'repair_style',
  'reassurance_need',
  'space_preference',
  'stress_communication',
  'interpretation_bias',
  'vulnerability_pace',
  'worth_pattern',
  'love_language',
  'conflict_style',
] as const;

// Vocab guard: combine the 8 pattern dimensions (single source of truth in attachment-context.ts)
// with love_language and conflict_style (legacy traits not part of PATTERN_KEYS).
const VALID_TRAIT_VALUES: Record<string, Set<string>> = {
  ...VALID_PATTERN_VALUES,
  love_language: new Set(['words', 'acts', 'gifts', 'time', 'touch']),
  conflict_style: new Set(['avoidant', 'volatile', 'validating']),
};

/**
 * Analyzes a user's evening reflection: revises trait hypotheses, stores only
 * distilled memories worth keeping, and records self-discoveries/intentions.
 * Runs fire-and-forget — never blocks the session completion response.
 */
export async function analyzeProfileTraits(
  supabase: SupabaseClient,
  userId: string,
  eveningReflection: string,
  eveningPeterResponse: string,
  sessionId?: string | null,
): Promise<void> {
  try {
    const privacy = await loadPrivacyState(supabase, userId);
    if (!privacy.can_analyze_profile) {
      return;
    }

    const messages: PeterMessage[] = [
      { role: 'user', content: eveningReflection },
      { role: 'assistant', content: eveningPeterResponse },
    ];

    const prompt = getProfileAnalysisPrompt(messages);

    const raw = await peterChat({
      messages: [
        { role: 'system', content: 'You are a relationship psychology analyst. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      maxTokens: 700,
    });

    // Parse the JSON response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Profile analysis: could not parse JSON from response');
      return;
    }

    const analysis: TraitAnalysis = JSON.parse(jsonMatch[0]);

    // Phase 3: Quality-weighted confidence adjustment
    const quality = assessReflectionQuality(eveningReflection);
    const boost = getConfidenceBoost(quality);

    // Revise each observed trait as a hypothesis with evidence
    // (docs/PERSON_MODEL.md §4) — never flip on a single contradiction.
    const evidenceNote = typeof analysis.reasoning === 'string' ? analysis.reasoning.slice(0, 200) : undefined;
    for (const key of TRAIT_KEYS) {
      const value = analysis[key];
      if (!value) continue;

      // Validate against allowed enum values — discard garbage
      const allowed = VALID_TRAIT_VALUES[key];
      if (allowed && !allowed.has(value)) {
        console.warn(`Profile analysis: invalid ${key} value "${value}", skipping`);
        continue;
      }

      const observation = { value, boost, source: 'evening_reflection', note: evidenceNote };

      const { data: existing } = await supabase
        .from('profile_traits')
        .select('id, inferred_value, confidence, status, evidence, counter_evidence, candidate_value, candidate_confidence')
        .eq('user_id', userId)
        .eq('trait_key', key)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('profile_traits')
          .update(reviseTrait(existing as TraitRow, observation))
          .eq('id', existing.id);
      } else {
        await supabase.from('profile_traits').insert({
          user_id: userId,
          trait_key: key,
          effective_weight: 1.0,
          sensitivity: SENSITIVE_TRAITS.has(key) ? 'sensitive' : 'normal',
          ...newTraitFields(observation),
        });
      }
    }

    const memoryWindow = privacy.preferences.memory_window;

    if (privacy.can_store_memories) {
      // Only what is worth remembering is stored (constitution §2, §4).
      // An empty list is a valid outcome — raw transcripts are not stored.
      const metadata: Record<string, any> = { source: 'evening_reflection' };
      if (memoryWindow === '90_days') {
        metadata.expires_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      }
      try {
        await addDistilledMemories(userId, sanitizeDistilledMemories(analysis.memories), metadata);
      } catch (memError) {
        console.error('Memory extraction error (non-blocking):', memError);
      }

      // Growth trace: the user's own words (never Peter's), kept only so the
      // growth engine can pair then-vs-now moments (§11). Excluded from
      // Peter's retrieval by match_memories_ranked.
      try {
        await addDistilledMemories(
          userId,
          [{ text: `user: ${eveningReflection.slice(0, 1000)}`, kind: 'growth', importance: 0.1 }],
          { ...metadata, trace: true },
        );
      } catch (traceError) {
        console.error('Growth trace error (non-blocking):', traceError);
      }

      // Self-discoveries and intentions are first-class records (§13).
      const discovery = cleanUserText(analysis.self_discovery, 300);
      if (discovery) {
        await supabase.from('self_discoveries').insert({
          user_id: userId,
          discovery,
          source: 'evening',
          session_id: sessionId ?? null,
        });
      }
      const intention = cleanUserText(analysis.intention, 300);
      if (intention) {
        const checkIn = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        await supabase.from('experiments').insert({
          user_id: userId,
          intention,
          origin: 'user',
          check_in_on: checkIn,
          session_id: sessionId ?? null,
        });
      }

      // Growth Engine — one-time baseline extraction (spec §3.2).
      // Fire-and-forget; runs only until a baseline_snapshot exists.
      maybeExtractBaseline(supabase, userId).catch(() => {});
    }

    // Update emotional_state in user_insights
    if (analysis.emotional_state) {
      await supabase
        .from('user_insights')
        .update({
          emotional_state: analysis.emotional_state,
          last_analysis_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }
  } catch (error) {
    // Silently log — never let analysis errors bubble up
    console.error('Profile analysis error (non-blocking):', error);
  }
}

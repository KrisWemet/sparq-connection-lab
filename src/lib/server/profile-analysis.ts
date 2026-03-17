import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT, getProfileAnalysisPrompt, PeterMessage } from '@/lib/peterService';
import { addMemory } from '@/lib/server/memory';
import type { SupabaseClient } from '@supabase/supabase-js';

interface TraitAnalysis {
  attachment_style?: string | null;
  love_language?: string | null;
  conflict_style?: string | null;
  emotional_state?: string | null;
  reasoning?: string;
}

const TRAIT_KEYS = ['attachment_style', 'love_language', 'conflict_style'] as const;

const VALID_TRAIT_VALUES: Record<string, Set<string>> = {
  attachment_style: new Set(['anxious', 'avoidant', 'disorganized', 'secure']),
  love_language: new Set(['words', 'acts', 'gifts', 'time', 'touch']),
  conflict_style: new Set(['avoidant', 'volatile', 'validating']),
};

/**
 * Silently analyzes a user's evening reflection to infer personality traits.
 * Runs fire-and-forget — never blocks the session completion response.
 */
export async function analyzeProfileTraits(
  supabase: SupabaseClient,
  userId: string,
  eveningReflection: string,
  eveningPeterResponse: string,
): Promise<void> {
  try {
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
      maxTokens: 300,
    });

    // Parse the JSON response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Profile analysis: could not parse JSON from response');
      return;
    }

    const analysis: TraitAnalysis = JSON.parse(jsonMatch[0]);

    // Upsert each non-null trait into profile_traits
    for (const key of TRAIT_KEYS) {
      const value = analysis[key];
      if (!value) continue;

      // Validate against allowed enum values — discard garbage
      const allowed = VALID_TRAIT_VALUES[key];
      if (allowed && !allowed.has(value)) {
        console.warn(`Profile analysis: invalid ${key} value "${value}", skipping`);
        continue;
      }

      // Check if this trait already exists
      const { data: existing } = await supabase
        .from('profile_traits')
        .select('id, inferred_value, confidence')
        .eq('user_id', userId)
        .eq('trait_key', key)
        .maybeSingle();

      if (existing) {
        const sameValue = existing.inferred_value === value;
        // If the same value keeps appearing, confidence grows; otherwise it drops
        const newConfidence = sameValue
          ? Math.min(1.0, (existing.confidence || 0.3) + 0.1)
          : Math.max(0.1, (existing.confidence || 0.3) - 0.15);

        await supabase
          .from('profile_traits')
          .update({
            inferred_value: sameValue ? existing.inferred_value : value,
            confidence: newConfidence,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Insert new trait with low initial confidence
        await supabase.from('profile_traits').insert({
          user_id: userId,
          trait_key: key,
          inferred_value: value,
          confidence: 0.3,
          effective_weight: 1.0,
        });
      }
    }

    // Check memory_window preference before storing memories
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('memory_window')
      .eq('user_id', userId)
      .maybeSingle();

    const memoryWindow = prefs?.memory_window || 'indefinite';

    if (memoryWindow !== 'none') {
      try {
        const metadata: Record<string, any> = { source: 'evening_reflection' };
        if (memoryWindow === '90_days') {
          metadata.expires_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
        }
        await addMemory(userId, [
          { role: 'user', content: eveningReflection },
          { role: 'assistant', content: eveningPeterResponse },
        ], metadata);
      } catch (memError) {
        console.error('Memory extraction error (non-blocking):', memError);
      }
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

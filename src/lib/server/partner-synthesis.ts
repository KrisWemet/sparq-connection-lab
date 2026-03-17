import { peterChat } from '@/lib/openrouter';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Generates a synthesis of two partners' reflections on the same day.
 * Uses canonical UUID ordering (user_a_id = min) for idempotent upsert key.
 */
export async function generatePartnerSynthesis(
  supabase: SupabaseClient,
  userId1: string,
  userId2: string,
  dayIndex: number,
  reflection1: string,
  reflection2: string,
): Promise<void> {
  // Canonical ordering so unique constraint (user_a_id, user_b_id, day_index) is always satisfied
  const [userAId, userBId, reflectionA, reflectionB] =
    userId1 < userId2
      ? [userId1, userId2, reflection1, reflection2]
      : [userId2, userId1, reflection2, reflection1];

  // Check if synthesis already exists
  const { data: existing } = await supabase
    .from('partner_syntheses')
    .select('id')
    .eq('user_a_id', userAId)
    .eq('user_b_id', userBId)
    .eq('day_index', dayIndex)
    .maybeSingle();

  if (existing) return;

  const prompt = `Two partners each reflected on Day ${dayIndex} of their relationship growth journey.

Partner A shared: "${reflectionA}"
Partner B shared: "${reflectionB}"

Write a 3-4 sentence synthesis for both of them to read together. Rules:
- Use "you both" framing throughout
- Highlight what you see in common (even if they described things differently)
- Include one gentle, specific difference you noticed — framed warmly, not as criticism
- Do NOT reveal who said what — blend the two voices as one shared experience
- Warm, encouraging tone — like a thoughtful friend reflecting back what they heard
- No clinical terms`;

  const synthesis = await peterChat({
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 300,
  });

  await supabase.from('partner_syntheses').insert({
    user_a_id: userAId,
    user_b_id: userBId,
    day_index: dayIndex,
    synthesis,
  });
}

import type { SupabaseClient } from '@supabase/supabase-js';
import { peterChat } from '@/lib/openrouter';
import { stripMarkdown } from '@/lib/strip-markdown';

/**
 * Fire-and-forget greeting generator — call without await.
 * Writes Peter's next greeting to user_insights.next_greeting_text.
 *
 * For daily sessions: pass evening_reflection + day_index + journeyTitle.
 * For rehearsal sessions: pass peter_anchor as `reflection`, dayIndex=0, journeyTitle=null.
 */
export async function generateGreeting(
  supabase: SupabaseClient,
  userId: string,
  reflection: string,
  dayIndex: number,
  journeyTitle?: string | null,
): Promise<void> {
  try {
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .maybeSingle();

    const firstName = profileRow?.name?.split(' ')[0] || '';
    const journeyCtx = journeyTitle ? ` on ${journeyTitle}` : '';

    const greetingPrompt = `Generate a warm, brief morning greeting from Peter the otter for tomorrow.

Context from today's session:
- The user reflected: "${(reflection || '').slice(0, 200)}"
- Day ${dayIndex}${journeyCtx}
${firstName ? `- User's first name: ${firstName}` : ''}

Write ONE sentence (max 30 words) that references something specific from today. Warm and forward-looking. Simple language.
Output ONLY the greeting text.`;

    const rawGreeting = await peterChat({
      messages: [
        { role: 'system', content: 'You are Peter, a warm otter companion. Write a brief, personalized morning greeting.' },
        { role: 'user', content: greetingPrompt },
      ],
      maxTokens: 100,
    });

    const greeting = stripMarkdown(rawGreeting).trim();
    await supabase
      .from('user_insights')
      .upsert(
        { user_id: userId, next_greeting_text: greeting },
        { onConflict: 'user_id' }
      );
  } catch (err) {
    console.error('Greeting generation background error:', err);
  }
}

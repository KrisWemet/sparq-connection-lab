import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';
import { peterChat } from '@/lib/openrouter';
import {
  buildPersonalizedPrompt,
  PETER_SYSTEM_PROMPT,
  type ProfileTrait,
  type MemoryResult,
} from '@/lib/peterService';
import { searchMemories } from '@/lib/server/memory';
import { loadPrivacyState } from '@/lib/server/privacy';
import { stripMarkdown } from '@/lib/strip-markdown';

type EveningCheckinBody = {
  session_id: string;
  reflection_text: string;
  practice_attempted: boolean | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as EveningCheckinBody;
  if (!body.session_id || !body.reflection_text) {
    return res.status(400).json({ error: 'session_id and reflection_text are required' });
  }

  // Fetch the session — must exist and belong to this user
  const { data: session, error: findError } = await ctx.supabase
    .from('daily_sessions')
    .select('*')
    .eq('id', body.session_id)
    .eq('user_id', ctx.userId)
    .single();

  if (findError || !session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Must have morning content to do evening check-in
  if (!session.morning_action) {
    return res.status(400).json({ error: 'Morning session must be completed first' });
  }

  // Build personalized system prompt
  let systemPrompt = PETER_SYSTEM_PROMPT;
  try {
    const privacy = await loadPrivacyState(ctx.supabase, ctx.userId);
    if (privacy.can_personalize) {
      const [traitsResult, memResult, profileResult, insightsResult] = await Promise.all([
        ctx.supabase
          .from('profile_traits')
          .select('trait_key, inferred_value, confidence, effective_weight')
          .eq('user_id', ctx.userId)
          .gte('effective_weight', 0.3),
        privacy.can_store_memories
          ? searchMemories(ctx.userId, body.reflection_text, 5).catch(() => ({ results: [] }))
          : Promise.resolve({ results: [] }),
        ctx.supabase
          .from('profiles')
          .select('name, partner_name')
          .eq('id', ctx.userId)
          .maybeSingle(),
        ctx.supabase
          .from('user_insights')
          .select('emotional_state')
          .eq('user_id', ctx.userId)
          .maybeSingle(),
      ]);

      const traits: ProfileTrait[] = traitsResult.data || [];
      const memories: MemoryResult[] = (memResult?.results || []).map((r: any) => ({
        memory: r.memory || r.content || '',
        score: r.score,
      }));

      systemPrompt = buildPersonalizedPrompt(traits, memories, PETER_SYSTEM_PROMPT, {
        userName: profileResult.data?.name,
        partnerName: profileResult.data?.partner_name,
        relationshipMode: privacy.preferences.relationship_mode,
        emotionalState: insightsResult.data?.emotional_state ?? null,
        surface: 'evening',
      });
    }
  } catch (err) {
    console.error('Personalization error (falling back to base prompt):', err);
  }

  const journeyCtx = session.journey_title ? ` (${session.journey_title})` : '';
  const practiceNote = body.practice_attempted === true
    ? 'The user says they attempted the practice.'
    : body.practice_attempted === false
      ? 'The user says they didn\'t get to the practice today.'
      : '';

  systemPrompt += `\n\nEVENING CHECK-IN CONTEXT (Day ${session.day_index}${journeyCtx}):
Today's action was: "${session.morning_action}"
${practiceNote}

This is a brief evening check-in (NOT a full session). Keep your response to 3-4 sentences max.
Reflect back what you heard warmly. Celebrate effort, not outcome.
If they share something meaningful, acknowledge the depth.
End with a warm closing that connects to tomorrow.
Do NOT ask follow-up questions — this is a single-turn check-in.

ALSO: In your response, assess the emotional tone and detect if this is a significant growth moment.
Return your response in this JSON format:
{
  "peter_response": "Your warm response to the user (plain text, no markdown)",
  "emotional_tone": "one word describing their emotional state (e.g. hopeful, calm, frustrated, grateful, tender, proud)",
  "is_significant": true/false (true only if this represents a genuine breakthrough or pattern shift — be conservative),
  "significance_label": "If significant, a short label like 'First time pausing before reacting' (null if not significant)"
}

Output ONLY valid JSON. No text outside the JSON object.`;

  try {
    const rawResponse = await peterChat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: body.reflection_text },
      ],
      maxTokens: 512,
    });

    // Parse the structured response
    let peterResponse: string;
    let emotionalTone: string | null = null;
    let isSignificant = false;
    let significanceLabel: string | null = null;

    try {
      const parsed = JSON.parse(rawResponse);
      peterResponse = stripMarkdown(parsed.peter_response || rawResponse);
      emotionalTone = parsed.emotional_tone || null;
      isSignificant = parsed.is_significant === true;
      significanceLabel = parsed.significance_label || null;
    } catch {
      // LLM didn't return valid JSON — use raw response
      peterResponse = stripMarkdown(rawResponse);
    }

    // Update the session with evening check-in data
    const { error: updateError } = await ctx.supabase
      .from('daily_sessions')
      .update({
        evening_reflection: body.reflection_text,
        evening_peter_response: peterResponse,
        practice_attempted: body.practice_attempted,
        evening_emotional_tone: emotionalTone,
        evening_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.session_id)
      .eq('user_id', ctx.userId);

    if (updateError) {
      console.error('Failed to update session:', updateError);
      return res.status(500).json({ error: 'Failed to save evening check-in' });
    }

    // Fire-and-forget: create growth thread entry if significant
    if (isSignificant && significanceLabel) {
      ctx.supabase.from('growth_thread').insert({
        user_id: ctx.userId,
        date: session.session_local_date || new Date().toISOString().slice(0, 10),
        label: significanceLabel,
        type: 'breakthrough',
        journey_id: session.journey_id || null,
        detail: peterResponse,
      });
    }

    // Fire-and-forget: generate tomorrow's greeting
    generateNextGreeting(ctx, session, body.reflection_text, peterResponse, emotionalTone);

    // Fire-and-forget: track event
    trackEvent(ctx.supabase, ctx.userId, 'evening_checkin_completed', {
      day_index: session.day_index,
      practice_attempted: body.practice_attempted,
      emotional_tone: emotionalTone,
    });

    return res.status(200).json({
      peter_response: peterResponse,
      emotional_tone: emotionalTone,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Evening check-in error:', errMsg);
    return res.status(500).json({ error: 'Peter is taking a nap — try again in a moment' });
  }
}

/**
 * Fire-and-forget: generate Peter's greeting for the next dashboard visit.
 * Stored in user_insights.next_greeting_text.
 */
async function generateNextGreeting(
  ctx: { supabase: any; userId: string },
  session: any,
  reflectionText: string,
  peterResponse: string,
  emotionalTone: string | null,
) {
  try {
    const { data: profile } = await ctx.supabase
      .from('profiles')
      .select('name')
      .eq('id', ctx.userId)
      .maybeSingle();

    const firstName = profile?.name?.split(' ')[0] || '';
    const nameRef = firstName ? `, ${firstName}` : '';
    const journeyCtx = session.journey_title ? ` on ${session.journey_title}` : '';

    const greetingPrompt = `Generate a warm, brief morning greeting from Peter the otter for tomorrow.

Context from tonight's check-in:
- The user reflected: "${reflectionText.slice(0, 200)}"
- Peter observed: "${peterResponse.slice(0, 200)}"
- Emotional tone: ${emotionalTone || 'neutral'}
- They are on Day ${session.day_index}${journeyCtx}
${firstName ? `- User's first name: ${firstName}` : ''}

Write ONE sentence (max 30 words) that:
1. References something specific from tonight (not generic)
2. Feels warm and forward-looking
3. Uses simple language (4th-grade reading level)

Example style: "Good morning${nameRef}. After what you noticed last night about pausing before reacting, today's practice is going to feel different."

Output ONLY the greeting text. No quotes, no JSON, no formatting.`;

    const rawGreeting = await peterChat({
      messages: [
        { role: 'system', content: 'You are Peter, a warm otter companion. Write a brief, personalized morning greeting.' },
        { role: 'user', content: greetingPrompt },
      ],
      maxTokens: 100,
    });

    const greeting = stripMarkdown(rawGreeting).trim();

    await ctx.supabase
      .from('user_insights')
      .upsert(
        { user_id: ctx.userId, next_greeting_text: greeting },
        { onConflict: 'user_id' }
      );
  } catch (err) {
    console.error('Greeting generation background error:', err);
  }
}

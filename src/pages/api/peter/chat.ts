import type { NextApiRequest, NextApiResponse } from 'next';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT, PeterMessage, buildPersonalizedPrompt, type ProfileTrait, type MemoryResult } from '@/lib/peterService';
import { buildCrisisResponse, detectCrisisIntent, resolveCountryCode } from '@/lib/safety';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { resolveEntitlements } from '@/lib/server/entitlements';
import { trackEvent } from '@/lib/server/analytics';
import { searchMemories } from '@/lib/server/memory';
import { loadPrivacyState } from '@/lib/server/privacy';
import { assessReflectionQuality } from '@/lib/server/reflection-quality';
import { stripMarkdown } from '@/lib/strip-markdown';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemOverride, eveningContext } = req.body as {
    messages: PeterMessage[];
    systemOverride?: string;
    eveningContext?: {
      day: number;
      morningAction: string;
      turnNumber: number;
      reflectionPrompt?: string;
      journeyTitle?: string;
    };
  };

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const latestUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

    // Run auth + crisis detection in parallel
    const [authed, crisisDetection] = await Promise.all([
      getAuthedContext(req),
      detectCrisisIntent(latestUserMessage),
    ]);

    if (crisisDetection.triggered) {
      const countryCode = resolveCountryCode(req);
      if (authed) {
        // Fire-and-forget: don't await these
        authed.supabase.from('safety_events').insert({
          user_id: authed.userId,
          crisis_types: crisisDetection.types,
          matched_terms: crisisDetection.matches,
          country_code: countryCode,
          metadata: { source: 'api/peter/chat' },
        });
        trackEvent(authed.supabase, authed.userId, 'crisis_escalation_triggered', {
          country_code: countryCode,
          crisis_types: crisisDetection.types,
        });
      }
      return res.status(200).json({
        message: buildCrisisResponse(countryCode, crisisDetection.types),
        safety: { triggered: true, countryCode, types: crisisDetection.types },
        usage: { remaining_daily_messages: null, limit_reached: false },
      });
    }

    // Check entitlements + usage cap
    let remainingDailyMessages: number | null = null;
    if (authed) {
      const entitlements = await resolveEntitlements(authed.supabase, authed.userId);
      const cap = entitlements.coach_message_limit_per_day;
      if (cap != null) {
        const today = new Date().toISOString().slice(0, 10);
        const { data: usageRow } = await authed.supabase
          .from('coach_usage_daily')
          .select('message_count')
          .eq('user_id', authed.userId)
          .eq('usage_date', today)
          .maybeSingle();

        const used = usageRow?.message_count || 0;
        remainingDailyMessages = Math.max(0, cap - used);

        if (used >= cap) {
          return res.status(200).json({
            message:
              "You've hit today's coach message limit on the free plan. Conflict First Aid is still available anytime, and your next message opens tomorrow.",
            safety: { triggered: false },
            usage: { remaining_daily_messages: 0, limit_reached: true },
          });
        }
      }
    }

    // Build personalized system prompt (traits + memories in parallel)
    let systemPrompt = systemOverride || PETER_SYSTEM_PROMPT;

    if (authed && !systemOverride) {
      try {
        const privacy = await loadPrivacyState(authed.supabase, authed.userId);

        if (privacy.can_personalize) {
          const [traitsResult, memResult, profileResult, insightsResult] = await Promise.all([
            authed.supabase
              .from('profile_traits')
              .select('trait_key, inferred_value, confidence, effective_weight')
              .eq('user_id', authed.userId)
              .gte('effective_weight', 0.3),
            privacy.can_store_memories
              ? searchMemories(authed.userId, latestUserMessage, 5).catch(() => ({ results: [] }))
              : Promise.resolve({ results: [] }),
            authed.supabase
              .from('profiles')
              .select('name, partner_name')
              .eq('id', authed.userId)
              .maybeSingle(),
            authed.supabase
              .from('user_insights')
              .select('emotional_state')
              .eq('user_id', authed.userId)
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
            surface: eveningContext ? 'evening' : 'chat',
          });
        }
      } catch (personalizeError) {
        console.error('Personalization error (falling back to base prompt):', personalizeError);
      }
    }

    // Append evening context with reflection quality nudging (Phase 3)
    if (eveningContext) {
      const { day, morningAction, turnNumber, reflectionPrompt, journeyTitle } = eveningContext;

      // Journey context preamble
      const journeyCtx = journeyTitle ? ` (${journeyTitle})` : '';

      if (turnNumber >= 3) {
        // Natural close — Peter wraps up warmly, no more questions
        systemPrompt += `\n\nEVENING CHECK-IN CONTEXT (Day ${day}${journeyCtx}):\nToday's action was: "${morningAction}"\nThis is the closing message. Give a warm, brief summary of what you heard tonight (2-3 sentences). End with an encouraging closing line like "Rest well — I'll have something new for you tomorrow." Do NOT ask any follow-up questions. Do NOT invite more sharing. This is a natural, satisfying ending to the conversation.`;
      } else {
        const wrapUp = turnNumber >= 2
          ? " This is likely their last message — keep your response warm and brief. Do not ask another question unless their message clearly invites more conversation."
          : '';
        systemPrompt += `\n\nEVENING CHECK-IN CONTEXT (Day ${day}${journeyCtx}):\nToday's action was: "${morningAction}"\nReflect back what you heard warmly. Celebrate effort, not outcome. 3-4 sentences, no clinical terms.${wrapUp}`;

        // Use journey-specific reflection prompt as conversation opener when available
        if (reflectionPrompt && turnNumber === 0) {
          systemPrompt += `\n\nThe reflection question for tonight is: "${reflectionPrompt}". Use this as your opening question instead of a generic prompt. Weave it naturally into your greeting.`;
        }

        // Assess reflection quality and nudge Peter's response style
        const quality = assessReflectionQuality(latestUserMessage);
        if (quality.depth === 'shallow' && turnNumber < 2) {
          systemPrompt += `\n\nThe user's response was brief. Warmly reflect what they shared, then gently invite more detail with a specific follow-up question. Don't pressure — just be curious. Example: "I hear you — can you tell me about one specific moment from today?"`;
        } else if (quality.depth === 'deep') {
          systemPrompt += `\n\nThe user shared something meaningful. Acknowledge the depth and specificity. Celebrate their openness. Don't push for more — honor what they gave you.`;
        }
      }
    }

    // Core LLM call
    const rawMessage = await peterChat({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      maxTokens: 512,
    });
    const message = stripMarkdown(rawMessage);

    // Return response immediately — do usage tracking in the background
    // (Vercel will keep the function alive briefly for fire-and-forget promises)
    if (authed) {
      const today = new Date().toISOString().slice(0, 10);
      const updateUsage = async () => {
        try {
          const { data: usageRow } = await authed.supabase
            .from('coach_usage_daily')
            .select('message_count')
            .eq('user_id', authed.userId)
            .eq('usage_date', today)
            .maybeSingle();
          const nextCount = (usageRow?.message_count || 0) + 1;
          await authed.supabase.from('coach_usage_daily').upsert(
            {
              user_id: authed.userId,
              usage_date: today,
              message_count: nextCount,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,usage_date' }
          );
        } catch {}
      };
      // Fire and forget
      updateUsage();
      trackEvent(authed.supabase, authed.userId, 'coach_message_sent', {
        remaining_daily_messages: remainingDailyMessages,
      });
      if (remainingDailyMessages != null) {
        remainingDailyMessages = Math.max(0, remainingDailyMessages - 1);
      }
    }

    return res.status(200).json({
      message,
      safety: { triggered: false },
      usage: { remaining_daily_messages: remainingDailyMessages, limit_reached: false },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Peter chat error:', errMsg);
    return res.status(500).json({ error: 'Peter is taking a nap — try again in a moment 🦦' });
  }
}

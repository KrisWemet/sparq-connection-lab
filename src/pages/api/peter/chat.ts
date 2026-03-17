import type { NextApiRequest, NextApiResponse } from 'next';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT, PeterMessage, buildPersonalizedPrompt, type ProfileTrait, type MemoryResult } from '@/lib/peterService';
import { buildCrisisResponse, detectCrisisIntent, resolveCountryCode } from '@/lib/safety';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { resolveEntitlements } from '@/lib/server/entitlements';
import { trackEvent } from '@/lib/server/analytics';
import { searchMemories } from '@/lib/server/memory';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemOverride, eveningContext } = req.body as {
    messages: PeterMessage[];
    systemOverride?: string;
    eveningContext?: { day: number; morningAction: string; turnNumber: number };
  };

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const authed = await getAuthedContext(req);
    const latestUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const crisisDetection = await detectCrisisIntent(latestUserMessage);
    if (crisisDetection.triggered) {
      const countryCode = resolveCountryCode(req);
      if (authed) {
        await authed.supabase.from('safety_events').insert({
          user_id: authed.userId,
          crisis_types: crisisDetection.types,
          matched_terms: crisisDetection.matches,
          country_code: countryCode,
          metadata: { source: 'api/peter/chat' },
        });
        await trackEvent(authed.supabase, authed.userId, 'crisis_escalation_triggered', {
          country_code: countryCode,
          crisis_types: crisisDetection.types,
        });
      }
      return res.status(200).json({
        message: buildCrisisResponse(countryCode, crisisDetection.types),
        safety: {
          triggered: true,
          countryCode,
          types: crisisDetection.types,
        },
        usage: {
          remaining_daily_messages: null,
          limit_reached: false,
        },
      });
    }

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
            usage: {
              remaining_daily_messages: 0,
              limit_reached: true,
            },
          });
        }
      }
    }

    // Build personalized system prompt with traits + memories
    let systemPrompt = systemOverride || PETER_SYSTEM_PROMPT;

    if (authed && !systemOverride) {
      try {
        // Fetch user traits
        const { data: traitsData } = await authed.supabase
          .from('profile_traits')
          .select('trait_key, inferred_value, confidence, effective_weight')
          .eq('user_id', authed.userId)
          .gte('effective_weight', 0.3);

        const traits: ProfileTrait[] = traitsData || [];

        // Search memories relevant to the latest message
        let memories: MemoryResult[] = [];
        try {
          const memResult = await searchMemories(authed.userId, latestUserMessage, 5);
          memories = (memResult?.results || []).map((r: any) => ({
            memory: r.memory || r.content || '',
            score: r.score,
          }));
        } catch {
          // Memory search failure is non-blocking
        }

        systemPrompt = buildPersonalizedPrompt(traits, memories, PETER_SYSTEM_PROMPT);
      } catch (personalizeError) {
        console.error('Personalization error (falling back to base prompt):', personalizeError);
      }
    }

    // Append evening context after personalization block
    if (eveningContext) {
      const { day, morningAction, turnNumber } = eveningContext;
      const wrapUp = turnNumber >= 2
        ? " This is their follow-up message — add a warm wrap-up and let them know you'll have something fresh for them tomorrow."
        : '';
      systemPrompt += `\n\nEVENING CHECK-IN CONTEXT (Day ${day}):\nToday's action was: "${morningAction}"\nReflect back what you heard warmly. Celebrate effort, not outcome. 3-4 sentences, no clinical terms.${wrapUp}`;
    }

    const message = await peterChat({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      maxTokens: 512,
    });

    // Outbound Safety Guardrail
    try {
      const outboundModeration = await openai.moderations.create({ input: message });
      if (outboundModeration.results[0].flagged) {
        console.error('Outbound message blocked by safety guardrail');
        return res.status(200).json({ 
          message: "I'm having trouble finding the right words right now. Let's take a deep breath and start fresh.", 
          safety: { triggered: false },
          usage: {
            remaining_daily_messages: remainingDailyMessages,
            limit_reached: false,
          },
        });
      }
    } catch (modError) {
      console.error('Outbound moderation failed, proceeding with caution', modError);
    }

    if (authed) {
      const today = new Date().toISOString().slice(0, 10);
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
      if (remainingDailyMessages != null) {
        remainingDailyMessages = Math.max(0, remainingDailyMessages - 1);
      }
      await trackEvent(authed.supabase, authed.userId, 'coach_message_sent', {
        remaining_daily_messages: remainingDailyMessages,
      });
    }

    return res.status(200).json({
      message,
      safety: { triggered: false },
      usage: {
        remaining_daily_messages: remainingDailyMessages,
        limit_reached: false,
      },
    });
  } catch (error) {
    console.error('Peter chat error:', error);
    return res.status(500).json({ error: 'Peter is taking a nap — try again in a moment 🦦' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT, getMorningStoryPrompt, UserInsights, buildPersonalizedPrompt, type ProfileTrait, type MemoryResult } from '@/lib/peterService';
import { parseMorningContent } from '@/lib/morning-parser';
import { stripMarkdown } from '@/lib/strip-markdown';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { parseLocalDate } from '@/lib/server/date-utils';
import { getRecentMemories } from '@/lib/server/memory';
import { loadPrivacyState } from '@/lib/server/privacy';

// Per-user cache keyed by userId:day
const storyCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

type MorningBody = {
  day: number;
  insights?: Partial<UserInsights>;
  local_date?: string;
};

function composeMorningText(story: string, action?: string | null): string {
  const cleanStory = stripMarkdown(story);
  const cleanAction = action ? stripMarkdown(action) : null;
  if (!cleanAction || cleanAction.length < 3) return cleanStory;
  return `${cleanStory}\n\nToday's Action: ${cleanAction}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { day, insights, local_date } = (req.body || {}) as MorningBody;

  if (!day || day < 1 || day > 365) {
    return res.status(400).json({ error: 'day must be between 1 and 365' });
  }

  try {
    const authed = await getAuthedContext(req);
    const localDate = parseLocalDate(local_date);
    const cacheKey = authed ? `${authed.userId}:${day}` : `anon:${day}`;

    // Deterministic/idempotent guard: if we already have today's content, reuse it.
    if (authed) {
      const { data: existingSession } = await authed.supabase
        .from('daily_sessions')
        .select('morning_story, morning_action')
        .eq('user_id', authed.userId)
        .eq('session_local_date', localDate)
        .maybeSingle();

      if (existingSession?.morning_story) {
        return res.status(200).json({
          story: composeMorningText(existingSession.morning_story, existingSession.morning_action),
          cached: true,
          reused: true,
        });
      }

      const { data: existingEntry } = await authed.supabase
        .from('daily_entries')
        .select('morning_story, morning_action')
        .eq('user_id', authed.userId)
        .eq('day', day)
        .maybeSingle();

      if (existingEntry?.morning_story) {
        return res.status(200).json({
          story: composeMorningText(existingEntry.morning_story, existingEntry.morning_action),
          cached: true,
          reused: true,
        });
      }
    }

    const now = Date.now();
    const cached = storyCache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return res.status(200).json({ story: cached.text, cached: true });
    }

    // Build personalized system prompt if authenticated
    let systemPrompt = PETER_SYSTEM_PROMPT;

    if (authed) {
      try {
        const privacy = await loadPrivacyState(authed.supabase, authed.userId);

        if (privacy.can_personalize) {
          const [traitsResult, profileResult, insightsResult, memResult] = await Promise.all([
            authed.supabase
              .from('profile_traits')
              .select('trait_key, inferred_value, confidence, effective_weight')
              .eq('user_id', authed.userId)
              .gte('effective_weight', 0.3),
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
            privacy.can_store_memories
              ? getRecentMemories(authed.userId, 5).catch(() => ({ results: [] }))
              : Promise.resolve({ results: [] }),
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
            emotionalState: insightsResult.data?.emotional_state ?? insights?.emotional_state ?? null,
            surface: 'morning',
          });
        }
      } catch {
        // Personalization failure is non-blocking
      }
    }

    const prompt = getMorningStoryPrompt(day, insights ?? {});

    const story = await peterChat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      maxTokens: 400,
    });

    const parsed = parseMorningContent(story);
    const normalizedStory = composeMorningText(parsed.story, parsed.action);
    storyCache.set(cacheKey, { text: normalizedStory, timestamp: now });

    if (authed) {
      await authed.supabase.from('daily_entries').upsert(
        {
          user_id: authed.userId,
          day,
          morning_story: parsed.story,
          morning_action: parsed.action,
        },
        { onConflict: 'user_id,day' }
      );
    }

    return res.status(200).json({ story: normalizedStory, cached: false });
  } catch (error) {
    console.error('Peter morning error:', error);
    try {
      const fallbacks = require('@/data/fallbackStories.json');
      const fallbackForDay = fallbacks.find((f: any) => f.day === day);
      if (fallbackForDay) {
        const text = composeMorningText(fallbackForDay.story, fallbackForDay.action);
        return res.status(200).json({ story: text, cached: true, is_fallback: true });
      }
    } catch (e) { /* ignore fallback load error */ }

    return res.status(500).json({ error: 'Peter is still waking up — try again in a moment' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { getMorningStoryPrompt, PETER_SYSTEM_PROMPT, UserInsights } from '@/lib/peterService';
import { peterChat } from '@/lib/openrouter';
import { parseMorningContent } from '@/lib/morning-parser';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { resolveEntitlements } from '@/lib/server/entitlements';
import { getWeekBounds, parseLocalDate } from '@/lib/server/date-utils';
import { trackEvent } from '@/lib/server/analytics';
import { computeTraitGaps, getSteeringHint, getSteeredTrait } from '@/lib/server/trait-gaps';

const dailySessionColumnCache: Record<string, boolean | undefined> = {};

async function dailySessionHasColumn(
  ctx: { supabase: { from: (table: string) => any } },
  column: string
): Promise<boolean> {
  const cached = dailySessionColumnCache[column];
  if (typeof cached === 'boolean') return cached;

  const { error } = await ctx.supabase
    .from('daily_sessions')
    .select(column)
    .limit(1);

  if (!error) {
    dailySessionColumnCache[column] = true;
    return true;
  }

  if (error.code === 'PGRST204') {
    dailySessionColumnCache[column] = false;
    return false;
  }

  // Non-schema errors (e.g., transient network) should not poison cache.
  return false;
}

type StartBody = {
  local_date?: string;
  timezone?: string;
  idempotency_key?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as StartBody;
  const localDate = parseLocalDate(body.local_date);
  const timezone = body.timezone || 'UTC';

  const { data: existingRows, error: existingError } = await ctx.supabase
    .from('daily_sessions')
    .select('*')
    .eq('user_id', ctx.userId)
    .eq('session_local_date', localDate)
    .order('created_at', { ascending: false })
    .limit(1);

  if (existingError) {
    return res.status(500).json({ error: 'Failed to check existing daily session' });
  }

  const existing = existingRows?.[0];

  if (existing) {
    return res.status(200).json({ session: existing, reused: true });
  }

  const entitlements = await resolveEntitlements(ctx.supabase, ctx.userId);
  if (entitlements.loop_limit_per_week != null) {
    const { weekStart, weekEnd } = getWeekBounds(localDate);
    const { count } = await ctx.supabase
      .from('daily_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', ctx.userId)
      .gte('completed_local_date', weekStart)
      .lte('completed_local_date', weekEnd);

    if ((count || 0) >= entitlements.loop_limit_per_week) {
      return res.status(403).json({
        error: 'weekly_loop_limit_reached',
        message: 'You reached your weekly daily-loop limit on the free plan.',
        limit: entitlements.loop_limit_per_week,
      });
    }
  }

  const { data: insightsRow } = await ctx.supabase
    .from('user_insights')
    .select('*')
    .eq('user_id', ctx.userId)
    .maybeSingle();

  const { data: latestCompletedRows, error: latestCompletedError } = await ctx.supabase
    .from('daily_sessions')
    .select('day_index')
    .eq('user_id', ctx.userId)
    .eq('status', 'completed')
    .order('day_index', { ascending: false })
    .limit(1);

  const cursorDay = Math.max(1, insightsRow?.onboarding_day ?? 1);
  let dayIndex = cursorDay;

  // Use completed-session history when available; gracefully fall back on older schemas.
  if (!latestCompletedError) {
    const latestCompletedDay = latestCompletedRows?.[0]?.day_index ?? 0;
    const derivedDayIndex = Math.min(14, Math.max(1, latestCompletedDay + 1));
    dayIndex = derivedDayIndex;
  }

  // Keep the cursor in sync with deterministic progression from completed sessions.
  if (cursorDay !== dayIndex) {
    await ctx.supabase
      .from('user_insights')
      .upsert(
        {
          user_id: ctx.userId,
          onboarding_day: dayIndex,
          last_analysis_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
  }

  const insights: Partial<UserInsights> = {
    attachment_style: insightsRow?.attachment_style,
    love_language: insightsRow?.love_language,
    conflict_style: insightsRow?.conflict_style,
    emotional_state: insightsRow?.emotional_state ?? 'neutral',
    onboarding_day: dayIndex,
  };

  // Phase 2: Compute trait gaps + steering hint
  let steeringHint: string | null = null;
  let steeredTrait: string | null = null;
  try {
    const gaps = await computeTraitGaps(ctx.supabase, ctx.userId);
    steeringHint = getSteeringHint(gaps);
    steeredTrait = getSteeredTrait(gaps);
  } catch (gapErr) {
    console.error('Trait gap computation error (non-blocking):', gapErr);
  }

  // Phase 4: Determine active track for post-day-14 content
  let activeTrack: string | null = null;
  if (dayIndex > 14) {
    try {
      const { data: gradReport } = await ctx.supabase
        .from('graduation_reports')
        .select('recommended_track')
        .eq('user_id', ctx.userId)
        .maybeSingle();

      activeTrack = gradReport?.recommended_track ?? null;

      if (!activeTrack) {
        const { data: topTrack } = await ctx.supabase
          .from('user_skill_tracks')
          .select('track_key')
          .eq('user_id', ctx.userId)
          .order('total_xp', { ascending: false })
          .limit(1)
          .maybeSingle();

        activeTrack = topTrack?.track_key ?? 'communication';
      }
    } catch {
      activeTrack = 'communication';
    }
  }

  let storyRaw = "";
  try {
    storyRaw = await peterChat({
      messages: [
        { role: 'system', content: PETER_SYSTEM_PROMPT },
        { role: 'user', content: getMorningStoryPrompt(dayIndex, insights, steeringHint, activeTrack) },
      ],
      maxTokens: 450,
    });
  } catch (error) {
    console.error('Peter session start LLM error:', error);
    try {
      const fallbacks = require('@/data/fallbackStories.json');
      const fallbackForDay = fallbacks.find((f: any) => f.day === dayIndex) || fallbacks[0];
      storyRaw = `${fallbackForDay.story}\n\nToday's Action: ${fallbackForDay.action}`;
    } catch {
      return res.status(500).json({ error: 'Failed to generate morning story' });
    }
  }

  const { story, action } = parseMorningContent(storyRaw);

  const insertPayload: Record<string, unknown> = {
    user_id: ctx.userId,
    session_local_date: localDate,
    timezone,
    day_index: dayIndex,
    discovery_day: dayIndex,
    status: 'morning_ready',
    phase: 'morning',
    morning_story: story,
    morning_action: action,
    micro_action: action,
    learn_response: story,
    idempotency_key: body.idempotency_key || null,
    active_track: activeTrack || 'communication',
    ...(steeredTrait ? { steered_trait: steeredTrait } : {}),
  };

  if (await dailySessionHasColumn(ctx, 'session_date')) {
    insertPayload.session_date = localDate;
  }
  if (await dailySessionHasColumn(ctx, 'local_date')) {
    insertPayload.local_date = localDate;
  }

  const { data: inserted, error: insertError } = await ctx.supabase
    .from('daily_sessions')
    .insert(insertPayload)
    .select('*')
    .single();

  if (insertError || !inserted) {
    const isDuplicate =
      insertError?.code === '23505' ||
      /duplicate key/i.test(insertError?.message || '');

    if (isDuplicate) {
      const { data: racedRows } = await ctx.supabase
        .from('daily_sessions')
        .select('*')
        .eq('user_id', ctx.userId)
        .eq('session_local_date', localDate)
        .order('created_at', { ascending: false })
        .limit(1);

      const raced = racedRows?.[0];
      if (raced) {
        return res.status(200).json({ session: raced, reused: true, race_recovered: true });
      }
    }

    if (insertError) {
      console.error('Daily session insert error:', insertError);
    }

    return res.status(500).json({ error: 'Failed to create daily session' });
  }

  await ctx.supabase.from('daily_entries').upsert(
    {
      user_id: ctx.userId,
      day: dayIndex,
      morning_story: story,
      morning_action: action,
    },
    { onConflict: 'user_id,day' }
  );

  await trackEvent(ctx.supabase, ctx.userId, 'daily_session_started', {
    day_index: dayIndex,
    local_date: localDate,
    tier: entitlements.tier,
  });

  return res.status(200).json({ session: inserted, reused: false });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { getMorningStoryPrompt, PETER_SYSTEM_PROMPT, UserInsights } from '@/lib/peterService';
import { peterChat } from '@/lib/openrouter';
import { parseMorningContent } from '@/lib/morning-parser';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { resolveEntitlements } from '@/lib/server/entitlements';
import { getWeekBounds, parseLocalDate } from '@/lib/server/date-utils';
import { trackEvent } from '@/lib/server/analytics';
import { trackPrimaryPathServerError } from '@/lib/server/beta-ops';
import { computeTraitGaps, getSteeringHint, getSteeredTrait } from '@/lib/server/trait-gaps';
import { PracticeMode, resolveJourneyContent } from '@/lib/server/journey-content';

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

function inferPracticeMode(action: string | null | undefined): PracticeMode {
  const normalized = (action || '').toLowerCase();

  if (
    normalized.includes('with your partner') ||
    normalized.includes('tell your partner') ||
    normalized.includes('ask your partner') ||
    normalized.includes('together') ||
    normalized.includes('both of you')
  ) {
    return 'partner_optional';
  }

  return 'solo';
}

function buildPracticeMetadata(
  action: string | null | undefined,
  mode?: PracticeMode
) {
  const practiceMode = mode || inferPracticeMode(action);

  return {
    practice_mode: practiceMode,
    solo_prompt:
      practiceMode === 'solo'
        ? 'Practice this in how you show up today.'
        : 'Try this with your partner if it fits. If not, practice it in how you show up.',
  };
}

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
    await trackPrimaryPathServerError(ctx.supabase, ctx.userId, 'daily_session_existing_lookup', existingError, {
      local_date: localDate,
    });
    return res.status(500).json({ error: 'Failed to check existing daily session' });
  }

  const existing = existingRows?.[0];

  if (existing) {
    return res.status(200).json({
      session: {
        ...existing,
        ...buildPracticeMetadata(existing.morning_action),
      },
      reused: true,
    });
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

  // Journey-driven users skip the old graduation check entirely.
  // Only apply the old day-14 graduation logic when there's no active journey.
  const activeJourneyId: string | null = insightsRow?.active_journey_id ?? null;

  if (!activeJourneyId) {
    if (insightsRow?.skill_tree_unlocked || insightsRow?.onboarding_completed_at) {
      return res.status(200).json({
        graduated: true,
        skill_tree_unlocked: true,
        next_day_index: Math.max(15, insightsRow?.onboarding_day ?? 15),
        reused: true,
      });
    }
  }

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

    // Only apply the old day-14 graduation when no active journey
    if (!activeJourneyId && latestCompletedDay >= 14) {
      return res.status(200).json({
        graduated: true,
        skill_tree_unlocked: true,
        next_day_index: 15,
        reused: true,
      });
    }

    const derivedDayIndex = Math.max(1, latestCompletedDay + 1);
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

  // ── Journey content path: use static content when an active journey exists ──
  const journeyContent = resolveJourneyContent(activeJourneyId, dayIndex);

  if (journeyContent) {
    const { day: jDay, journeyTitle, journeyDuration, modalityLabel, practiceMode } = journeyContent;

    const insertPayload: Record<string, unknown> = {
      user_id: ctx.userId,
      session_local_date: localDate,
      timezone,
      day_index: dayIndex,
      discovery_day: dayIndex,
      status: 'morning_ready',
      phase: 'morning',
      morning_story: jDay.learn.story + '\n\n' + jDay.learn.keyInsight,
      morning_action: jDay.action.prompt,
      micro_action: jDay.action.prompt,
      learn_response: jDay.learn.story,
      evening_reflection_prompt: jDay.reflection.prompt,
      journey_id: activeJourneyId,
      journey_title: journeyTitle,
      journey_day_index: dayIndex,
      idempotency_key: body.idempotency_key || null,
      active_track: modalityLabel || 'communication',
      ...(steeredTrait ? { steered_trait: steeredTrait } : {}),
    };

    // Column compatibility checks
    for (const col of ['session_date', 'local_date'] as const) {
      if (await dailySessionHasColumn(ctx, col)) {
        insertPayload[col] = localDate;
      }
    }
    for (const col of ['active_track', 'steered_trait', 'micro_action', 'learn_response', 'discovery_day', 'idempotency_key', 'evening_reflection_prompt', 'journey_id', 'journey_title', 'journey_day_index'] as const) {
      if (!(await dailySessionHasColumn(ctx, col))) {
        delete insertPayload[col];
      }
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
        console.error('Daily session insert error (journey path):', insertError);
      }
      return res.status(500).json({ error: 'Failed to create daily session' });
    }

    await ctx.supabase.from('daily_entries').upsert(
      {
        user_id: ctx.userId,
        day: dayIndex,
        morning_story: inserted.morning_story,
        morning_action: inserted.morning_action,
      },
      { onConflict: 'user_id,day' }
    );

    await trackEvent(ctx.supabase, ctx.userId, 'daily_session_started', {
      day_index: dayIndex,
      local_date: localDate,
      tier: entitlements.tier,
      journey_id: activeJourneyId,
      journey_day: dayIndex,
      practice_mode: practiceMode,
    });

    return res.status(200).json({
      session: {
        ...inserted,
        ...buildPracticeMetadata(inserted.morning_action, practiceMode),
      },
      reused: false,
      journey: {
        id: activeJourneyId,
        title: journeyTitle,
        duration: journeyDuration,
        dayIndex,
        modalityLabel,
        practiceMode,
      },
    });
  }

  // ── LLM generation path (no active journey or no static content) ──
  let storyRaw = "";
  let isValid = false;
  let attempts = 0;
  let lastFailureReason = "";

  while (!isValid && attempts < 2) {
    attempts++;
    try {
      let currentPrompt = getMorningStoryPrompt(dayIndex, insights, steeringHint, activeTrack);
      if (lastFailureReason) {
        currentPrompt += `\n\nCRITICAL FIX REQUIRED: Your previous attempt failed validation because: "${lastFailureReason}". Ensure you fix this logical error in your rewrite.`;
      }

      storyRaw = await peterChat({
        messages: [
          { role: 'system', content: PETER_SYSTEM_PROMPT },
          { role: 'user', content: currentPrompt },
        ],
        maxTokens: 450,
      });

      // QA Agent Validation
      const { getMorningStoryValidationPrompt } = require('@/lib/peterService');
      const valPrompt = getMorningStoryValidationPrompt(storyRaw);
      const valResponse = await peterChat({
        messages: [{ role: 'user', content: valPrompt }],
        maxTokens: 150,
      });
      
      const cleanVal = valResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const valObj = JSON.parse(cleanVal);

      if (valObj.valid) {
        isValid = true;
      } else {
        lastFailureReason = valObj.reason || "Logical contradiction detected.";
        console.warn(`[QA Agent] Rejected story attempt ${attempts}:`, lastFailureReason);
      }
    } catch (error) {
      console.error(`Peter session start LLM error on attempt ${attempts}:`, error);
      break; // Fallback immediately on network/parsing errors
    }
  }

  // Fallback if all attempts failed or errored
  if (!isValid) {
    if (attempts >= 2) {
      console.warn(`[QA Agent] Exhausted retries. Falling back to hardcoded story.`);
    }
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
  if (!(await dailySessionHasColumn(ctx, 'active_track'))) {
    delete insertPayload.active_track;
  }
  if (!(await dailySessionHasColumn(ctx, 'steered_trait'))) {
    delete insertPayload.steered_trait;
  }
  if (!(await dailySessionHasColumn(ctx, 'micro_action'))) {
    delete insertPayload.micro_action;
  }
  if (!(await dailySessionHasColumn(ctx, 'learn_response'))) {
    delete insertPayload.learn_response;
  }
  if (!(await dailySessionHasColumn(ctx, 'discovery_day'))) {
    delete insertPayload.discovery_day;
  }
  if (!(await dailySessionHasColumn(ctx, 'idempotency_key'))) {
    delete insertPayload.idempotency_key;
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
    practice_mode: inferPracticeMode(action),
  });

  return res.status(200).json({
    session: {
      ...inserted,
      ...buildPracticeMetadata(inserted.morning_action),
    },
    reused: false,
  });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';
import { parseLocalDate } from '@/lib/server/date-utils';

type CompleteBody = {
  session_id?: string;
  evening_reflection?: string;
  evening_peter_response?: string;
  completion_local_date?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as CompleteBody;
  if (!body.session_id) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  const { data: session, error: findError } = await ctx.supabase
    .from('daily_sessions')
    .select('*')
    .eq('id', body.session_id)
    .eq('user_id', ctx.userId)
    .single();

  if (findError || !session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const completionDate = parseLocalDate(body.completion_local_date);
  const alreadyCompleted = session.status === 'completed';
  let updatedSession = session;

  if (!alreadyCompleted) {
    // Check for high emotional triggering ("fight or flight")
    // Simple naive implementation for MVP, in production this uses a LLM classification endpoint
    const triggeringKeywords = ['hate', 'never', 'always', 'furious', 'pissed', 'done', 'leaving', 'divorce'];
    const lowerReflection = (body.evening_reflection || '').toLowerCase();

    // Check if reflection is highly triggered and not already locked
    const isTriggered = triggeringKeywords.some(kw => lowerReflection.includes(kw)) && lowerReflection.length > 20;

    if (isTriggered && !session.is_locked_for_pause) {
      // Trigger Forced Pause: Save reflection but lock it for 12 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 12);

      const { data: lockedSession, error: lockError } = await ctx.supabase
        .from('daily_sessions')
        .update({
          evening_reflection: body.evening_reflection,
          is_locked_for_pause: true,
          pause_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.session_id)
        .eq('user_id', ctx.userId)
        .select('*')
        .single();

      if (lockError || !lockedSession) {
        return res.status(500).json({ error: 'Failed to lock session' });
      }

      return res.status(200).json({
        completed: false,
        forced_pause: true,
        pause_expires_at: lockedSession.pause_expires_at,
        message: "This feels really heavy. I'm saving this in a secure vault. I want you to step away, sleep on it, and we will unlock this tomorrow so you can look at it with fresh eyes."
      });
    }

    // Check if locked and hasn't expired yet
    if (session.is_locked_for_pause) {
      const now = new Date();
      const expires = new Date(session.pause_expires_at);
      if (now < expires) {
        return res.status(403).json({
          error: 'Session is currently locked for a cooling off period.',
          forced_pause: true,
          pause_expires_at: session.pause_expires_at
        });
      }
      // If expired, let it proceed to completion
    }

    const { data: updated, error: updateError } = await ctx.supabase
      .from('daily_sessions')
      .update({
        status: 'completed',
        phase: 'complete',
        evening_reflection: body.evening_reflection ?? session.evening_reflection,
        evening_peter_response: body.evening_peter_response ?? session.evening_peter_response,
        evening_completed_at: new Date().toISOString(),
        completed_local_date: completionDate,
        is_locked_for_pause: false, // Clear lock on successful completion
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.session_id)
      .eq('user_id', ctx.userId)
      .select('*')
      .single();

    if (updateError || !updated) {
      return res.status(500).json({ error: 'Failed to complete session' });
    }
    updatedSession = updated;
  }

  await ctx.supabase.from('daily_entries').upsert(
    {
      user_id: ctx.userId,
      day: updatedSession.day_index,
      morning_story: updatedSession.morning_story,
      morning_action: updatedSession.morning_action,
      morning_viewed_at: updatedSession.morning_viewed_at,
      evening_reflection: updatedSession.evening_reflection,
      evening_peter_response: updatedSession.evening_peter_response,
      evening_completed_at: updatedSession.evening_completed_at,
    },
    { onConflict: 'user_id,day' }
  );

  const { data: insights } = await ctx.supabase
    .from('user_insights')
    .select('onboarding_day')
    .eq('user_id', ctx.userId)
    .maybeSingle();

  // Guard against double-advance when duplicate/stale session completions race.
  // `onboarding_day` is "next day" cursor, so convert it to last-completed before comparing.
  const lastCompletedFromCursor = Math.max((insights?.onboarding_day ?? 1) - 1, 0);
  const currentDay = Math.max(updatedSession.day_index, lastCompletedFromCursor, 1);
  const nextDay = currentDay + 1;
  const unlocked = currentDay >= 14;

  if (!alreadyCompleted) {
    await ctx.supabase.from('user_insights').upsert(
      {
        user_id: ctx.userId,
        onboarding_day: nextDay,
        skill_tree_unlocked: unlocked,
        last_analysis_at: new Date().toISOString(),
        ...(unlocked ? { onboarding_completed_at: new Date().toISOString() } : {}),
      },
      { onConflict: 'user_id' }
    );

    await trackEvent(ctx.supabase, ctx.userId, 'daily_session_completed', {
      day_index: currentDay,
      next_day_index: nextDay,
      skill_tree_unlocked: unlocked,
    });

    if (currentDay >= 3) {
      await trackEvent(ctx.supabase, ctx.userId, 'activation_day3_reached', {
        day_index: currentDay,
      });
    }
    if (currentDay >= 14) {
      await trackEvent(ctx.supabase, ctx.userId, 'onboarding_day14_completed', {
        day_index: currentDay,
      });
    }

    // Award XP for completing the daily loop (Phase 4: use session's active track)
    try {
      const trackKey = updatedSession.active_track || 'communication';
      const xpAmount = 20;

      await ctx.supabase.rpc('award_skill_xp', {
        p_user_id: ctx.userId,
        p_track: trackKey,
        p_xp: xpAmount
      });
      
      // Fallback if RPC is not defined yet
      const { data: trackData, error: trackError } = await ctx.supabase
        .from('user_skill_tracks')
        .select('total_xp')
        .eq('user_id', ctx.userId)
        .eq('track_key', trackKey)
        .maybeSingle();

      if (!trackError) {
        const currentXp = trackData?.total_xp ?? 0;
        await ctx.supabase
          .from('user_skill_tracks')
          .upsert({
            user_id: ctx.userId,
            track_key: trackKey,
            total_xp: currentXp + xpAmount,
            last_activity_at: new Date().toISOString()
          }, { onConflict: 'user_id,track_key' });
      }
    } catch (xpErr) {
      console.error('XP award error:', xpErr);
    }
  }

  // Fire-and-forget: silently analyze profile traits from the reflection
  if (
    !alreadyCompleted &&
    updatedSession.evening_reflection &&
    updatedSession.evening_peter_response
  ) {
    (async () => {
      try {
        const { analyzeProfileTraits } = await import('@/lib/server/profile-analysis');
        await analyzeProfileTraits(
          ctx.supabase,
          ctx.userId,
          updatedSession.evening_reflection,
          updatedSession.evening_peter_response,
        );
      } catch (err) {
        console.error('Profile analysis background error:', err);
      }
    })();

    // Fire-and-forget: generate partner synthesis if partner completed the same day
    (async () => {
      try {
        const { data: profileRow } = await ctx.supabase
          .from('profiles')
          .select('partner_id')
          .eq('user_id', ctx.userId)
          .maybeSingle();

        const partnerId = profileRow?.partner_id;
        if (!partnerId) return;

        const { data: partnerSession } = await ctx.supabase
          .from('daily_sessions')
          .select('evening_reflection')
          .eq('user_id', partnerId)
          .eq('day_index', updatedSession.day_index)
          .eq('status', 'completed')
          .maybeSingle();

        if (!partnerSession?.evening_reflection) return;

        const { generatePartnerSynthesis } = await import('@/lib/server/partner-synthesis');
        await generatePartnerSynthesis(
          ctx.supabase,
          ctx.userId,
          partnerId,
          updatedSession.day_index,
          updatedSession.evening_reflection,
          partnerSession.evening_reflection,
        );
      } catch (err) {
        console.error('Partner synthesis background error:', err);
      }
    })();
  }

  return res.status(200).json({
    completed: true,
    already_completed: alreadyCompleted,
    next_day_index: nextDay,
    skill_tree_unlocked: unlocked,
    session: updatedSession,
  });
}

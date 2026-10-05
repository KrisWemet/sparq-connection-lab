import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';
import { trackPrimaryPathServerError } from '@/lib/server/beta-ops';
import { parseLocalDate } from '@/lib/server/date-utils';
import { isJourneyComplete } from '@/lib/server/journey-content';
import { getActiveJourney, recordJourneyStep } from '@/lib/server/journey-state';
import { isDailyJourney } from '@/lib/journeys/catalog';

type CompleteBody = {
  session_id?: string;
  evening_reflection?: string;
  evening_peter_response?: string;
  completion_local_date?: string;
};

function inferReflectionSignals(reflection: string) {
  const normalized = reflection.toLowerCase();

  return {
    reflection_quality:
      reflection.trim().split(/\s+/).length >= 20 ? 'deep' : reflection.trim().length > 0 ? 'brief' : 'empty',
    repair_attempted:
      /\bsorry\b|\brepair\b|\bcame back\b|\bowned\b|\bmy part\b/.test(normalized),
    appreciation_attempted:
      /\bappreciat|\bgrateful|\bthank|\badmire|\bnoticed something good\b/.test(normalized),
    self_regulation_attempted:
      /\bpause\b|\bbreathe\b|\bslowed down\b|\bcalm\b|\bsteady\b|\bregulated\b/.test(normalized),
  };
}

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
  const reflectionSignals = inferReflectionSignals(body.evening_reflection || session.evening_reflection || '');

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
        await trackPrimaryPathServerError(ctx.supabase, ctx.userId, 'daily_session_lock_forced_pause', lockError || new Error('Failed to lock session'), {
          session_id: body.session_id,
        });
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
      await trackPrimaryPathServerError(ctx.supabase, ctx.userId, 'daily_session_complete', updateError || new Error('Failed to complete session'), {
        session_id: body.session_id,
      });
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
  // Only daily (starter) journeys run through this loop today; staged ones
  // keep their own pages until Phase 2.
  const activeJourney = await getActiveJourney(ctx.supabase, ctx.userId);
  const activeDailyJourneyId: string | null =
    activeJourney && isDailyJourney(activeJourney.journey_id) ? activeJourney.journey_id : null;
  // The journey this session was started on. If the user switched journeys
  // since (mid-day), the day still belongs to — and is credited to — it,
  // and the journey they switched to is left exactly as it is.
  const sessionJourneyId: string | null =
    isDailyJourney(updatedSession.journey_id) ? updatedSession.journey_id : null;
  const unlocked = (activeDailyJourneyId || sessionJourneyId) ? false : currentDay >= 14;

  // ── Journey progress: count this journey day once, on its own journey ──
  // (journey-state.ts). Completion comes from the journey's own day, not the
  // global practice-day counter.
  let journeyCompleted = false;            // the active journey just finished → show "what's next?"
  let finishedJourneyId: string | null = null; // any journey this day finished → summary + thread
  const sessionJourneyDay = Number(updatedSession.journey_day_index) || 0;
  if (!alreadyCompleted && sessionJourneyId && sessionJourneyDay > 0) {
    const step = await recordJourneyStep(ctx.supabase, ctx.userId, sessionJourneyId, { day: sessionJourneyDay }, { creditSetAside: true });
    if (step.ok) {
      if (step.value.journeyCompleted) {
        finishedJourneyId = sessionJourneyId;
        journeyCompleted = step.value.wasActive;
      }
    } else if (
      step.error === 'schema_not_ready'
      && sessionJourneyId === activeDailyJourneyId
      && isJourneyComplete(sessionJourneyId, sessionJourneyDay + 1)
    ) {
      // Before the journey_state migration: the old pointer-only completion.
      journeyCompleted = true;
      finishedJourneyId = sessionJourneyId;
      await ctx.supabase.from('user_insights').upsert({
        user_id: ctx.userId,
        active_journey_id: null,
        last_completed_journey_id: sessionJourneyId,
        journey_completion_state: 'pending_decision',
      }, { onConflict: 'user_id' });
    }
  }
  const activeJourneyId: string | null = sessionJourneyId ?? activeDailyJourneyId;

  if (!alreadyCompleted) {
    const insightsUpsert: Record<string, unknown> = {
      user_id: ctx.userId,
      onboarding_day: nextDay,
      skill_tree_unlocked: unlocked,
      last_analysis_at: new Date().toISOString(),
      ...(unlocked ? { onboarding_completed_at: new Date().toISOString() } : {}),
    };

    await trackEvent(ctx.supabase, ctx.userId, 'solo_practice_completed', {
      day_index: currentDay,
      journey_id: activeJourneyId,
      practice_mode: session.practice_mode || null,
      ...reflectionSignals,
    });

    await ctx.supabase.from('user_insights').upsert(
      insightsUpsert,
      { onConflict: 'user_id' }
    );

    // Generate synthesis (journey_completed is tracked by journey-state.ts)
    if (finishedJourneyId) {

      // Fire-and-forget: generate journey synthesis, recommendations, and growth thread entry
      (async () => {
        try {
          const { peterChat } = await import('@/lib/openrouter');
          const { stripMarkdown } = await import('@/lib/strip-markdown');
          const { recommendNextJourneys } = await import('@/lib/server/next-journey-recommender');

          // Fetch all sessions for this journey for synthesis context
          const { data: journeySessions } = await ctx.supabase
            .from('daily_sessions')
            .select('day_index, morning_action, evening_reflection, evening_emotional_tone')
            .eq('user_id', ctx.userId)
            .eq('journey_id', finishedJourneyId)
            .eq('status', 'completed')
            .order('day_index', { ascending: true });

          const firstReflection = journeySessions?.[0]?.evening_reflection || '';
          const lastReflection = journeySessions?.[journeySessions.length - 1]?.evening_reflection || '';
          const tones = (journeySessions || []).map(s => s.evening_emotional_tone).filter(Boolean);

          const synthesisPrompt = `You are Peter the otter. A user just completed their relationship journey "${finishedJourneyId}" (${journeySessions?.length ?? 0} days practiced).

Day 1 reflection: "${firstReflection.slice(0, 200)}"
Final day reflection: "${lastReflection.slice(0, 200)}"
Emotional tones across journey: ${tones.join(', ') || 'not tracked'}

Write a 3-4 sentence journey synthesis that:
1. Names what shifted from Day 1 to now (be specific)
2. Celebrates the growth without being over-the-top
3. Describes what they did and wrote, in their own words where you can — never tells them who they are or what it proves (no "you are becoming someone who…"; that meaning is theirs to name)
4. Ends warmly

Write as Peter — warm, wise, no clinical terms. 4th-grade reading level.
Output ONLY the synthesis text. No JSON, no formatting.`;

          const rawSynthesis = await peterChat({
            messages: [
              { role: 'system', content: 'You are Peter, a warm otter companion who celebrates growth.' },
              { role: 'user', content: synthesisPrompt },
            ],
            maxTokens: 256,
          });
          const synthesis = stripMarkdown(rawSynthesis).trim();

          // Store synthesis on the journey record (journey-state.ts creates it)
          await ctx.supabase
            .from('user_journeys')
            .update({ completion_synthesis: synthesis })
            .eq('user_id', ctx.userId)
            .eq('journey_id', finishedJourneyId);

          // Generate next journey recommendations (journeys actually finished,
          // not every journey they practiced a day of)
          const { data: completedJourneys } = await ctx.supabase
            .from('user_journeys')
            .select('journey_id')
            .eq('user_id', ctx.userId)
            .eq('status', 'completed');

          const completedIds = [...new Set([finishedJourneyId, ...(completedJourneys || []).map(r => r.journey_id)].filter(Boolean))] as string[];

          const { data: traits } = await ctx.supabase
            .from('profile_traits')
            .select('inferred_value')
            .eq('user_id', ctx.userId)
            .eq('trait_key', 'attachment_style')
            .maybeSingle();

          const { recommendations, suggestRest } = recommendNextJourneys(
            completedIds,
            traits?.inferred_value,
            finishedJourneyId,
          );

          // Store recommendations in user_insights
          await ctx.supabase
            .from('user_insights')
            .upsert({
              user_id: ctx.userId,
              recommended_next_journeys: recommendations,
            }, { onConflict: 'user_id' });

          // Growth thread: journey completion milestone
          await ctx.supabase.from('growth_thread').insert({
            user_id: ctx.userId,
            date: new Date().toISOString().slice(0, 10),
            label: `Completed ${finishedJourneyId.replace(/-/g, ' ')}`,
            type: 'milestone',
            journey_id: finishedJourneyId,
            detail: synthesis,
          });
        } catch (err) {
          console.error('Journey completion background error:', err);
        }
      })();
    }

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
          updatedSession.id ?? null,
        );
      } catch (err) {
        console.error('Profile analysis background error:', err);
      }
    })();

    // (Partner synthesis removed: it blended both partners' private evening
    // reflections with no explicit sharing — constitution §8. Partners now
    // share deliberately through shared_items / Shared Peter.)

    // Fire-and-forget: generate Peter's greeting for next dashboard visit
    (async () => {
      const { generateGreeting } = await import('@/lib/server/generate-greeting');
      generateGreeting(
        ctx.supabase,
        ctx.userId,
        updatedSession.evening_reflection ?? '',
        updatedSession.day_index,
        updatedSession.journey_title ?? null,
      );
    })();
  }

  return res.status(200).json({
    completed: true,
    already_completed: alreadyCompleted,
    next_day_index: nextDay,
    skill_tree_unlocked: unlocked,
    journey_completed: journeyCompleted,
    completed_journey_id: journeyCompleted ? finishedJourneyId : null,
    session: updatedSession,
  });
}

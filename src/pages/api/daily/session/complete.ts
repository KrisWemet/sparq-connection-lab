import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { trackEvent } from '@/lib/server/analytics';
import { parseLocalDate } from '@/lib/server/date-utils';
import { isJourneyComplete } from '@/lib/server/journey-content';

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
    .select('onboarding_day, active_journey_id')
    .eq('user_id', ctx.userId)
    .maybeSingle();

  // Guard against double-advance when duplicate/stale session completions race.
  // `onboarding_day` is "next day" cursor, so convert it to last-completed before comparing.
  const lastCompletedFromCursor = Math.max((insights?.onboarding_day ?? 1) - 1, 0);
  const currentDay = Math.max(updatedSession.day_index, lastCompletedFromCursor, 1);
  const nextDay = currentDay + 1;
  const activeJourneyId: string | null = insights?.active_journey_id ?? null;
  const unlocked = activeJourneyId ? false : currentDay >= 14;

  // ── Journey completion check ──
  let journeyCompleted = false;
  if (activeJourneyId && isJourneyComplete(activeJourneyId, nextDay)) {
    journeyCompleted = true;
  }

  if (!alreadyCompleted) {
    const insightsUpsert: Record<string, unknown> = {
      user_id: ctx.userId,
      onboarding_day: nextDay,
      skill_tree_unlocked: unlocked,
      last_analysis_at: new Date().toISOString(),
      ...(unlocked ? { onboarding_completed_at: new Date().toISOString() } : {}),
    };

    // If journey just completed, set pending_decision state and store recommendations
    if (journeyCompleted && activeJourneyId) {
      insightsUpsert.active_journey_id = null;
      insightsUpsert.last_completed_journey_id = activeJourneyId;
      insightsUpsert.journey_completion_state = 'pending_decision';
    }

    await ctx.supabase.from('user_insights').upsert(
      insightsUpsert,
      { onConflict: 'user_id' }
    );

    // Fire journey_completed analytics event + generate synthesis
    if (journeyCompleted && activeJourneyId) {
      await trackEvent(ctx.supabase, ctx.userId, 'journey_completed', {
        journey_id: activeJourneyId,
        days_completed: currentDay,
      });

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
            .eq('journey_id', activeJourneyId)
            .eq('status', 'completed')
            .order('day_index', { ascending: true });

          const firstReflection = journeySessions?.[0]?.evening_reflection || '';
          const lastReflection = journeySessions?.[journeySessions.length - 1]?.evening_reflection || '';
          const tones = (journeySessions || []).map(s => s.evening_emotional_tone).filter(Boolean);

          const synthesisPrompt = `You are Peter the otter. A user just completed their relationship journey "${activeJourneyId}" (${currentDay} days).

Day 1 reflection: "${firstReflection.slice(0, 200)}"
Final day reflection: "${lastReflection.slice(0, 200)}"
Emotional tones across journey: ${tones.join(', ') || 'not tracked'}

Write a 3-4 sentence journey synthesis that:
1. Names what shifted from Day 1 to now (be specific)
2. Celebrates the growth without being over-the-top
3. Uses identity language ("You are becoming someone who...")
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

          // Store synthesis on user_journeys (if row exists)
          await ctx.supabase
            .from('user_journeys')
            .update({ completion_synthesis: synthesis })
            .eq('user_id', ctx.userId)
            .eq('journey_id', activeJourneyId);

          // Generate next journey recommendations
          const { data: completedJourneys } = await ctx.supabase
            .from('daily_sessions')
            .select('journey_id')
            .eq('user_id', ctx.userId)
            .eq('status', 'completed')
            .not('journey_id', 'is', null);

          const completedIds = [...new Set((completedJourneys || []).map(s => s.journey_id).filter(Boolean))];

          const { data: traits } = await ctx.supabase
            .from('profile_traits')
            .select('inferred_value')
            .eq('user_id', ctx.userId)
            .eq('trait_key', 'attachment_style')
            .maybeSingle();

          const { recommendations, suggestRest } = recommendNextJourneys(
            completedIds,
            traits?.inferred_value,
            activeJourneyId,
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
            label: `Completed ${activeJourneyId.replace(/-/g, ' ')}`,
            type: 'milestone',
            journey_id: activeJourneyId,
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
          .eq('id', ctx.userId)
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

    // Fire-and-forget: generate Peter's greeting for next dashboard visit
    (async () => {
      try {
        const { peterChat } = await import('@/lib/openrouter');
        const { stripMarkdown } = await import('@/lib/strip-markdown');

        const { data: profileRow } = await ctx.supabase
          .from('profiles')
          .select('name')
          .eq('id', ctx.userId)
          .maybeSingle();

        const firstName = profileRow?.name?.split(' ')[0] || '';
        const journeyCtx = updatedSession.journey_title ? ` on ${updatedSession.journey_title}` : '';

        const greetingPrompt = `Generate a warm, brief morning greeting from Peter the otter for tomorrow.

Context from today's session:
- The user reflected: "${(updatedSession.evening_reflection || '').slice(0, 200)}"
- Day ${updatedSession.day_index}${journeyCtx}
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
        await ctx.supabase
          .from('user_insights')
          .upsert(
            { user_id: ctx.userId, next_greeting_text: greeting },
            { onConflict: 'user_id' }
          );
      } catch (err) {
        console.error('Greeting generation background error:', err);
      }
    })();
  }

  return res.status(200).json({
    completed: true,
    already_completed: alreadyCompleted,
    next_day_index: nextDay,
    skill_tree_unlocked: unlocked,
    journey_completed: journeyCompleted,
    completed_journey_id: journeyCompleted ? activeJourneyId : null,
    session: updatedSession,
  });
}

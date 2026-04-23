import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ChevronLeft, CheckCircle, Settings, Flame } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { PeterChat } from '@/components/PeterChat';
import { PeterMessage, UserInsights } from '@/lib/peterService';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { parseMorningContent } from '@/lib/morning-parser';
import { stripMarkdown as stripMd } from '@/lib/strip-markdown';
import { Day14Graduation } from '@/components/onboarding/Day14Graduation';
import { analyticsService } from '@/services/analyticsService';
import { DailyTimeline } from '@/components/journey/DailyTimeline';
import { fireElegantConfetti } from '@/lib/ElegantConfetti';
import { PeterLoading } from '@/components/PeterLoading';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { DayProgressArc } from '@/components/daily/DayProgressArc';
import { PreviousReflectionCard } from '@/components/daily/PreviousReflectionCard';
import { EveningCheckin } from '@/components/daily/EveningCheckin';
import { IfThenPlanStep } from '@/components/daily/IfThenPlanStep';
import { JourneyCompletion } from '@/components/daily/JourneyCompletion';
import { BetaFeedbackDialog } from '@/components/beta/BetaFeedbackDialog';
import { reportPrimaryPathClientError, trackPrimaryPathClientEvent } from '@/lib/beta/primaryPath';
import { fetchPlayfulConnectionToday } from '@/lib/playfulConnection';
import type { PlayfulPrompt } from '@/data/playful-prompts';
import { FavoriteUsCard } from '@/components/playful/FavoriteUsCard';
import { EditorialEyebrow } from '@/components/editorial/EditorialSurface';

type Phase = 'loading' | 'morning' | 'evening' | 'evening-checkin' | 'if_then_plan' | 'journey-complete' | 'complete';
type PracticeMode = 'solo' | 'partner_optional' | 'partner_joint';

// Fallback modality label when no journey is active.
function getModalityLabel(day: number): string {
  if (day <= 3) return 'POSITIVE PSYCHOLOGY';
  if (day <= 7) return 'GOTTMAN METHOD';
  if (day <= 10) return 'ATTACHMENT THEORY';
  return 'EFT';
}

const DEFAULT_EVENING_OPENER: PeterMessage = {
  role: 'assistant',
  content: "Hey, welcome back. 🌙 How did today's small step go? Tell me what happened. Tiny reps matter.",
};

function inferPracticeMode(action: string): PracticeMode {
  const normalized = action.toLowerCase();

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

function getPracticeSupportCopy(mode: PracticeMode) {
  if (mode === 'solo') {
    return {
      home: 'This is a solo-first step. You can do it on your own and still change the relationship.',
      evening: 'How did you practice this in the way you showed up today?',
      reminder: 'This step still counts, even if your partner never opens the app.',
    };
  }

  return {
    home: 'Try this with your partner if it fits. If not, practice it in how you show up today.',
    evening: 'What changed when you tried this with your partner, or in the way you showed up today?',
    reminder: 'Partner optional. Your growth still counts if you practiced this on your own.',
  };
}

export default function DailyGrowth() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [currentDay, setCurrentDay] = useState(1);
  const [insights, setInsights] = useState<Partial<UserInsights>>({});
  const [morningStory, setMorningStory] = useState('');
  const [morningAction, setMorningAction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [eveningMessages, setEveningMessages] = useState<PeterMessage[]>([DEFAULT_EVENING_OPENER]);
  const [isEveningLoading, setIsEveningLoading] = useState(false);
  const [eveningTurns, setEveningTurns] = useState(0);
  const [canCompleteDay, setCanCompleteDay] = useState(false);
  const [reflectionClosed, setReflectionClosed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingCompletion, setPendingCompletion] = useState<{ userMsg: string; peterMsg: string } | null>(null);

  // Journey-specific state
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [journeyTitle, setJourneyTitle] = useState<string | null>(null);
  const [journeyDuration, setJourneyDuration] = useState<number | null>(null);
  const [journeyModalityLabel, setJourneyModalityLabel] = useState<string | null>(null);
  const [eveningReflectionPrompt, setEveningReflectionPrompt] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('solo');

  // Brief + Trigger flow
  const [peterBrief, setPeterBrief] = useState('');
  const [triggerMoment, setTriggerMoment] = useState('');

  // New states for the Put the Phone Down Quest
  const [actionVerified, setActionVerified] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  // Home screen state — shown before the user enters the morning session
  const [showHome, setShowHome] = useState(true);
  const [prevReflection, setPrevReflection] = useState<string | null>(null);
  const [favoriteUsPrompt, setFavoriteUsPrompt] = useState<PlayfulPrompt | null>(null);
  const [playfulDateKey, setPlayfulDateKey] = useState<string | null>(null);

  useEffect(() => {
    if (actionVerified && user) {
      analyticsService.trackEvent('daily_action_verified', {
        day: currentDay,
        session_id: sessionId
      });
    }
  }, [actionVerified, user, currentDay, sessionId]);

  useEffect(() => {
    if (!user?.id || phase !== 'morning' || !showHome) return;

    let isActive = true;

    void fetchPlayfulConnectionToday()
      .then((payload) => {
        if (!isActive) return;
        setFavoriteUsPrompt(payload.favoriteUs);
        setPlayfulDateKey(payload.dateKey);
      })
      .catch(() => {
        if (!isActive) return;
        setFavoriteUsPrompt(null);
        setPlayfulDateKey(null);
      });

    return () => {
      isActive = false;
    };
  }, [user?.id, phase, showHome]);

  // Fetch previous day's evening reflection for the home screen snippet
  useEffect(() => {
    if (!user || currentDay < 2) return;
    supabase
      .from('daily_entries')
      .select('evening_reflection')
      .eq('user_id', user.id)
      .eq('day', currentDay - 1)
      .single()
      .then(({ data }) => {
        if (data?.evening_reflection) setPrevReflection(data.evening_reflection);
      });
  }, [user, currentDay]);

  const localDateString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!user) return;

    (async () => {
      // Preferred path: deterministic daily session API
      try {
        const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
        const startRes = await fetch('/api/daily/session/start', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            local_date: localDateString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          }),
        });

        if (startRes.ok) {
          const payload = await startRes.json();
          if (payload.graduated) {
            setCurrentDay(payload.next_day_index ?? 15);
            setPhase('complete');
            return;
          }

          const session = payload.session;
          if (session) {
            setSessionId(session.id);
            setCurrentDay(session.day_index ?? 1);
            setMorningStory(stripMd(session.morning_story || ''));
            setMorningAction(stripMd(session.morning_action || ''));

            // Load Peter's brief from user_insights in parallel
            supabase
              .from('user_insights')
              .select('next_greeting_text')
              .eq('user_id', user.id)
              .maybeSingle()
              .then(({ data }) => {
                if (data?.next_greeting_text) setPeterBrief(data.next_greeting_text);
              });

            // Populate journey metadata from response
            if (payload.journey) {
              setJourneyId(payload.journey.id);
              setJourneyTitle(payload.journey.title);
              setJourneyDuration(payload.journey.duration);
              setJourneyModalityLabel(payload.journey.modalityLabel);
              if (payload.journey.practiceMode) {
                setPracticeMode(payload.journey.practiceMode);
              }
            }
            // Also check session-level journey fields (for reused sessions)
            if (session.journey_id) {
              setJourneyId(session.journey_id);
              if (session.journey_title) setJourneyTitle(session.journey_title);
            }
            setPracticeMode(session.practice_mode || inferPracticeMode(session.morning_action || ''));
            if (session.evening_reflection_prompt) {
              setEveningReflectionPrompt(session.evening_reflection_prompt);
            }
            if (session.trigger_moment) {
              setTriggerMoment(session.trigger_moment);
            }

            if (session.status === 'completed') {
              setPhase('complete');
            } else if (session.status === 'morning_viewed' || session.status === 'evening_active') {
              // If user came from dashboard evening CTA, use lightweight check-in
              if (router.query.mode === 'evening-checkin') {
                setPhase('evening-checkin');
              } else {
                setPhase('evening');
              }
            } else {
              setPhase('morning');
            }
            return;
          }
        }
      } catch {
        // Fallback to legacy local-data flow.
      }

      // Load user insights (day counter + profile)
      const { data: insightsRow } = await supabase
        .from('user_insights')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const day = insightsRow?.onboarding_day ?? 1;
      if (insightsRow?.skill_tree_unlocked || insightsRow?.onboarding_completed_at || day > 14) {
        setCurrentDay(Math.max(15, day));
        setPhase('complete');
        return;
      }

      const userInsights: Partial<UserInsights> = {
        attachment_style: insightsRow?.attachment_style,
        love_language: insightsRow?.love_language,
        conflict_style: insightsRow?.conflict_style,
        emotional_state: insightsRow?.emotional_state ?? 'neutral',
        onboarding_day: day,
      };
      setCurrentDay(day);
      setInsights(userInsights);
      if (insightsRow?.next_greeting_text) {
        setPeterBrief(insightsRow.next_greeting_text);
      }

      // Load today's daily entry
      const { data: entry } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('day', day)
        .single();

      if (entry?.evening_completed_at) {
        setPhase('complete');
        return;
      }

      if (entry?.morning_viewed_at) {
        setMorningStory(stripMd(entry.morning_story || ''));
        setMorningAction(stripMd(entry.morning_action || ''));
        setPracticeMode(inferPracticeMode(entry.morning_action || ''));
        setPhase('evening');
        return;
      }

      // Need morning story — use cached or generate
      setPhase('morning');
      if (entry?.morning_story) {
        setMorningStory(stripMd(entry.morning_story));
        setMorningAction(stripMd(entry.morning_action || ''));
        return;
      }

      // Generate fresh morning story
      setIsGenerating(true);
      try {
        const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
        const res = await fetch('/api/peter/morning', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            day,
            insights: userInsights,
            local_date: localDateString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          }),
        });
        if (!res.ok) throw new Error('Generation failed');
        const data = await res.json();
        const { story, action } = parseMorningContent(data.story);
        setMorningStory(story);
        setMorningAction(action);
        setPracticeMode(inferPracticeMode(action));

        await supabase.from('daily_entries').upsert(
          { user_id: user.id, day, morning_story: story, morning_action: action },
          { onConflict: 'user_id,day' }
        );
      } catch {
        setMorningStory("Good morning. 🌅 Your story is still loading. Come back in a moment.");
        setMorningAction('Tell your partner one true good thing you see in them today.');
        setPracticeMode('partner_optional');
      } finally {
        setIsGenerating(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleMorningRead = async () => {
    if (!user) return;

    analyticsService.trackEvent('daily_morning_read', {
      day: currentDay,
      session_id: sessionId
    });

    if (sessionId) {
      try {
        const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
        const res = await fetch('/api/daily/session/morning-viewed', {
          method: 'POST',
          headers,
          body: JSON.stringify({ session_id: sessionId }),
        });
        if (res.ok) {
          // Set journey-specific evening opener if available
          if (eveningReflectionPrompt) {
            setEveningMessages([{
              role: 'assistant',
              content: `Hey, welcome back. 🌙 ${eveningReflectionPrompt}`,
            }]);
          }
          void trackPrimaryPathClientEvent('beta_primary_daily_growth_started', {
            current_day: currentDay,
            journey_id: journeyId,
            trigger_set: false,
          });
          setPhase('evening');
          return;
        }
      } catch {
        // Fallback to legacy write path below.
      }
    }

    await supabase.from('daily_entries').upsert(
      {
        user_id: user.id,
        day: currentDay,
        morning_story: morningStory,
        morning_action: morningAction,
        morning_viewed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,day' }
    );
    void trackPrimaryPathClientEvent('beta_primary_daily_growth_started', {
      current_day: currentDay,
      journey_id: journeyId,
      trigger_set: false,
    });
    setPhase('evening');
  };

  const handleEveningMessage = async (text: string) => {
    if (isEveningLoading) return;

    // Quality check on the first turn
    if (eveningTurns === 0) {
      const wordCount = text.trim().split(/\s+/).length;
      const isLowEffort = /^(idk|i don'?t know|nothing|good|fine|bad)\.?$/i.test(text.trim());

      if (wordCount < 5 || isLowEffort) {
        setEveningMessages(prev => [
          ...prev,
          { role: 'user', content: text },
          { role: 'assistant', content: "I'd love to hear a little more about that! Even just one extra sentence helps me understand how your day really went. 🦦" },
        ]);
        return;
      }
    }

    const newTurn = eveningTurns + 1;
    const userMsg: PeterMessage = { role: 'user', content: text };
    const updated = [...eveningMessages, userMsg];
    setEveningMessages(updated);
    setEveningTurns(newTurn);
    setIsEveningLoading(true);

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });

      const res = await fetch('/api/peter/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: updated,
          eveningContext: {
            day: currentDay,
            morningAction,
            turnNumber: newTurn,
            ...(eveningReflectionPrompt ? { reflectionPrompt: eveningReflectionPrompt } : {}),
            ...(journeyTitle ? { journeyTitle } : {}),
          },
        }),
      });
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      const peterMsg: PeterMessage = { role: 'assistant', content: data.message };
      setEveningMessages([...updated, peterMsg]);

      if (newTurn >= 2) setCanCompleteDay(true);
      if (newTurn >= 3) setReflectionClosed(true);
    } catch {
      setEveningMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Oops, I slipped on a fish! Can you try again? 🐟" },
      ]);
    } finally {
      setIsEveningLoading(false);
    }
  };

  // Step 1: Evening reflection done — gate on if-then plan before saving
  const handleCompleteDay = () => {
    if (!user || isSaving) return;
    const userMsgs = eveningMessages.filter(m => m.role === 'user');
    const peterMsgs = eveningMessages.filter(m => m.role === 'assistant');
    setPendingCompletion({
      userMsg: userMsgs[userMsgs.length - 1]?.content || '',
      peterMsg: peterMsgs[peterMsgs.length - 1]?.content || '',
    });
    setPhase('if_then_plan');
  };

  // Step 2: If-then plan captured — now persist and show completion
  const handleFinalComplete = async (plan: string | null) => {
    if (!user || !pendingCompletion) return;
    setIsSaving(true);
    const { userMsg: lastUserMsg, peterMsg: lastPeterMsg } = pendingCompletion;

    try {
      if (sessionId) {
        const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
        const completeRes = await fetch('/api/daily/session/complete', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            session_id: sessionId,
            evening_reflection: lastUserMsg,
            evening_peter_response: lastPeterMsg,
            completion_local_date: localDateString(),
            if_then_plan: plan,
          }),
        });

        if (completeRes.ok) {
          const payload = await completeRes.json();
          setCurrentDay(payload.next_day_index || currentDay + 1);
          fireElegantConfetti();

          if (payload.journey_completed && payload.completed_journey_id) {
            setPhase('journey-complete');
          } else {
            setPhase('complete');
          }

          analyticsService.trackEvent('daily_session_completed', {
            day: currentDay,
            session_id: sessionId,
            is_graduation: currentDay >= 14,
            journey_completed: payload.journey_completed || false,
            has_if_then_plan: Boolean(plan),
          });
          if (currentDay === 1) {
            void trackPrimaryPathClientEvent('beta_primary_day1_completed', {
              session_id: sessionId,
            });
          }
          return;
        }
      }

      // Fallback: no session_id — direct Supabase writes
      const analyzeRes = await fetch('/api/peter/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: eveningMessages }),
      });
      let updatedInsights = {};
      if (analyzeRes.ok) {
        const d = await analyzeRes.json();
        updatedInsights = d.insights || {};
      }

      const nextDay = currentDay + 1;
      const isGraduation = currentDay >= 14;

      await Promise.all([
        supabase.from('daily_entries').upsert(
          {
            user_id: user.id,
            day: currentDay,
            evening_reflection: lastUserMsg,
            evening_peter_response: lastPeterMsg,
            evening_completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,day' }
        ),
        supabase.from('user_insights').upsert(
          {
            user_id: user.id,
            ...updatedInsights,
            onboarding_day: nextDay,
            skill_tree_unlocked: isGraduation,
            last_analysis_at: new Date().toISOString(),
            ...(isGraduation ? { onboarding_completed_at: new Date().toISOString() } : {}),
          },
          { onConflict: 'user_id' }
        ),
      ]);

      setCurrentDay(nextDay);
      fireElegantConfetti();
      setPhase('complete');

      analyticsService.trackEvent('daily_session_completed', {
        day: currentDay,
        session_id: sessionId,
        is_graduation: isGraduation,
        has_if_then_plan: Boolean(plan),
      });
      if (currentDay === 1) {
        void trackPrimaryPathClientEvent('beta_primary_day1_completed', {
          session_id: sessionId,
        });
      }
    } catch (err) {
      void reportPrimaryPathClientError('daily_complete', err, {
        current_day: currentDay,
        session_id: sessionId,
      });
      console.error('Complete day error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading screen — show Peter's tip overlay (consistent with route transitions)
  if (authLoading || phase === 'loading') {
    return <PeterLoading isLoading />;
  }

  // ─── Home screen ───────────────────────────────────────────────────────────
  // Shown once per session, before the user enters the morning exercise flow.
  // Only applies to the morning phase — evening/complete go straight through.

  const practiceCopy = getPracticeSupportCopy(practiceMode);

  const DEFAULT_REFLECTION =
    'I noticed I jumped to fix things instead of just listening. Next time I want to try staying with them first.';

  if (showHome && phase === 'morning') {
    const homeHeadline = journeyTitle
      ? `Your Day ${currentDay} practice is ready.`
      : 'Your morning practice is ready.';
    const homePeterLine = peterBrief
      || (currentDay === 1
        ? "You're here. That's the most important thing you'll do today."
        : journeyTitle
          ? `${journeyTitle} is working on you. Here's your next step.`
          : "Small things, done consistently, change everything. Here's today's step.");
    const anchors = (profile as any)?.habit_anchors as string[] | undefined;
    const primaryAnchor = anchors?.[0];
    const anchorCopy: Record<string, string> = {
      morning_coffee: 'While you have your morning coffee, take five quiet minutes for this.',
      commute_start: 'While you settle in for your commute, take five minutes for this.',
      lunch_break: 'During your lunch break today, take five minutes for this.',
      evening_winddown: 'As you wind down this evening, take five minutes for this.',
      bedtime: 'Before you sleep tonight, take five minutes for this.',
    };
    const homeSupportLine = journeyTitle
      ? `${journeyTitle} keeps today's practice focused, warm, and small enough to carry into real life.`
      : (primaryAnchor && anchorCopy[primaryAnchor])
        ? anchorCopy[primaryAnchor]
        : 'Five quiet minutes now can change the tone of the rest of your day.';

    return (
      <div className="min-h-screen bg-brand-linen pb-28 font-sans">
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <span className="text-lg font-bold tracking-tight text-brand-espresso">SPARQ</span>
          <button
            onClick={() => router.push('/settings')}
            aria-label="Settings"
            className="p-1.5 rounded-xl text-brand-primary hover:bg-brand-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:ring-offset-2"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
          <motion.div
            className="flex justify-center pt-2 pb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <DayProgressArc currentDay={currentDay} totalDays={journeyDuration ?? 14} />
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            className="relative overflow-hidden rounded-[34px] border border-brand-primary/12 bg-brand-parchment px-6 py-6 shadow-[0_24px_54px_rgba(42,34,52,0.12)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-full bg-brand-primary/10 blur-3xl"
            />
            <div className="relative">
              <EditorialEyebrow className="text-brand-primary/80">
                {journeyTitle ? `${journeyTitle} — Day ${currentDay}` : 'Morning practice'}
              </EditorialEyebrow>
              <p className="mt-3 max-w-[17rem] font-serif italic text-[31px] leading-[1.08] text-brand-espresso">
                {homeHeadline}
              </p>
              <p className="mt-4 max-w-[18rem] text-sm leading-relaxed text-brand-taupe">
                {homeSupportLine}
              </p>
            </div>

            <div className="relative mt-6 flex items-center justify-between gap-3 border-t border-brand-primary/10 pt-4">
              <span className="text-sm text-brand-taupe">5 min morning page</span>
              <button
                onClick={() => setShowHome(false)}
                className="rounded-[22px] bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                Start Morning Story
              </button>
            </div>
          </motion.section>

          <motion.div
            className="flex items-start gap-3.5 px-1 pt-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
          >
            <PeterAvatar mood="afternoon" size={56} />
            <div className="flex-1 pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary/70">
                Peter&apos;s nudge
              </p>
              <p className="pt-2 font-serif italic text-[16px] leading-relaxed text-brand-text-secondary">
                {homePeterLine}
              </p>
            </div>
          </motion.div>

          <div className="rounded-[28px] border border-brand-primary/10 bg-white/60 p-5 shadow-[0_14px_34px_rgba(42,34,52,0.05)]">
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">
              Solo-first reminder
            </p>
            <p className="text-sm leading-relaxed text-brand-taupe">
              {practiceCopy.home}
            </p>
          </div>

          {favoriteUsPrompt && playfulDateKey && (
            <FavoriteUsCard
              prompt={favoriteUsPrompt}
              dateKey={playfulDateKey}
              surface="daily_growth"
            />
          )}

          {(prevReflection || currentDay > 1) && (
            <PreviousReflectionCard
              quote={prevReflection || DEFAULT_REFLECTION}
              onViewJournal={() => router.push('/journal')}
            />
          )}
        </div>
      </div>
    );
  }

  if (phase === 'morning') {
    return (
      <div className="min-h-screen bg-brand-linen flex flex-col font-sans">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHome(true)}
              aria-label="Back"
              className="p-1.5 rounded-xl text-brand-primary hover:bg-brand-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
              Day {currentDay} &middot; Morning
            </span>
          </div>
        </div>

        <DailyTimeline phase="morning" actionVerified={actionVerified} />

        <motion.div
          key="morning"
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
          className="flex-1 overflow-y-auto pb-24"
        >
          <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
            <div className="flex flex-col items-center gap-4">
              <PeterAvatar mood="morning" size={56} />
              <div className="w-full bg-brand-parchment rounded-3xl p-5 border border-brand-primary/10 shadow-sm">
                {isGenerating ? (
                  <div className="flex gap-2 items-center h-6">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-brand-primary/40"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                ) : (
                  <p
                    className="font-serif italic leading-relaxed text-brand-espresso text-[15px]"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {morningStory}
                  </p>
                )}
              </div>
            </div>

            {!isGenerating && morningAction && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.6, delay: 0.15 }}
                className="bg-brand-parchment rounded-3xl p-5 border border-brand-primary/10 shadow-sm"
              >
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">
                  Today&apos;s Practice
                </p>
                <p className="text-brand-espresso font-medium leading-relaxed text-[15px]">
                  {morningAction}
                </p>
              </motion.div>
            )}

            <div className="bg-brand-parchment rounded-2xl border border-brand-primary/10 shadow-sm p-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">
                Solo-first reminder
              </p>
              <p className="text-sm text-brand-taupe leading-relaxed">
                {practiceCopy.home}
              </p>
            </div>

            {!isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <button
                  onClick={handleMorningRead}
                  className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors text-base"
                >
                  I&apos;ll do this today
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-linen flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
            Day {currentDay} &middot; {(phase === 'evening' || phase === 'evening-checkin') ? 'Evening reflection' : phase === 'journey-complete' ? 'Journey complete' : 'Day complete'}
          </span>
        </div>
      </div>

      <DailyTimeline phase={phase === 'evening-checkin' || phase === 'if_then_plan' ? 'evening' : phase === 'journey-complete' ? 'complete' : phase} actionVerified={actionVerified} />

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── EVENING PHASE ── */}
          {phase === 'evening' && (
            <motion.div
              key="evening"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
              className="h-full flex flex-col"
            >
              {!actionVerified ? (
                /* ── Action verification state ── */
                <div className="flex-1 overflow-y-auto">
                  <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

                    {/* Morning action reminder */}
                    <div className="bg-brand-parchment rounded-2xl p-4 flex items-start gap-3 border border-brand-primary/10">
                      <Sun size={16} className="text-brand-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-1">
                          Morning step
                        </p>
                        <p className="text-sm text-brand-taupe leading-relaxed">{morningAction}</p>
                      </div>
                    </div>

                    {/* Peter + question */}
                    <div className="flex flex-col items-center gap-4 pt-2">
                      <PeterAvatar mood="evening" size={56} />
                      <p className="font-serif italic text-brand-taupe text-[15px] text-center leading-relaxed">
                        {practiceCopy.evening}
                      </p>
                      <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
                        Next step: mark today&apos;s practice done
                      </p>
                    </div>

                    {/* Hold-to-verify button */}
                    <div className="pt-2">
                      <button
                        onPointerDown={() => setIsHolding(true)}
                        onPointerUp={() => setIsHolding(false)}
                        onPointerLeave={() => setIsHolding(false)}
                        className="relative w-full overflow-hidden bg-brand-parchment border border-brand-primary/20 rounded-2xl py-4 select-none"
                        style={{ touchAction: 'none' }}
                      >
                        <div
                          className="absolute inset-0 bg-brand-primary origin-left transition-transform duration-[3000ms] ease-linear"
                          style={{ transform: `scaleX(${isHolding ? 1 : 0})` }}
                          onTransitionEnd={(e) => {
                            if (isHolding && e.propertyName === 'transform') {
                              setActionVerified(true);
                            }
                          }}
                        />
                        <span className={`relative z-10 transition-colors duration-500 text-sm font-semibold tracking-wide ${isHolding ? 'text-white' : 'text-brand-taupe'}`}>
                          Hold to mark today&apos;s step done
                        </span>
                      </button>

                      {/* Dev override only */}
                      {process.env.NODE_ENV === 'development' && (
                        <button
                          onClick={() => setActionVerified(true)}
                          className="mt-4 block w-full text-center text-[10px] font-semibold uppercase text-brand-taupe/40 hover:text-brand-taupe/70"
                        >
                          Skip Hold (Dev)
                        </button>
                      )}

                      <p className="mt-3 text-center text-xs leading-relaxed text-brand-taupe/80">
                        {practiceCopy.reminder}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Chat state (actionVerified) ── */
                <>
                  {/* Morning action reminder — slim card at top */}
                  <div className="mx-4 mt-3 mb-1 flex items-start gap-3 rounded-2xl border border-brand-primary/10 bg-brand-parchment px-4 py-3">
                    <Sun size={15} className="text-brand-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-brand-taupe leading-relaxed">
                      <span className="mr-1 font-semibold text-brand-espresso">Today&apos;s action:</span>
                      {morningAction}
                    </p>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <PeterChat
                      messages={eveningMessages}
                      onUserMessage={handleEveningMessage}
                      isLoading={isEveningLoading}
                      placeholder="How did it go today?"
                      inputDisabled={reflectionClosed}
                    />
                  </div>

                  {reflectionClosed ? (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.7 }}
                      className="px-4 pt-4 pb-6 border-t border-brand-primary/10 bg-brand-linen"
                    >
                      <p className="mb-3 text-center text-sm font-serif italic text-brand-taupe">
                        Your reflection is complete.
                      </p>
                      <button
                        onClick={handleCompleteDay}
                        disabled={isSaving}
                        className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors disabled:opacity-50 text-base"
                      >
                        {isSaving ? 'Saving...' : `Finish Day ${currentDay}`}
                      </button>
                    </motion.div>
                  ) : canCompleteDay ? (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
                      className="px-4 py-4 border-t border-brand-primary/10 bg-brand-linen"
                    >
                      <button
                        onClick={handleCompleteDay}
                        disabled={isSaving}
                        className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors disabled:opacity-50 text-base"
                      >
                        {isSaving ? 'Saving...' : `Finish Day ${currentDay}`}
                      </button>
                    </motion.div>
                  ) : null}
                </>
              )}
            </motion.div>
          )}

          {/* ── EVENING CHECK-IN PHASE (lightweight) ── */}
          {phase === 'evening-checkin' && sessionId && (
            <motion.div
              key="evening-checkin"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
              className="h-full overflow-y-auto"
            >
              <EveningCheckin
                sessionId={sessionId ?? ''}
                morningAction={morningAction}
                journeyTitle={journeyTitle}
                triggerMoment={triggerMoment || undefined}
                onComplete={() => {
                  fireElegantConfetti();
                  router.push('/dashboard');
                }}
              />
            </motion.div>
          )}

          {/* ── IF-THEN PLAN PHASE ── */}
          {phase === 'if_then_plan' && (
            <IfThenPlanStep
              suggestedPlan="When I notice tension rising in a conversation, I will take one breath and say what I appreciate before responding."
              onComplete={handleFinalComplete}
            />
          )}

          {/* ── JOURNEY COMPLETE PHASE ── */}
          {phase === 'journey-complete' && journeyId && (
            <motion.div
              key="journey-complete"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
              className="h-full overflow-y-auto"
            >
              <JourneyCompletion
                journeyId={journeyId}
                journeyTitle={journeyTitle || undefined}
              />
            </motion.div>
          )}

          {/* ── COMPLETE PHASE ── */}
          {phase === 'complete' && (
            currentDay - 1 >= 14 ? (
              <Day14Graduation />
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
                className="h-full overflow-y-auto"
              >
                <div className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center">

                  {/* Peter — no container, directly on linen */}
                  <PeterAvatar mood="celebrating" size={80} />

                  {/* Headline */}
                  <h2 className="mt-6 text-center font-serif text-2xl italic text-brand-espresso">
                    Day {currentDay - 1} complete.
                  </h2>

                  {/* Secondary text */}
                  <p className="mt-2 text-center leading-relaxed text-brand-taupe">
                    You showed up. That&apos;s everything.
                  </p>

                  {/* Streak badge card */}
                  <div className="mt-6 w-full max-w-xs rounded-3xl border border-brand-primary/10 bg-brand-parchment p-5 text-center shadow-sm">
                    <Flame size={28} className="text-brand-sand mx-auto mb-2" />
                    <p className="text-brand-sand font-bold text-2xl">{currentDay - 1} days</p>
                    <p className="mt-1 text-sm text-brand-taupe">Consistent growth.</p>
                  </div>

                  {/* Return button */}
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors text-base mt-6"
                  >
                    Return to Dashboard
                  </button>

                  <div className="mt-4">
                    <BetaFeedbackDialog
                      stage={favoriteUsPrompt ? 'day1_complete_playful_layer' : 'day1_complete'}
                      context={{
                        completed_day: currentDay - 1,
                        journey_id: journeyId,
                        playful_visible: Boolean(favoriteUsPrompt),
                        playful_surface: favoriteUsPrompt ? 'daily_growth' : null,
                        playful_prompt_id: favoriteUsPrompt?.id || null,
                        playful_prompt_bucket: favoriteUsPrompt?.bucket || null,
                      }}
                      title={favoriteUsPrompt ? 'How did the daily page feel?' : undefined}
                      description={
                        favoriteUsPrompt
                          ? 'Did the light note feel warm and optional, or did it get in the way of the main flow?'
                          : undefined
                      }
                      placeholder={
                        favoriteUsPrompt
                          ? 'Tell us if Favorite Us felt helpful, intrusive, confusing, or easy to skip.'
                          : undefined
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

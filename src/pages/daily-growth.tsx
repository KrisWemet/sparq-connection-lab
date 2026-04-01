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
import { TodaysExerciseCard } from '@/components/daily/TodaysExerciseCard';
import { PreviousReflectionCard } from '@/components/daily/PreviousReflectionCard';
import { EveningCheckin } from '@/components/daily/EveningCheckin';
import { JourneyCompletion } from '@/components/daily/JourneyCompletion';

type Phase = 'loading' | 'morning' | 'evening' | 'evening-checkin' | 'journey-complete' | 'complete';

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

export default function DailyGrowth() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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

  // Journey-specific state
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [journeyTitle, setJourneyTitle] = useState<string | null>(null);
  const [journeyDuration, setJourneyDuration] = useState<number | null>(null);
  const [journeyModalityLabel, setJourneyModalityLabel] = useState<string | null>(null);
  const [eveningReflectionPrompt, setEveningReflectionPrompt] = useState<string | null>(null);

  // New states for the Put the Phone Down Quest
  const [actionVerified, setActionVerified] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  // Home screen state — shown before the user enters the morning session
  const [showHome, setShowHome] = useState(true);
  const [prevReflection, setPrevReflection] = useState<string | null>(null);

  useEffect(() => {
    if (actionVerified && user) {
      analyticsService.trackEvent('daily_action_verified', {
        day: currentDay,
        session_id: sessionId
      });
    }
  }, [actionVerified, user, currentDay, sessionId]);

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

            // Populate journey metadata from response
            if (payload.journey) {
              setJourneyId(payload.journey.id);
              setJourneyTitle(payload.journey.title);
              setJourneyDuration(payload.journey.duration);
              setJourneyModalityLabel(payload.journey.modalityLabel);
            }
            // Also check session-level journey fields (for reused sessions)
            if (session.journey_id) {
              setJourneyId(session.journey_id);
              if (session.journey_title) setJourneyTitle(session.journey_title);
            }
            if (session.evening_reflection_prompt) {
              setEveningReflectionPrompt(session.evening_reflection_prompt);
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

        await supabase.from('daily_entries').upsert(
          { user_id: user.id, day, morning_story: story, morning_action: action },
          { onConflict: 'user_id,day' }
        );
      } catch {
        setMorningStory("Good morning. 🌅 Your story is still loading. Come back in a moment.");
        setMorningAction('Tell your partner one true good thing you see in them today.');
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

  const handleCompleteDay = async () => {
    if (!user || isSaving) return;
    setIsSaving(true);

    const userMsgs = eveningMessages.filter(m => m.role === 'user');
    const peterMsgs = eveningMessages.filter(m => m.role === 'assistant');
    const lastUserMsg = userMsgs[userMsgs.length - 1]?.content || '';
    const lastPeterMsg = peterMsgs[peterMsgs.length - 1]?.content || '';

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
          }),
        });

        if (completeRes.ok) {
          const payload = await completeRes.json();
          setCurrentDay(payload.next_day_index || currentDay + 1);
          fireElegantConfetti();

          // If a journey just completed, show the journey completion screen
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
          });
          return;
        }
      }

      // Silent profile analysis
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
        // Save evening entry
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
        // Advance day + update insights
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
      setPhase('complete');

      analyticsService.trackEvent('daily_session_completed', {
        day: currentDay,
        session_id: sessionId,
        is_graduation: isGraduation
      });
    } catch (err) {
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

  // Home screen teaser — does NOT reveal the exercise before the story.
  const homeQuestion = journeyTitle
    ? `Your Day ${currentDay} practice is ready.`
    : 'Your morning practice is ready.';

  const DEFAULT_REFLECTION =
    'I noticed I jumped to fix things instead of just listening. Next time I want to try staying with them first.';

  if (showHome && phase === 'morning') {
    return (
      <div className="min-h-screen bg-gray-50 pb-28 font-sans">
        {/* ── Top bar: SPARQ wordmark + settings ── */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <span className="text-lg font-bold tracking-tight text-[#2C1A14]">SPARQ</span>
          <button
            onClick={() => router.push('/settings')}
            aria-label="Settings"
            className="p-1.5 rounded-xl text-amethyst-600 hover:bg-amethyst-600/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amethyst-300 focus-visible:ring-offset-2"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
          {/* Day progress arc — centered */}
          <motion.div
            className="flex justify-center pt-2 pb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <DayProgressArc currentDay={currentDay} totalDays={journeyDuration ?? 14} />
          </motion.div>

          {/* Today's exercise card */}
          <TodaysExerciseCard
            durationMin={5}
            question={homeQuestion}
            sessionLabel={journeyTitle ? `${journeyTitle} — Day ${currentDay}` : 'Morning practice'}
            onBegin={() => setShowHome(false)}
          />

          {/* Previous reflection — shown from day 2 onward */}
          {(prevReflection || currentDay > 1) && (
            <PreviousReflectionCard
              quote={prevReflection || DEFAULT_REFLECTION}
              onViewJournal={() => router.push('/profile')}
            />
          )}

          {/* ── Peter — directly on linen, no container ── */}
          <motion.div
            className="flex flex-col items-center gap-3 pt-4 pb-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          >
            <PeterAvatar mood="afternoon" size={64} />
            <p className="font-serif italic text-gray-500 text-[15px] text-center leading-relaxed max-w-xs">
              Small things often. Connection isn&apos;t built in a day, but in the daily loops of shared vulnerability.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          {phase === 'morning' && (
            <button
              onClick={() => setShowHome(true)}
              aria-label="Back"
              className="p-1.5 rounded-xl text-amethyst-600 hover:bg-amethyst-600/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amethyst-300"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <span className="text-xs font-semibold tracking-widest uppercase text-amethyst-600">
            Day {currentDay} &middot; {phase === 'morning' ? 'Morning' : (phase === 'evening' || phase === 'evening-checkin') ? 'Evening' : phase === 'journey-complete' ? 'Complete' : 'Complete'}
          </span>
        </div>
      </div>

      <DailyTimeline phase={phase === 'evening-checkin' ? 'evening' : phase === 'journey-complete' ? 'complete' : phase} actionVerified={actionVerified} />

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── MORNING PHASE ── */}
          {phase === 'morning' && (
            <motion.div
              key="morning"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
              className="h-full overflow-y-auto pb-24"
            >
              <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

                {/* ── Peter directly on linen, no container ── */}
                <div className="flex flex-col items-center gap-4">
                  <PeterAvatar mood="morning" size={56} />

                  {/* Speech card */}
                  <div className="w-full bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                    {isGenerating ? (
                      <div className="flex gap-2 items-center h-6">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-amethyst-600/40"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p
                        className="font-serif italic leading-relaxed text-[#2C1A14] text-[15px]"
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {morningStory}
                      </p>
                    )}
                  </div>
                </div>

                {/* Today's Practice card */}
                {!isGenerating && morningAction && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.6, delay: 0.15 }}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
                  >
                    <p className="text-xs font-semibold tracking-widest uppercase text-amethyst-600 mb-3">
                      Today&apos;s Practice
                    </p>
                    <p className="text-[#2C1A14] font-medium leading-relaxed text-[15px]">
                      {morningAction}
                    </p>
                  </motion.div>
                )}

                {/* CTA button */}
                {!isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <button
                      onClick={handleMorningRead}
                      className="w-full bg-amethyst-600 text-white font-semibold py-4 rounded-2xl hover:bg-amethyst-700 transition-colors text-base"
                    >
                      I&apos;ll practice this today
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

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
                    <div className="bg-white rounded-2xl p-4 flex items-start gap-3 border border-gray-100">
                      <Sun size={16} className="text-amethyst-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-[#6B4C3B] leading-relaxed">{morningAction}</p>
                    </div>

                    {/* Peter + question */}
                    <div className="flex flex-col items-center gap-4 pt-2">
                      <PeterAvatar mood="evening" size={56} />
                      <p className="font-serif italic text-[#6B4C3B] text-[15px] text-center leading-relaxed">
                        Did you practice today? Even a small attempt counts.
                      </p>
                    </div>

                    {/* Hold-to-verify button */}
                    <div className="pt-2">
                      <button
                        onPointerDown={() => setIsHolding(true)}
                        onPointerUp={() => setIsHolding(false)}
                        onPointerLeave={() => setIsHolding(false)}
                        className="relative w-full overflow-hidden bg-white border border-amethyst-600/20 rounded-2xl py-4 select-none"
                        style={{ touchAction: 'none' }}
                      >
                        <div
                          className="absolute inset-0 bg-amethyst-600 origin-left transition-transform duration-[3000ms] ease-linear"
                          style={{ transform: `scaleX(${isHolding ? 1 : 0})` }}
                          onTransitionEnd={(e) => {
                            if (isHolding && e.propertyName === 'transform') {
                              setActionVerified(true);
                            }
                          }}
                        />
                        <span className={`relative z-10 transition-colors duration-500 text-sm font-semibold tracking-wide ${isHolding ? 'text-white' : 'text-[#6B4C3B]'}`}>
                          Hold to verify I did it
                        </span>
                      </button>

                      {/* Dev override only */}
                      {process.env.NODE_ENV === 'development' && (
                        <button
                          onClick={() => setActionVerified(true)}
                          className="mt-4 text-[10px] text-[#6B4C3B]/40 hover:text-[#6B4C3B]/70 block w-full text-center uppercase font-semibold"
                        >
                          Skip Hold (Dev)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Chat state (actionVerified) ── */
                <>
                  {/* Morning action reminder — slim card at top */}
                  <div className="mx-4 mt-3 mb-1 bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-start gap-3">
                    <Sun size={15} className="text-amethyst-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#6B4C3B] leading-relaxed">
                      <span className="font-semibold text-[#2C1A14] mr-1">Today&apos;s action:</span>
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
                      className="px-4 pt-4 pb-6 border-t border-gray-100 bg-gray-50"
                    >
                      <p className="text-center text-sm text-[#6B4C3B] mb-3 font-serif italic">
                        Your reflection is complete.
                      </p>
                      <button
                        onClick={handleCompleteDay}
                        disabled={isSaving}
                        className="w-full bg-amethyst-600 text-white font-semibold py-4 rounded-2xl hover:bg-amethyst-700 transition-colors disabled:opacity-50 text-base"
                      >
                        {isSaving ? 'Synthesizing...' : `Complete Day ${currentDay}`}
                      </button>
                    </motion.div>
                  ) : canCompleteDay ? (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
                      className="px-4 py-4 border-t border-gray-100 bg-gray-50"
                    >
                      <button
                        onClick={handleCompleteDay}
                        disabled={isSaving}
                        className="w-full bg-amethyst-600 text-white font-semibold py-4 rounded-2xl hover:bg-amethyst-700 transition-colors disabled:opacity-50 text-base"
                      >
                        {isSaving ? 'Synthesizing...' : `Complete Day ${currentDay}`}
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
                sessionId={sessionId}
                morningAction={morningAction}
                journeyTitle={journeyTitle}
                onComplete={() => {
                  fireElegantConfetti();
                  router.push('/dashboard');
                }}
              />
            </motion.div>
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
                  <h2 className="font-serif italic text-[#2C1A14] text-2xl text-center mt-6">
                    Day {currentDay - 1} complete.
                  </h2>

                  {/* Secondary text */}
                  <p className="text-[#6B4C3B] text-center mt-2 leading-relaxed">
                    You showed up. That&apos;s everything.
                  </p>

                  {/* Streak badge card */}
                  <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mt-6 max-w-xs w-full text-center">
                    <Flame size={28} className="text-brand-sand mx-auto mb-2" />
                    <p className="text-brand-sand font-bold text-2xl">{currentDay - 1} days</p>
                    <p className="text-[#6B4C3B] text-sm mt-1">Consistent growth.</p>
                  </div>

                  {/* Return button */}
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-amethyst-600 text-white font-semibold py-4 rounded-2xl hover:bg-amethyst-700 transition-colors text-base mt-6"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </motion.div>
            )
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

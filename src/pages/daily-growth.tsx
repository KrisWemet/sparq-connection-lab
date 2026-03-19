import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ChevronRight, CheckCircle } from 'lucide-react';
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

type Phase = 'loading' | 'morning' | 'evening' | 'complete';

const EVENING_OPENER: PeterMessage = {
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

  const [eveningMessages, setEveningMessages] = useState<PeterMessage[]>([EVENING_OPENER]);
  const [isEveningLoading, setIsEveningLoading] = useState(false);
  const [eveningTurns, setEveningTurns] = useState(0);
  const [canCompleteDay, setCanCompleteDay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // New states for the Put the Phone Down Quest
  const [actionVerified, setActionVerified] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    if (actionVerified && user) {
      analyticsService.trackEvent('daily_action_verified', {
        day: currentDay,
        session_id: sessionId
      });
    }
  }, [actionVerified, user, currentDay, sessionId]);

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
          const session = payload.session;
          if (session) {
            setSessionId(session.id);
            setCurrentDay(session.day_index ?? 1);
            setMorningStory(stripMd(session.morning_story || ''));
            setMorningAction(stripMd(session.morning_action || ''));
            if (session.status === 'completed') {
              setPhase('complete');
            } else if (session.status === 'morning_viewed' || session.status === 'evening_active') {
              setPhase('evening');
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
          eveningContext: { day: currentDay, morningAction, turnNumber: newTurn },
        }),
      });
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      const peterMsg: PeterMessage = { role: 'assistant', content: data.message };
      setEveningMessages([...updated, peterMsg]);

      if (newTurn >= 2) setCanCompleteDay(true);
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
          setPhase('complete');
          fireElegantConfetti();

          analyticsService.trackEvent('daily_session_completed', {            day: currentDay,
            session_id: sessionId,
            is_graduation: currentDay >= 14
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

  return (
    <div className="min-h-screen bg-brand-linen flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-brand-linen">
            <span className="text-sm font-bold text-brand-primary">D</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-black">Day {currentDay} of 14</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {phase === 'morning' ? 'Morning Practice' : phase === 'evening' ? 'Night Check-in' : 'Complete!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-brand-linen text-zinc-600">
          {phase === 'morning' ? <Sun size={12} /> : phase === 'evening' ? <Moon size={12} /> : <CheckCircle size={12} />}
          <span className="ml-1">
            {phase === 'morning' ? 'Morning' : phase === 'evening' ? 'Evening' : 'Done'}
          </span>
        </div>
      </div>

      <DailyTimeline phase={phase} actionVerified={actionVerified} />

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
              className="h-full overflow-y-auto px-4 py-8"
            >
              <div className="max-w-lg mx-auto space-y-6">
                {/* Peter's story bubble */}
                <div className="flex items-end gap-3">
                  <div className="flex-shrink-0">
                    <Image src="/images/peter-default.png" alt="Peter" width={44} height={44} style={{ width: 44, height: 44, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }} />
                  </div>
                  <div className="bg-white rounded-3xl rounded-bl-xl px-6 py-6 border border-zinc-100 shadow-sm text-[15px] leading-relaxed text-zinc-700 font-sans flex-1">
                    {isGenerating ? (
                      <div className="flex gap-1.5 items-center h-5">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-zinc-300 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p style={{ whiteSpace: 'pre-wrap' }}>{morningStory}</p>
                    )}
                  </div>
                </div>

                {/* Today's Action */}
                {!isGenerating && morningAction && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.6, delay: 0.2 }}
                    className="bg-white border border-zinc-100 shadow-sm rounded-3xl p-6"
                  >
                    <p className="text-[11px] font-bold text-brand-primary uppercase tracking-wider mb-2">
                      Today&apos;s Action
                    </p>
                    <p className="text-black text-base leading-relaxed">{morningAction}</p>
                  </motion.div>
                )}

                {/* CTA button */}
                {!isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    <button
                      onClick={handleMorningRead}
                      className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors text-base shadow-sm"
                    >
                      I&apos;ll practice this today
                      <ChevronRight size={18} />
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
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center mb-6">
                    <Sun size={28} className="text-brand-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-black mb-3 tracking-tight">Did you do the step?</h3>
                  <p className="text-zinc-600 mb-10 max-w-sm text-base">
                    &quot;{morningAction}&quot;
                  </p>

                  <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm max-w-sm w-full mb-8">
                    <p className="text-lg font-semibold text-black mb-2">Put the Phone Down.</p>
                    <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                      Sparq works when you practice in real life. If you have not done it yet, close the app and go do it now.
                    </p>
                    <button
                      onPointerDown={() => {
                        setIsHolding(true);
                      }}
                      onPointerUp={() => setIsHolding(false)}
                      onPointerLeave={() => setIsHolding(false)}
                      className="relative w-full overflow-hidden bg-brand-linen border border-zinc-200 text-black font-semibold py-4 rounded-2xl select-none"
                      style={{ touchAction: 'none' }}
                    >
                      <div
                        className="absolute inset-0 bg-brand-primary origin-left transition-transform duration-3000 ease-linear"
                        style={{ transform: `scaleX(${isHolding ? 1 : 0})` }}
                        onTransitionEnd={(e) => {
                          if (isHolding && e.propertyName === 'transform') {
                            setActionVerified(true);
                          }
                        }}
                      />
                      <span className={`relative z-10 transition-colors duration-500 text-sm tracking-wide ${isHolding ? 'text-white' : 'text-zinc-600'}`}>
                        Hold to verify I did it
                      </span>
                    </button>
                    {/* Dev override only */}
                    {process.env.NODE_ENV === 'development' && (
                      <button
                        onClick={() => setActionVerified(true)}
                        className="mt-6 text-[10px] text-zinc-400 hover:text-zinc-600 block w-full text-center uppercase font-semibold"
                      >
                        Skip Hold (Dev)
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Today's action reminder */}
                  <div className="mx-4 mt-3 mb-1 bg-white border border-zinc-100 shadow-sm rounded-2xl px-5 py-3 flex items-start gap-3">
                    <Sun size={16} className="text-brand-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      <span className="font-semibold text-black mr-1">Today&apos;s action:</span> {morningAction}
                    </p>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <PeterChat
                      messages={eveningMessages}
                      onUserMessage={handleEveningMessage}
                      isLoading={isEveningLoading}
                      placeholder="How did it go today?"
                    />
                  </div>

                  {canCompleteDay && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
                      className="bg-white border-t border-zinc-200 px-4 py-4"
                    >
                      <button
                        onClick={handleCompleteDay}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white text-base font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <CheckCircle size={18} />
                        {isSaving ? 'Synthesizing...' : `Complete Day ${currentDay}`}
                      </button>
                    </motion.div>
                  )}
                </>
              )}
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
                className="h-full flex flex-col items-center justify-center px-6 text-center"
              >
                <div className="relative w-24 h-24 flex items-center justify-center mb-8 mx-auto rounded-full bg-white shadow-sm border border-zinc-100">
                  <CheckCircle size={40} className="text-brand-primary" />
                </div>

                <h2 className="text-3xl font-bold text-black mb-3 tracking-tight">
                  Day {currentDay - 1} complete.
                </h2>
                <p className="text-zinc-500 text-lg mb-10 max-w-xs leading-relaxed">
                  You&apos;re showing up. That&apos;s everything. Rest well and return tomorrow for Day {currentDay}.
                </p>

                <button
                  onClick={() => router.push('/go-connect')}
                  className="bg-brand-primary text-white font-semibold px-8 py-4 rounded-2xl hover:bg-brand-hover shadow-sm transition-colors text-base"
                >
                  Begin Real World Mission
                </button>
              </motion.div>
            )
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

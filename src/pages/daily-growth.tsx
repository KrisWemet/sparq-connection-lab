import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { PeterChat } from '@/components/PeterChat';
import { PeterMessage, UserInsights } from '@/lib/peterService';

type Phase = 'loading' | 'morning' | 'evening' | 'complete';

// Parse Peter's morning response into story + action
function parseMorningContent(raw: string): { story: string; action: string } {
  const match = raw.match(/Today['']s Action[:\s]+(.+?)$/ms);
  if (match) {
    return {
      story: raw.substring(0, raw.indexOf(match[0])).trim(),
      action: match[1].trim(),
    };
  }
  return { story: raw, action: 'Do one small kind thing for your partner today.' };
}

const EVENING_OPENER: PeterMessage = {
  role: 'assistant',
  content: "Hey, welcome back! 🌙 How did today's action go? Even if it was a tiny thing — I want to hear all about it.",
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
  const [quickReplies, setQuickReplies] = useState<string[]>([
    'It went well', 'It was hard', "I didn't try it",
  ]);
  const [memoryContext, setMemoryContext] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!user) return;

    (async () => {
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

      // Load Peter's memories for this user (for context in evening chat)
      try {
        const memRes = await fetch(`/api/peter/memories?userId=${user.id}&limit=8`);
        if (memRes.ok) {
          const memData = await memRes.json();
          if (memData.memories?.length > 0) {
            const lines = memData.memories.map(
              (m: { memory_text: string; source_day?: number }) => {
                const dayNote = m.source_day ? ` (Day ${m.source_day})` : '';
                return `- ${m.memory_text}${dayNote}`;
              }
            );
            setMemoryContext(
              `\n\nThings you remember about this person:\n${lines.join('\n')}\nUse these naturally — don't list them, just weave them into conversation when relevant.`
            );
          }
        }
      } catch {
        // Non-critical — proceed without memories
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
        setMorningStory(entry.morning_story || '');
        setMorningAction(entry.morning_action || '');
        setPhase('evening');
        return;
      }

      // Need morning story — use cached or generate
      setPhase('morning');
      if (entry?.morning_story) {
        setMorningStory(entry.morning_story);
        setMorningAction(entry.morning_action || '');
        return;
      }

      // Generate fresh morning story
      setIsGenerating(true);
      try {
        const res = await fetch('/api/peter/morning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ day, insights: userInsights }),
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
        setMorningStory("Good morning! 🌅 Today's story is loading — come back in a moment.");
        setMorningAction('Try giving your partner one genuine compliment today.');
      } finally {
        setIsGenerating(false);
      }
    })();
  }, [user, authLoading, router]);

  const handleMorningRead = async () => {
    if (!user) return;
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

    const newTurn = eveningTurns + 1;
    const userMsg: PeterMessage = { role: 'user', content: text };
    const updated = [...eveningMessages, userMsg];
    setEveningMessages(updated);
    setEveningTurns(newTurn);
    setIsEveningLoading(true);
    setQuickReplies([]); // Clear chips once user sends a message

    try {
      const systemOverride = `You are Peter, a warm otter companion. The user is doing their evening check-in for Day ${currentDay} of their relationship journey. Today's action was: "${morningAction}". Reflect back what you heard warmly. Celebrate their effort, not the outcome. 3-4 sentences, no clinical terms. If this is their second message or beyond, add a warm wrap-up and tell them you'll have something fresh for them tomorrow.${memoryContext}`;

      const res = await fetch('/api/peter/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, systemOverride }),
      });
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      const peterMsg: PeterMessage = { role: 'assistant', content: data.message };
      setEveningMessages([...updated, peterMsg]);

      // Show contextual follow-up chips
      if (newTurn === 1) {
        setQuickReplies(['Tell me more', 'That makes sense', 'I have a question']);
      } else if (newTurn >= 2) {
        setQuickReplies(['Thanks, Peter', "I'll try that"]);
      }

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

      // Extract memories from this conversation (fire-and-forget)
      fetch('/api/peter/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          messages: eveningMessages,
          sourceType: 'daily_growth',
          day: currentDay,
        }),
      }).catch(() => {}); // Non-critical

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
    } catch (err) {
      console.error('Complete day error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading screen
  if (authLoading || phase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🦦</div>
          <p className="text-gray-500 text-sm">Getting your day ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-sm">
            🦦
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Day {currentDay} of 14</p>
            <p className="text-xs text-gray-500">
              {phase === 'morning' ? 'Morning Story' : phase === 'evening' ? 'Evening Check-in' : 'Complete!'}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${
          phase === 'morning'
            ? 'bg-amber-100 text-amber-700'
            : phase === 'evening'
            ? 'bg-indigo-100 text-indigo-700'
            : 'bg-teal-100 text-teal-700'
        }`}>
          {phase === 'morning' ? <Sun size={12} /> : phase === 'evening' ? <Moon size={12} /> : <CheckCircle size={12} />}
          <span className="ml-1">
            {phase === 'morning' ? 'Morning' : phase === 'evening' ? 'Evening' : 'Done'}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── MORNING PHASE ── */}
          {phase === 'morning' && (
            <motion.div
              key="morning"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto px-4 py-6"
            >
              <div className="max-w-lg mx-auto space-y-5">
                {/* Peter's story bubble */}
                <div className="flex items-end gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                    🦦
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-4 shadow-sm border border-gray-100 text-sm leading-relaxed text-gray-800 flex-1">
                    {isGenerating ? (
                      <div className="flex gap-1 items-center h-5">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-teal-400 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
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
                    transition={{ delay: 0.25 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5"
                  >
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">
                      Today's Action
                    </p>
                    <p className="text-gray-800 text-sm leading-relaxed">{morningAction}</p>
                  </motion.div>
                )}

                {/* CTA button */}
                {!isGenerating && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={handleMorningRead}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-teal-500 to-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                  >
                    Got it — I'll try this today
                    <ChevronRight size={16} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── EVENING PHASE ── */}
          {phase === 'evening' && (
            <motion.div
              key="evening"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {/* Today's action reminder */}
              <div className="mx-4 mt-3 mb-1 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 flex items-start gap-2">
                <Sun size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">Today's action:</span> {morningAction}
                </p>
              </div>

              <div className="flex-1 overflow-hidden">
                <PeterChat
                  messages={eveningMessages}
                  onUserMessage={handleEveningMessage}
                  isLoading={isEveningLoading}
                  placeholder="How did it go today?"
                  quickReplies={quickReplies}
                />
              </div>

              {canCompleteDay && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-t border-gray-100 px-4 py-3"
                >
                  <button
                    onClick={handleCompleteDay}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    <CheckCircle size={16} />
                    {isSaving ? 'Saving...' : `Complete Day ${currentDay}`}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── COMPLETE PHASE ── */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="h-full flex flex-col items-center justify-center px-6 text-center"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl mb-6"
              >
                🦦
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {currentDay - 1 >= 14 ? "You did it! All 14 days! 🎉" : `Day ${currentDay - 1} complete! 🎉`}
              </h2>
              <p className="text-gray-500 text-sm mb-8 max-w-xs leading-relaxed">
                {currentDay - 1 >= 14
                  ? "You've built something real. Your Skill Tree is now unlocked — let's keep going."
                  : `You're showing up. That's everything. Come back tomorrow for Day ${currentDay}.`}
              </p>

              <button
                onClick={() => router.push(currentDay - 1 >= 14 ? '/skill-tree' : '/dashboard')}
                className="bg-gradient-to-br from-teal-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
              >
                {currentDay - 1 >= 14 ? 'Unlock Skill Tree' : 'Back to Dashboard'}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

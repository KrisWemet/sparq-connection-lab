import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle2, ChevronRight, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/lib/subscription-provider';
import { supabase } from '@/lib/supabase';
import { PeterChat } from '@/components/PeterChat';
import { PeterMessage } from '@/lib/peterService';

type TrackKey = 'communication' | 'conflict' | 'intimacy';
type LevelKey = 'basic' | 'advanced' | 'expert';

interface SkillProgress {
  completed_at: string | null;
}

type ProgressMap = Record<TrackKey, Record<LevelKey, SkillProgress | null>>;

interface ActiveNode {
  track: TrackKey;
  level: LevelKey;
  messages: PeterMessage[];
  action: string;
  isGenerating: boolean;
  canComplete: boolean;
  isComplete: boolean;
}

const TRACK_META: Record<TrackKey, {
  label: string;
  description: string;
  gradient: string;
  badge: string;
  accent: string;
}> = {
  communication: {
    label: 'Communication',
    description: 'Build clarity, empathy, and daily connection rituals.',
    gradient: 'from-indigo-500 to-blue-500',
    badge: 'bg-indigo-100 text-indigo-700',
    accent: 'border-indigo-400',
  },
  conflict: {
    label: 'Conflict Resolution',
    description: 'Turn tension into teamwork with structured repair skills.',
    gradient: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-100 text-amber-700',
    accent: 'border-amber-400',
  },
  intimacy: {
    label: 'Intimacy',
    description: 'Strengthen closeness with intentional affection and presence.',
    gradient: 'from-purple-500 to-pink-500',
    badge: 'bg-purple-100 text-purple-700',
    accent: 'border-purple-400',
  },
};

const LEVEL_META: Record<LevelKey, { label: string; description: Record<TrackKey, string>; premium: boolean }> = {
  basic: {
    label: 'Basic',
    premium: false,
    description: {
      communication: 'Active listening, daily check-ins, and gratitude prompts.',
      conflict: 'Name the issue, cool-down routines, and reset signals.',
      intimacy: 'Affection rituals, appreciation moments, and playful sparks.',
    },
  },
  advanced: {
    label: 'Advanced',
    premium: true,
    description: {
      communication: 'Repair scripts, difficult conversations, and de-escalation.',
      conflict: 'Negotiation frameworks and repair rituals after conflict.',
      intimacy: 'Vulnerability prompts and deeper connection exercises.',
    },
  },
  expert: {
    label: 'Expert',
    premium: true,
    description: {
      communication: 'Deep attunement, emotional mirroring, and shared meaning.',
      conflict: 'Reframe patterns, prevent triggers, and build trust fast.',
      intimacy: 'Shared visions, sacred routines, and intimacy mastery.',
    },
  },
};

const TRACKS: TrackKey[] = ['communication', 'conflict', 'intimacy'];
const LEVELS: LevelKey[] = ['basic', 'advanced', 'expert'];

function getSkillSystemPrompt(track: TrackKey, level: LevelKey, action?: string): string {
  const trackLabels: Record<TrackKey, string> = {
    communication: 'communication and connection',
    conflict: 'conflict resolution and repair',
    intimacy: 'emotional and physical intimacy',
  };
  const levelContext: Record<LevelKey, string> = {
    basic: 'foundational, approachable concepts',
    advanced: 'deeper, more nuanced skills',
    expert: 'advanced mastery and lasting patterns',
  };

  if (action) {
    // Evening reflection prompt
    return `You are Peter, a warm otter companion. The user is sharing their reflection on a ${level} skill exercise about ${trackLabels[track]}. The exercise was: "${action}". Reflect back what you heard warmly, celebrate their effort, and in 1 sentence tell them what this means for their relationship. 3-4 sentences total. No clinical terms.`;
  }

  // Morning story + action generation
  return `You are Peter, a warm otter companion. Generate a short skill exercise for ${level} level ${trackLabels[track]} (${levelContext[level]}).

Format exactly like this:
1. One warm sentence to open (like texting a friend good morning).
2. A short story about Alex and Sam (3-4 sentences) that demonstrates the skill WITHOUT naming the concept.
3. "Today's Action:" followed by one specific, doable task (1-2 sentences starting with a verb).

Keep it under 150 words. No clinical terms. Warm and encouraging.`;
}

function parseMorningContent(raw: string): { story: string; action: string } {
  const match = raw.match(/Today['']s Action[:\s]+(.+?)$/ms);
  if (match) {
    return {
      story: raw.substring(0, raw.indexOf(match[0])).trim(),
      action: match[1].trim(),
    };
  }
  return { story: raw, action: 'Practice this skill with your partner today.' };
}

function emptyProgress(): ProgressMap {
  return {
    communication: { basic: null, advanced: null, expert: null },
    conflict: { basic: null, advanced: null, expert: null },
    intimacy: { basic: null, advanced: null, expert: null },
  };
}

export default function SkillTree() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { subscription } = useSubscription();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [progress, setProgress] = useState<ProgressMap>(emptyProgress());
  const [loading, setLoading] = useState(true);
  const [activeNode, setActiveNode] = useState<ActiveNode | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isPremium = subscription?.tier === 'premium' || subscription?.tier === 'ultimate';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!user) return;

    (async () => {
      const { data: insightsRow } = await supabase
        .from('user_insights')
        .select('onboarding_day, skill_tree_unlocked')
        .eq('user_id', user.id)
        .single();

      setCurrentDay(insightsRow?.onboarding_day ?? 0);
      setIsUnlocked(insightsRow?.skill_tree_unlocked ?? false);

      const { data: progressRows } = await supabase
        .from('skill_progress')
        .select('track, level, completed_at')
        .eq('user_id', user.id);

      const map = emptyProgress();
      for (const row of progressRows ?? []) {
        const t = row.track as TrackKey;
        const l = row.level as LevelKey;
        if (map[t] && map[t][l] !== undefined) {
          map[t][l] = { completed_at: row.completed_at };
        }
      }
      setProgress(map);
      setLoading(false);
    })();
  }, [user, authLoading, router]);

  const isLevelDone = (track: TrackKey, level: LevelKey) =>
    !!progress[track][level]?.completed_at;

  const isLevelAvailable = (track: TrackKey, level: LevelKey): boolean => {
    if (!isUnlocked) return false;
    if (level === 'basic') return true;
    if (level === 'advanced') return isLevelDone(track, 'basic');
    if (level === 'expert') return isLevelDone(track, 'advanced');
    return false;
  };

  const isLevelPremiumLocked = (level: LevelKey): boolean => {
    return LEVEL_META[level].premium && !isPremium;
  };

  const handleNodeClick = async (track: TrackKey, level: LevelKey) => {
    if (!isLevelAvailable(track, level)) return;
    if (isLevelPremiumLocked(level)) {
      router.push('/subscription');
      return;
    }

    // Open the node panel and generate content
    setActiveNode({
      track,
      level,
      messages: [],
      action: '',
      isGenerating: true,
      canComplete: false,
      isComplete: isLevelDone(track, level),
    });

    try {
      const systemPrompt = getSkillSystemPrompt(track, level);
      const res = await fetch('/api/peter/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Generate the skill exercise.' }],
          systemOverride: systemPrompt,
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      const { story, action } = parseMorningContent(data.message);

      const openingMsg: PeterMessage = { role: 'assistant', content: story };
      setActiveNode(prev => prev ? {
        ...prev,
        messages: [openingMsg],
        action,
        isGenerating: false,
      } : null);
    } catch {
      setActiveNode(prev => prev ? {
        ...prev,
        messages: [{ role: 'assistant', content: "Hmm, something went wrong. Tap to try again!" }],
        isGenerating: false,
      } : null);
    }
  };

  const handleNodeMessage = async (text: string) => {
    if (!activeNode || activeNode.isGenerating) return;

    const userMsg: PeterMessage = { role: 'user', content: text };
    const updated = [...activeNode.messages, userMsg];
    setActiveNode(prev => prev ? { ...prev, messages: updated, isGenerating: true } : null);

    try {
      const systemOverride = getSkillSystemPrompt(activeNode.track, activeNode.level, activeNode.action);
      const res = await fetch('/api/peter/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, systemOverride }),
      });
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      const peterMsg: PeterMessage = { role: 'assistant', content: data.message };

      setActiveNode(prev => prev ? {
        ...prev,
        messages: [...updated, peterMsg],
        isGenerating: false,
        canComplete: true,
      } : null);
    } catch {
      setActiveNode(prev => prev ? {
        ...prev,
        messages: [...updated, { role: 'assistant', content: "Oops! Try that again? 🐟" }],
        isGenerating: false,
      } : null);
    }
  };

  const handleCompleteNode = async () => {
    if (!user || !activeNode || isSaving) return;
    setIsSaving(true);

    try {
      await supabase.from('skill_progress').upsert(
        {
          user_id: user.id,
          track: activeNode.track,
          level: activeNode.level,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,track,level' }
      );

      // Update local state
      setProgress(prev => ({
        ...prev,
        [activeNode.track]: {
          ...prev[activeNode.track],
          [activeNode.level]: { completed_at: new Date().toISOString() },
        },
      }));

      setActiveNode(prev => prev ? { ...prev, isComplete: true, canComplete: false } : null);
      setTimeout(() => setActiveNode(null), 1800);
    } catch (err) {
      console.error('Complete node error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🦦</div>
          <p className="text-sm text-gray-500">Loading your Skill Tree...</p>
        </div>
      </div>
    );
  }

  // ─── Locked gate ───────────────────────────────────────────────
  if (!isUnlocked) {
    const daysLeft = Math.max(0, 15 - currentDay);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-100 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">🌱</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Skill Tree Locked</h1>
        <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
          Complete the 14-day journey with Peter to unlock your personalized Skill Tree.
          {daysLeft > 0
            ? ` You have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go!`
            : ' You're almost there!'}
        </p>
        <div className="w-full max-w-xs bg-white rounded-full h-3 mb-6 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all"
            style={{ width: `${Math.min(100, ((currentDay - 1) / 14) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mb-8">Day {Math.max(1, currentDay)} of 14</p>
        <button
          onClick={() => router.push('/daily-growth')}
          className="bg-gradient-to-br from-teal-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
        >
          Continue with Peter
        </button>
      </div>
    );
  }

  // ─── Skill Tree ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-100">
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <h1 className="text-lg font-bold text-gray-900">Skill Tree</h1>
            </div>
            <p className="text-xs text-gray-500">Complete exercises to unlock new levels</p>
          </div>
          {!isPremium && (
            <button
              onClick={() => router.push('/subscription')}
              className="text-xs font-semibold px-3 py-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity"
            >
              Go Premium
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TRACKS.map(track => {
            const meta = TRACK_META[track];
            const completedCount = LEVELS.filter(l => isLevelDone(track, l)).length;
            const pct = Math.round((completedCount / 3) * 100);

            return (
              <div key={track} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Track header */}
                <div className={`bg-gradient-to-br ${meta.gradient} px-5 py-4`}>
                  <span className="text-white text-sm font-bold">{meta.label}</span>
                  <p className="text-white/80 text-xs mt-0.5">{meta.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-white/30 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-white/90 text-xs font-semibold">{pct}%</span>
                  </div>
                </div>

                {/* Level nodes */}
                <div className="p-4 space-y-3">
                  {LEVELS.map((level, idx) => {
                    const done = isLevelDone(track, level);
                    const available = isLevelAvailable(track, level);
                    const premLocked = isLevelPremiumLocked(level);
                    const prereqLocked = !available && !done;
                    const levelMeta = LEVEL_META[level];

                    let statusIcon = <Lock className="h-4 w-4" />;
                    let rowClass = 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed';
                    let statusBadge = 'bg-gray-100 text-gray-500';
                    let statusText = 'Locked';

                    if (done) {
                      statusIcon = <CheckCircle2 className="h-4 w-4" />;
                      rowClass = 'bg-emerald-50 border-emerald-200 cursor-pointer hover:bg-emerald-100';
                      statusBadge = 'bg-emerald-100 text-emerald-700';
                      statusText = 'Complete';
                    } else if (premLocked) {
                      rowClass = 'bg-gray-50 border-gray-200 cursor-pointer hover:bg-gray-100 opacity-70';
                      statusBadge = 'bg-purple-100 text-purple-700';
                      statusText = 'Premium';
                    } else if (available) {
                      rowClass = `bg-white border-2 ${meta.accent} cursor-pointer hover:shadow-sm transition-shadow`;
                      statusBadge = 'bg-blue-100 text-blue-700';
                      statusText = 'Start';
                      statusIcon = <ChevronRight className="h-4 w-4" />;
                    }

                    return (
                      <button
                        key={level}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${rowClass}`}
                        onClick={() => handleNodeClick(track, level)}
                        disabled={prereqLocked}
                      >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          done ? 'bg-emerald-500 text-white' :
                          available && !premLocked ? 'bg-gradient-to-br from-indigo-400 to-blue-500 text-white' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {statusIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-semibold text-gray-800">
                              Level {idx + 1}: {levelMeta.label}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge}`}>
                              {statusText}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                            {levelMeta.description[track]}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium upsell */}
        {!isPremium && (
          <div className="mt-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-bold text-lg">Unlock Advanced + Expert levels</p>
              <p className="text-indigo-200 text-sm mt-1">
                Go deeper with personalized coaching, repair rituals, and intimacy mastery.
              </p>
            </div>
            <button
              onClick={() => router.push('/subscription')}
              className="bg-white text-indigo-700 font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </main>

      {/* ─── Active Node Panel ─── */}
      <AnimatePresence>
        {activeNode && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-20"
              onClick={() => setActiveNode(null)}
            />

            {/* Slide-up panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-30 bg-white rounded-t-3xl shadow-2xl flex flex-col"
              style={{ maxHeight: '85vh' }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {TRACK_META[activeNode.track].label} — {LEVEL_META[activeNode.level].label}
                  </p>
                  {activeNode.action && (
                    <p className="text-xs text-amber-700 mt-0.5">
                      <span className="font-semibold">Action:</span> {activeNode.action}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveNode(null)}
                  className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat area */}
              <div className="flex-1 overflow-hidden">
                {activeNode.isComplete ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="text-5xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <p className="font-bold text-gray-800 text-lg">Level complete!</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {LEVEL_META[activeNode.level].level !== 'expert'
                        ? 'Next level is now unlocked.'
                        : 'You've mastered this track!'}
                    </p>
                  </div>
                ) : (
                  <PeterChat
                    messages={activeNode.messages}
                    onUserMessage={handleNodeMessage}
                    isLoading={activeNode.isGenerating}
                    placeholder="Share your reflection..."
                    inputDisabled={activeNode.isComplete}
                  />
                )}
              </div>

              {/* Complete button */}
              {activeNode.canComplete && !activeNode.isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 border-t border-gray-100"
                >
                  <button
                    onClick={handleCompleteNode}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSaving ? 'Saving...' : `Complete ${LEVEL_META[activeNode.level].label} Level`}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

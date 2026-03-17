import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle2, ChevronRight, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/lib/subscription-provider';
import { supabase } from '@/lib/supabase';
import { PeterChat } from '@/components/PeterChat';
import { PeterMessage } from '@/lib/peterService';
import { buildAuthedHeaders } from '@/lib/api-auth';

type TrackKey =
  | 'communication'
  | 'conflict_repair'
  | 'emotional_intimacy'
  | 'trust_security'
  | 'shared_vision_rituals'
  | 'root_cause_unearthing';
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
    gradient: 'from-brand-primary to-blue-500',
    badge: 'bg-brand-primary/10 text-brand-primary',
    accent: 'border-indigo-400',
  },
  conflict_repair: {
    label: 'Conflict Repair',
    description: 'Turn tension into teamwork with structured repair skills.',
    gradient: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-100 text-amber-700',
    accent: 'border-amber-400',
  },
  emotional_intimacy: {
    label: 'Emotional Intimacy',
    description: 'Strengthen closeness with intentional affection and presence.',
    gradient: 'from-purple-500 to-pink-500',
    badge: 'bg-purple-100 text-purple-700',
    accent: 'border-purple-400',
  },
  trust_security: {
    label: 'Trust & Security',
    description: 'Build emotional safety through consistency, honesty, and repair.',
    gradient: 'from-teal-500 to-emerald-500',
    badge: 'bg-teal-100 text-teal-700',
    accent: 'border-teal-400',
  },
  shared_vision_rituals: {
    label: 'Shared Vision & Rituals',
    description: 'Align values and create routines that keep connection strong.',
    gradient: 'from-sky-500 to-cyan-500',
    badge: 'bg-sky-100 text-sky-700',
    accent: 'border-sky-400',
  },
  root_cause_unearthing: {
    label: 'Root Cause Unearthing',
    description: 'Map core wounds and childhood patterns driving your triggers.',
    gradient: 'from-rose-500 to-red-500',
    badge: 'bg-rose-100 text-rose-700',
    accent: 'border-rose-400',
  },
};

const LEVEL_META: Record<LevelKey, { label: string; description: Record<TrackKey, string>; premium: boolean }> = {
  basic: {
    label: 'Basic',
    premium: false,
    description: {
      communication: 'Active listening, daily check-ins, and gratitude prompts.',
      conflict_repair: 'Name the issue, cool-down routines, and reset signals.',
      emotional_intimacy: 'Affection rituals, appreciation moments, and playful sparks.',
      trust_security: 'Reliability habits, transparent language, and safer expectations.',
      shared_vision_rituals: 'Weekly rituals, shared priorities, and values check-ins.',
      root_cause_unearthing: 'Identify surface triggers and your somatic (bodily) nervous system responses.',
    },
  },
  advanced: {
    label: 'Advanced',
    premium: true,
    description: {
      communication: 'Repair scripts, difficult conversations, and de-escalation.',
      conflict_repair: 'Negotiation frameworks and repair rituals after conflict.',
      emotional_intimacy: 'Vulnerability prompts and deeper connection exercises.',
      trust_security: 'Boundary alignment, reassurance scripts, and trust rebuilding.',
      shared_vision_rituals: 'Joint planning routines and meaningful recurring traditions.',
      root_cause_unearthing: 'Trace current relationship triggers back to family-of-origin patterns.',
    },
  },
  expert: {
    label: 'Expert',
    premium: true,
    description: {
      communication: 'Deep attunement, emotional mirroring, and shared meaning.',
      conflict_repair: 'Reframe patterns, prevent triggers, and build trust fast.',
      emotional_intimacy: 'Deep emotional bonding and long-term intimacy mastery.',
      trust_security: 'Sustained security through repair leadership and consistency.',
      shared_vision_rituals: 'Purpose-driven partnership rituals and legacy planning.',
      root_cause_unearthing: 'Core Wound Mapping and restructuring deeply held identity narratives.',
    },
  },
};

const TRACKS: TrackKey[] = [
  'communication',
  'conflict_repair',
  'emotional_intimacy',
  'trust_security',
  'shared_vision_rituals',
  'root_cause_unearthing',
];
const LEVELS: LevelKey[] = ['basic', 'advanced', 'expert'];

function getSkillSystemPrompt(track: TrackKey, level: LevelKey, action?: string): string {
  const trackLabels: Record<TrackKey, string> = {
    communication: 'communication and connection',
    conflict_repair: 'conflict repair and reconnection',
    emotional_intimacy: 'emotional intimacy and closeness',
    trust_security: 'trust and emotional safety',
    shared_vision_rituals: 'shared values and relationship rituals',
    root_cause_unearthing: 'core wound mapping and uncovering deep behavioral roots',
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
  const match = raw.match(/Today['\u2019]s Action[:\s]+([\s\S]+?)$/m);
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
    conflict_repair: { basic: null, advanced: null, expert: null },
    emotional_intimacy: { basic: null, advanced: null, expert: null },
    trust_security: { basic: null, advanced: null, expert: null },
    shared_vision_rituals: { basic: null, advanced: null, expert: null },
    root_cause_unearthing: { basic: null, advanced: null, expert: null },
  };
}

function normalizeTrackKey(track: string): TrackKey | null {
  if (track === 'communication') return 'communication';
  if (track === 'conflict' || track === 'conflict_repair') return 'conflict_repair';
  if (track === 'intimacy' || track === 'emotional_intimacy') return 'emotional_intimacy';
  if (track === 'trust_security') return 'trust_security';
  if (track === 'shared_vision_rituals') return 'shared_vision_rituals';
  if (track === 'root_cause_unearthing') return 'root_cause_unearthing';
  return null;
}

type TrackProgressMap = Record<TrackKey, { total_xp: number; current_level: string }>;

export default function SkillTree() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { subscription } = useSubscription();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [progress, setProgress] = useState<ProgressMap>(emptyProgress());
  const [trackProgress, setTrackProgress] = useState<TrackProgressMap>({
    communication: { total_xp: 0, current_level: 'basic' },
    conflict_repair: { total_xp: 0, current_level: 'basic' },
    emotional_intimacy: { total_xp: 0, current_level: 'basic' },
    trust_security: { total_xp: 0, current_level: 'basic' },
    shared_vision_rituals: { total_xp: 0, current_level: 'basic' },
    root_cause_unearthing: { total_xp: 0, current_level: 'basic' },
  });
  const [loading, setLoading] = useState(true);
  const [activeNode, setActiveNode] = useState<ActiveNode | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isPremium = subscription?.tier === 'premium';

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
        const t = normalizeTrackKey(row.track as string);
        const l = row.level as LevelKey;
        if (t && map[t] && map[t][l] !== undefined) {
          map[t][l] = { completed_at: row.completed_at };
        }
      }
      setProgress(map);

      // Fetch track XP/Level
      const { data: trackRows } = await supabase
        .from('user_skill_tracks')
        .select('track_key, total_xp, current_level')
        .eq('user_id', user.id);

      if (trackRows) {
        const tMap = { ...trackProgress };
        for (const row of trackRows) {
          const t = normalizeTrackKey(row.track_key);
          if (t) {
            tMap[t] = { total_xp: row.total_xp, current_level: row.current_level };
          }
        }
        setTrackProgress(tMap);
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const isLevelDone = (track: TrackKey, level: LevelKey) =>
    !!progress[track][level]?.completed_at;

  const getXPThreshold = (level: LevelKey): number => {
    if (level === 'basic') return 0;
    if (level === 'advanced') return 100;
    if (level === 'expert') return 300;
    return 0;
  };

  const isLevelAvailable = (track: TrackKey, level: LevelKey): boolean => {
    if (!isUnlocked) return false;
    const currentXp = trackProgress[track].total_xp;
    const threshold = getXPThreshold(level);
    
    // Level must meet XP threshold
    if (currentXp < threshold) return false;
    
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
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/peter/chat', {
        method: 'POST',
        headers,
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
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/peter/chat', {
        method: 'POST',
        headers,
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-sm text-zinc-500 tracking-wide font-medium">Loading Skill Tree...</p>
        </div>
      </div>
    );
  }

  // ─── Locked gate ───────────────────────────────────────────────
  if (!isUnlocked) {
    const daysLeft = Math.max(0, 15 - currentDay);
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6 text-center font-sans">
        <div className="relative w-24 h-24 flex items-center justify-center mb-6">
          <div className="text-5xl relative z-10 drop-shadow-md">🌱</div>
        </div>
        <h1 className="text-3xl font-serif text-zinc-100 mb-4 tracking-wide">Skill Tree Locked</h1>
        <p className="text-zinc-400 text-sm max-w-xs mb-10 leading-relaxed">
          Complete the 14-day journey with Peter to unlock your personalized curriculum.
          {daysLeft > 0
            ? ` You have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go!`
            : " You're almost there!"}
        </p>
        <div className="w-full max-w-xs bg-[#111111] border border-zinc-800 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-full bg-zinc-400 transition-all duration-1000"
            style={{ width: `${Math.min(100, ((currentDay - 1) / 14) * 100)}%` }}
          />
        </div>
        <p className="text-xs font-bold tracking-widest uppercase text-zinc-600 mb-10">Day {Math.max(1, currentDay)} of 14</p>
        <button
          onClick={() => router.push('/daily-growth')}
          className="bg-white text-black font-medium px-8 py-3.5 rounded-xl hover:bg-zinc-200 transition-colors tracking-wide text-sm"
        >
          Return to Peter
        </button>
      </div>
    );
  }

  // ─── Skill Tree ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] font-sans">
      <header className="bg-[#050505] border-b border-zinc-900 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h1 className="text-lg font-serif text-zinc-100 tracking-wide">Skill Tree</h1>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">Complete exercises to unlock new levels</p>
          </div>
          {!isPremium && (
            <button
              onClick={() => router.push('/subscription')}
              className="text-xs font-semibold px-4 py-2 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors"
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
            const currentXp = trackProgress[track].total_xp;

            return (
              <div key={track} className="bg-[#111111] rounded-2xl border border-zinc-800 overflow-hidden">
                {/* Track header */}
                <div className={`bg-zinc-900 border-b border-zinc-800 px-6 py-5 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <span className="text-zinc-200 text-[15px] font-bold tracking-wide">{meta.label}</span>
                      <p className="text-zinc-500 text-[13px] mt-1 font-medium leading-relaxed">{meta.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">{currentXp} XP</span>
                    </div>
                  </div>
                  <div className="relative z-10 mt-4 flex items-center gap-3">
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-zinc-400 transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-zinc-500 text-xs font-bold tracking-wider">{pct}%</span>
                  </div>
                </div>

                {/* Level nodes */}
                <div className="p-5 space-y-3">
                  {LEVELS.map((level, idx) => {
                    const done = isLevelDone(track, level);
                    const threshold = getXPThreshold(level);
                    const hasXp = currentXp >= threshold;
                    const available = isLevelAvailable(track, level);
                    const premLocked = isLevelPremiumLocked(level);
                    const levelMeta = LEVEL_META[level];
                    
                    const xpLocked = !hasXp && !done;
                    const prereqLocked = !available && !done && !xpLocked;

                    let statusIcon = <Lock className="h-4 w-4" />;
                    let rowClass = 'bg-[#050505]/40 border-zinc-900 opacity-50 cursor-not-allowed';
                    let statusBadge = 'bg-[#050505] text-zinc-600 border border-zinc-900';
                    let statusText = 'LOCKED';

                    if (done) {
                      statusIcon = <CheckCircle2 className="h-4 w-4" />;
                      rowClass = 'bg-[#141414] border-zinc-800 cursor-pointer hover:bg-zinc-800/80';
                      statusBadge = 'bg-zinc-800 text-zinc-400 border border-zinc-700';
                      statusText = 'DONE';
                    } else if (xpLocked) {
                      statusText = `${threshold} XP`;
                      statusBadge = 'bg-zinc-900/50 text-zinc-600 border border-zinc-800';
                    } else if (premLocked) {
                      rowClass = 'bg-[#141414] border-zinc-800/50 cursor-pointer hover:bg-zinc-800/80 opacity-80';
                      statusBadge = 'bg-zinc-900 text-zinc-500 border border-zinc-800';
                      statusText = 'PREMIUM';
                    } else if (available) {
                      rowClass = `bg-white border-white cursor-pointer hover:bg-zinc-200 transition-all`;
                      statusBadge = 'bg-zinc-200 text-black border border-zinc-300';
                      statusText = 'START';
                      statusIcon = <ChevronRight className="h-4 w-4" />;
                    } else if (prereqLocked) {
                      statusText = 'PREREQ';
                    }

                    return (
                      <button
                        key={level}
                        className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-300 ${rowClass}`}
                        onClick={() => handleNodeClick(track, level)}
                        disabled={prereqLocked}
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-zinc-800 text-zinc-300' :
                          available && !premLocked ? 'bg-black text-white' :
                            'bg-[#050505] border border-zinc-900 text-zinc-600'
                          }`}>
                          {statusIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-sm font-bold tracking-wide ${available && !premLocked && !done ? 'text-black' : 'text-zinc-200'}`}>
                              Level {idx + 1}: {levelMeta.label}
                            </span>
                            <span className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full ${statusBadge}`}>
                              {statusText}
                            </span>
                          </div>
                          <p className={`text-xs mt-1.5 leading-relaxed ${available && !premLocked && !done ? 'text-zinc-600' : 'text-zinc-400'}`}>
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
          <div className="mt-8 bg-[#111111] border border-zinc-800 rounded-2xl p-8 text-zinc-100 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-serif text-xl tracking-wide">Unlock Advanced + Expert mastery</p>
              <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
                Go deeper with personalized coaching, repair rituals, and profound emotional attunement.
              </p>
            </div>
            <button
              onClick={() => router.push('/subscription')}
              className="relative z-10 bg-white text-black font-semibold px-8 py-3.5 rounded-xl hover:bg-zinc-200 transition-colors flex-shrink-0"
            >
              Start Trial
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
              className="fixed inset-0 bg-[#050505]/70 backdrop-blur-sm z-[60]"
              onClick={() => setActiveNode(null)}
            />

            {/* Slide-up panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[70] bg-[#111111] border-t border-zinc-800 rounded-t-[2.5rem] flex flex-col"
              style={{ maxHeight: '85vh' }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {TRACK_META[activeNode.track].label} — {LEVEL_META[activeNode.level].label}
                  </p>
                  {activeNode.action && (
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-sm">
                      <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[9px] mr-1">Tactic:</span> {activeNode.action}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveNode(null)}
                  className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Chat area */}
              <div className="flex-1 overflow-hidden">
                {activeNode.isComplete ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="relative w-24 h-24 flex items-center justify-center mb-6 mx-auto rounded-full bg-zinc-900 border border-zinc-800">
                      <CheckCircle2 className="h-8 w-8 text-zinc-400" />
                    </div>
                    <p className="font-serif text-2xl text-zinc-100 tracking-wide mb-2">Protocol learned.</p>
                    <p className="text-zinc-500 text-sm">
                      {activeNode.level !== 'expert'
                        ? 'The next skill phase is now unsealed.'
                        : "You've completely mastered this protocol."}
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
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
                  className="px-6 py-5 border-t border-zinc-800 bg-[#111111]"
                >
                  <button
                    onClick={handleCompleteNode}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium tracking-wide py-4 text-sm rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSaving ? 'Saving...' : `Complete ${LEVEL_META[activeNode.level].label} Protocol`}
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

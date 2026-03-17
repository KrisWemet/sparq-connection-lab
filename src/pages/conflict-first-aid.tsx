import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const RESET_PROTOCOL = [
  'Pause. Put both feet on the floor. Inhale for 4, exhale for 6, five times.',
  'Use this line: "I care about us, and I need 20 minutes to calm down so I can talk with care."',
  'Do not text your argument while flooding. Wait until your body is calmer.',
  'Return at the promised time and start with one ownership statement.',
];

const REPAIR_STARTERS = [
  'I got reactive. I want to try that again with more care.',
  'Can we reset? You matter to me more than winning this.',
  'I hear that you felt hurt. I want to understand better.',
];

type ConflictStyle = 'avoidant' | 'volatile' | 'validating' | null;
type LoveLanguage = 'words' | 'acts' | 'gifts' | 'time' | 'touch' | null;

interface PersonalizedGuidance {
  dynamic: string;
  repairStarters: string[];
}

function getPersonalizedGuidance(
  userConflict: ConflictStyle,
  partnerConflict: ConflictStyle,
  partnerLoveLang: LoveLanguage,
): PersonalizedGuidance | null {
  if (!userConflict && !partnerConflict) return null;

  let dynamic = '';

  if (userConflict === 'volatile' && partnerConflict === 'avoidant') {
    dynamic = "Your instinct is to stay in the conversation and work it out right now. Your partner's instinct is to pull back. Neither is wrong — but the combination can feel like chasing and withdrawing. When they go quiet, it usually isn't rejection — it's self-regulation. Give them a time: 'Can we come back to this in 20 minutes?'";
  } else if (userConflict === 'avoidant' && partnerConflict === 'volatile') {
    dynamic = "Your instinct is to step back when things get heated. Your partner's instinct is to press in and resolve things. The risk: they feel abandoned, you feel overwhelmed. A simple signal helps both of you — 'I'm not done with this conversation, I just need 20 minutes.'";
  } else if (userConflict === 'avoidant' && partnerConflict === 'avoidant') {
    dynamic = "You both tend to step back when things get tense. That can feel peaceful, but the risk is that important things never fully get said. After you've both calmed down, one of you has to gently open the door: 'I want to talk about what happened when we're both ready.'";
  } else if (userConflict === 'volatile' && partnerConflict === 'volatile') {
    dynamic = "You both feel things intensely and want to resolve things quickly. That passion is actually a strength — but when you're both flooded, it's heat without light. A 5-minute pause, agreed to by both of you, can lower the temperature enough to actually hear each other.";
  } else if (userConflict === 'validating' || partnerConflict === 'validating') {
    dynamic = "At least one of you naturally seeks to make sure both sides feel heard before moving forward. Lean into that — it's a gift. Make it explicit: 'Before we solve anything, can you tell me what I said that landed hardest?'";
  }

  if (!dynamic) return null;

  const repairStarters: string[] = [];
  if (partnerLoveLang === 'words') {
    repairStarters.push("A simple 'I love you and I want to get this right' goes a long way for your partner.");
  } else if (partnerLoveLang === 'touch') {
    repairStarters.push("A gentle hand on their arm or a hug can lower the temperature faster than words.");
  } else if (partnerLoveLang === 'acts') {
    repairStarters.push("Doing something small and thoughtful — making them tea, tidying something — signals repair without words.");
  } else if (partnerLoveLang === 'time') {
    repairStarters.push("Asking for a quiet moment together, even just sitting side by side, can signal you want to reconnect.");
  } else if (partnerLoveLang === 'gifts') {
    repairStarters.push("A small, thoughtful gesture — even a note — can signal that you care more than you're letting on right now.");
  }

  return { dynamic, repairStarters };
}

export default function ConflictFirstAidPage() {
  const router = useRouter();
  const { user } = useAuth();
  const episodeIdRef = useRef<string | null>(null);
  const [personalizedGuidance, setPersonalizedGuidance] = useState<PersonalizedGuidance | null>(null);

  // State for the somatic interruption
  const [phase, setPhase] = useState<'somatic' | 'tools'>('somatic');
  const [timeLeft, setTimeLeft] = useState(60);
  const [breathState, setBreathState] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Fetch personalized guidance on mount
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch('/api/profile/traits?include_partner=true', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;

        const data = await res.json();
        const traits: { trait_key: string; inferred_value: string }[] = data.traits || [];
        const partnerTraits: { trait_key: string; inferred_value: string }[] = data.partner_traits || [];

        const userConflict = (traits.find(t => t.trait_key === 'conflict_style')?.inferred_value as ConflictStyle) ?? null;
        const partnerConflict = (partnerTraits.find(t => t.trait_key === 'conflict_style')?.inferred_value as ConflictStyle) ?? null;
        const partnerLoveLang = (partnerTraits.find(t => t.trait_key === 'love_language')?.inferred_value as LoveLanguage) ?? null;

        const guidance = getPersonalizedGuidance(userConflict, partnerConflict, partnerLoveLang);
        if (guidance) setPersonalizedGuidance(guidance);
      } catch { }
    })();
  }, [user]);

  // Auto-create conflict episode on page open
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token || cancelled) return;

        const res = await fetch('/api/conflicts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ tool_used: 'conflict_first_aid' }),
        });

        if (res.ok) {
          const data = await res.json();
          episodeIdRef.current = data.episode?.id || null;
        }
      } catch { }
    })();

    return () => { cancelled = true; };
  }, [user]);

  // Auto-resolve on leaving the page
  const resolveEpisode = useCallback(async () => {
    const episodeId = episodeIdRef.current;
    if (!episodeId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const payload = JSON.stringify({
        episode_id: episodeId,
        resolution_method: 'used_tool',
      });

      await fetch('/api/conflicts/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: payload,
        keepalive: true,
      });
    } catch { }
    episodeIdRef.current = null;
  }, []);

  useEffect(() => {
    const handleVisChange = () => {
      if (document.visibilityState === 'hidden') resolveEpisode();
    };
    document.addEventListener('visibilitychange', handleVisChange);
    window.addEventListener('beforeunload', resolveEpisode);

    return () => {
      document.removeEventListener('visibilitychange', handleVisChange);
      window.removeEventListener('beforeunload', resolveEpisode);
      resolveEpisode();
    };
  }, [resolveEpisode]);

  // Somatic timer and breathing logic
  useEffect(() => {
    if (phase !== 'somatic') return;

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhase('tools');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const breathCycle = (time: number) => {
      const cycleTime = time % 10;
      if (cycleTime > 6) setBreathState('inhale');
      else setBreathState('exhale');
    };

    const breathInterval = setInterval(() => {
      setTimeLeft(curr => {
        breathCycle(curr);
        return curr;
      });
    }, 100);

    return () => {
      clearInterval(timerInterval);
      clearInterval(breathInterval);
    };
  }, [phase]);

  if (phase === 'somatic') {
    return (
      <div className="min-h-screen bg-brand-linen flex flex-col items-center justify-center text-black transition-colors duration-1000">
        <div className="absolute top-6 left-6">
          <button
            onClick={() => router.back()}
            className="text-zinc-500 hover:text-zinc-800 text-sm font-medium transition-colors"
          >
            ← Retreat
          </button>
        </div>

        <div className="text-center space-y-12 w-full max-w-md px-6">
          <h1 className="text-2xl tracking-tight text-black font-semibold">
            Before we enter the conflict,<br />we must calm the body.
          </h1>

          <div className="relative flex items-center justify-center h-48">
            <div
              className={`absolute rounded-full bg-brand-primary/20 mix-blend-multiply blur-xl transition-all ease-in-out ${breathState === 'inhale' ? 'w-48 h-48 duration-[4000ms]' : 'w-24 h-24 duration-[6000ms]'
                }`}
            />
            <div
              className={`absolute rounded-full bg-emerald-500/20 mix-blend-multiply blur-lg transition-all ease-in-out delay-75 ${breathState === 'inhale' ? 'w-40 h-40 duration-[4000ms]' : 'w-16 h-16 duration-[6000ms]'
                }`}
            />
            <p className="z-10 text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-600">
              {breathState}
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="text-5xl font-light text-black tracking-tight tabular-nums">
              0:{timeLeft.toString().padStart(2, '0')}
            </div>
            <p className="text-zinc-600 text-base">
              Your nervous system is currently flooded. Breathe with the circle.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setPhase('tools')}
              className="mt-8 text-[10px] tracking-widest uppercase text-zinc-800 hover:text-zinc-600"
            >
              Skip (Dev Only)
            </button>
          )}
        </div>
      </div>
    );
  }

  const allRepairStarters = personalizedGuidance?.repairStarters.length
    ? [...personalizedGuidance.repairStarters, ...REPAIR_STARTERS]
    : REPAIR_STARTERS;

  return (
    <div className="min-h-screen bg-brand-linen animate-in fade-in duration-1000 font-sans">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="rounded-xl px-4 py-2 text-sm text-brand-primary hover:bg-brand-linen transition-colors font-medium -ml-4"
          >
            ← Retreat
          </button>
          <h1 className="text-base font-semibold text-black">Conflict First Aid</h1>
          <button
            onClick={() => router.push('/trust-center')}
            className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-200 transition-colors shadow-sm"
          >
            Safety
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-rose-600 uppercase tracking-wider">If there is immediate danger</h2>
          <p className="text-base text-rose-900 mt-2 leading-relaxed">
            Stop this exercise and call emergency services now. Your physical safety is paramount.
          </p>
        </section>

        <section className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-4">2-10 Minute Reset Protocol</h2>
          <ol className="mt-3 space-y-3 text-base text-black">
            {RESET_PROTOCOL.map((step, idx) => (
              <li key={step} className="rounded-2xl bg-brand-linen px-5 py-4 leading-relaxed flex items-start">
                <span className="font-bold text-brand-primary mr-3 mt-0.5">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Personalized dynamic section */}
        {personalizedGuidance && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-3">Your Dynamic Right Now</h2>
            <p className="text-base text-gray-800 leading-relaxed">{personalizedGuidance.dynamic}</p>
          </section>
        )}

        <section className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-4">Repair Starters</h2>
          <div className="mt-3 space-y-3">
            {allRepairStarters.map((starter, i) => (
              <p key={i} className="rounded-2xl bg-brand-linen px-5 py-4 text-base text-black italic">
                &quot;{starter}&quot;
              </p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

import { SceneAccent } from '@/components/emotion/EmotionalEnvironment';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

// Repair moment: quieter, less colour (lib/moment-tone.ts "repair").
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

interface PersonalizedGuidance {
  dynamic: string;
  repairStarters: string[];
}

type TraitRow = { trait_key: string; inferred_value: string; status?: string | null; confidence?: number | null };
type CycleRow = { name: string; description?: string | null; what_helps?: string | null; status: string };

// "Your Dynamic Right Now" uses only (a) the user's OWN conflict pattern,
// offered as a maybe they can correct, and (b) a loop both partners named
// and confirmed in /us. It never uses the partner's private traits
// (constitution §8) and never states a guess as fact (§2).
const OWN_SIDE: Record<Exclude<ConflictStyle, null>, string> = {
  volatile: "You may tend to want to stay in it and sort things out right now. That's okay. If your partner needs a pause, it's often not rejection — it can be their way of calming down. You could try: 'Can we come back to this in 20 minutes?'",
  avoidant: "You may tend to step back when things heat up. That's okay — calming down first is wise. Letting your partner know you're coming back helps: 'I'm not done with this. I just need 20 minutes.'",
  validating: "You may tend to want both of you to feel heard before solving anything. That's a real strength. You could say it out loud: 'Before we fix anything, what did I say that landed hardest?'",
};

function getPersonalizedGuidance(traits: TraitRow[], cycles: CycleRow[]): PersonalizedGuidance | null {
  const confirmedCycle = cycles.find(c => c.status === 'confirmed');
  if (confirmedCycle) {
    const helps = confirmedCycle.what_helps?.trim();
    return {
      dynamic: `You two named this loop together: "${confirmedCycle.name}". It's the two of you vs. the loop, not each other.${helps ? ` What you said helps: ${helps}` : ''}`,
      repairStarters: [],
    };
  }

  const own = traits.find(t => t.trait_key === 'conflict_style');
  if (!own || own.status === 'rejected') return null;
  if (own.status !== 'confirmed' && (own.confidence ?? 0) < 0.4) return null;
  const style = own.inferred_value as ConflictStyle;
  if (!style || !(style in OWN_SIDE)) return null;

  return { dynamic: `${OWN_SIDE[style]} (Just a guess from what you've shared — you're the judge.)`, repairStarters: [] };
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

        const headers = { Authorization: `Bearer ${session.access_token}` };
        const [traitsRes, coupleRes] = await Promise.all([
          fetch('/api/profile/traits', { headers }),
          fetch('/api/couple', { headers }),
        ]);
        const traits: TraitRow[] = traitsRes.ok ? ((await traitsRes.json()).traits || []) : [];
        const cycles: CycleRow[] = coupleRes.ok ? ((await coupleRes.json()).cycles || []) : [];

        const guidance = getPersonalizedGuidance(traits, cycles);
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
      <div className="emotion-page min-h-dvh bg-brand-quiet flex flex-col items-center justify-center text-foreground transition-colors duration-1000">
        <div className="absolute top-6 left-6">
          <button
            onClick={() => router.back()}
            className="text-brand-text-secondary hover:text-foreground text-sm font-medium transition-colors"
          >
            ← Retreat
          </button>
        </div>

        <div className="text-center space-y-12 w-full max-w-md px-6">
          <h1 className="text-2xl tracking-tight text-foreground font-semibold">
            Before we enter the conflict,<br />we must calm the body.
          </h1>

          <div className="relative flex items-center justify-center h-48">
            <div
              className={`absolute rounded-full bg-brand-mauve/20 mix-blend-multiply blur-xl transition-all ease-in-out ${breathState === 'inhale' ? 'w-48 h-48 duration-[4000ms]' : 'w-24 h-24 duration-[6000ms]'
                }`}
            />
            <div
              className={`absolute rounded-full bg-calm/30 mix-blend-multiply blur-lg transition-all ease-in-out delay-75 ${breathState === 'inhale' ? 'w-40 h-40 duration-[4000ms]' : 'w-16 h-16 duration-[6000ms]'
                }`}
            />
            <p className="z-10 text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground">
              {breathState}
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="text-5xl font-light text-foreground tracking-tight tabular-nums">
              0:{timeLeft.toString().padStart(2, '0')}
            </div>
            <p className="text-muted-foreground text-base">
              Your nervous system is currently flooded. Breathe with the circle.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setPhase('tools')}
              className="mt-8 text-[10px] tracking-widest uppercase text-foreground hover:text-muted-foreground"
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
    <div className="emotion-page min-h-dvh bg-brand-quiet animate-in fade-in duration-1000 font-sans">
      <header className="sticky top-0 z-10 border-b border-border bg-popover/70 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="rounded-xl px-4 py-2 text-sm text-brand-text-secondary hover:bg-white/60 transition-colors font-medium -ml-4"
          >
            ← Retreat
          </button>
          <h1 className="text-base font-semibold text-foreground">Conflict First Aid</h1>
          <button
            onClick={() => router.push('/trust-center')}
            className="rounded-full bg-destructive-subtle px-4 py-2 text-sm font-semibold text-destructive-emphasis hover:bg-destructive/15 transition-colors shadow-sm"
          >
            Safety
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <section className="rounded-3xl border border-destructive/30 bg-destructive-subtle p-6 shadow-sm">
          <h2 className="text-sm font-bold text-destructive-emphasis uppercase tracking-wider">If there is immediate danger</h2>
          <p className="text-base text-destructive-emphasis mt-2 leading-relaxed">
            Stop this exercise and call emergency services now. Your physical safety is paramount.
          </p>
        </section>

        <section className="emotion-paper relative overflow-hidden rounded-3xl border border-brand-border bg-popover/70 p-6">
          <SceneAccent kind="flow" quiet className="-mt-3 mb-2 h-16 w-full opacity-60" />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary mb-4">2-10 Minute Reset Protocol</h2>
          <ol className="mt-3 space-y-3 text-base text-foreground">
            {RESET_PROTOCOL.map((step, idx) => (
              <li key={step} className="rounded-2xl bg-brand-quiet px-5 py-4 leading-relaxed flex items-start">
                <span className="font-bold text-brand-text-secondary mr-3 mt-0.5">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Personalized dynamic section */}
        {personalizedGuidance && (
          <section className="rounded-3xl border border-brand-border bg-popover/70 p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary mb-3">Your Dynamic Right Now</h2>
            <p className="text-base text-foreground leading-relaxed">{personalizedGuidance.dynamic}</p>
          </section>
        )}

        <section className="rounded-3xl border border-brand-border bg-popover/70 p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary mb-4">Repair Starters</h2>
          <div className="mt-3 space-y-3">
            {allRepairStarters.map((starter, i) => (
              <p key={i} className="rounded-2xl bg-brand-quiet px-5 py-4 text-base text-foreground italic">
                &quot;{starter}&quot;
              </p>
            ))}
          </div>
        </section>

        {/* A Different Pair of Eyes — post-conflict reappraisal offer (spec §4).
            Plain div — the parent <main> already provides max-w/px/space-y.
            Purely additive: router.push fires the auto-resolve-on-leave
            handlers naturally (episode resolves, then the reflection opens). */}
        <div>
          <div className="rounded-2xl border border-brand-border bg-brand-quiet p-5">
            <p className="text-sm leading-relaxed text-brand-espresso mb-1 font-medium">
              When you&apos;re ready
            </p>
            <p className="text-sm leading-relaxed text-brand-taupe mb-4">
              Sometimes it helps to see what happened through different eyes. 90 seconds, just you.
            </p>
            <button
              onClick={() => router.push('/neutral-observer?trigger=conflict')}
              className="rounded-full border border-brand-primary/20 px-4 py-2 text-xs font-medium text-brand-espresso hover:bg-brand-primary/10 transition-colors"
            >
              A different pair of eyes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

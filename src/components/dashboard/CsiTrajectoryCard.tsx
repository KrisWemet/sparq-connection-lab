// Day-14 CSI trajectory (Master PRD §4.2 — the trial-to-paid conversion
// moment). Non-negotiable: report honestly even if flat or down.
//
// Four states:
//   remeasure_due -> ask the 4 questions again (the "after" measurement)
//   ready + up    -> name the rise plainly, no overclaiming
//   ready + flat  -> say it's flat, and say why that can still be real
//   ready + down  -> say it honestly and without alarm; never blame the user
//
// Design rule: no diagnosis, no "this proves Sparq works", no manufactured
// urgency. The number is theirs, not a sales device.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

type DeltaState =
  | { state: 'no_baseline' | 'too_early' }
  | { state: 'remeasure_due'; baseline: number; days_since_baseline: number }
  | { state: 'ready'; baseline: number; latest: number; delta: number; days_since_baseline: number };

const QUESTIONS: Array<{ text: string; options: string[] }> = [
  {
    text: 'All things considered, how happy do things feel in your relationship right now?',
    options: ['Really hard', 'Hard', 'A bit unhappy', 'Even', 'Pretty happy', 'Very happy', 'Wonderfully happy'],
  },
  {
    text: 'How warm and comfortable does your relationship feel day to day?',
    options: ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Almost always', 'Completely'],
  },
  {
    text: 'How rewarding does your relationship feel?',
    options: ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Very', 'Completely'],
  },
  {
    text: 'Overall, how satisfied are you with your relationship?',
    options: ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Very', 'Completely'],
  },
];

/** Honest copy for every outcome — including the ones that aren't flattering. */
function readTrajectory(delta: number): { headline: string; body: string } {
  if (delta >= 3) {
    return {
      headline: 'Something moved.',
      body: `Your own answers came back ${delta} points higher than the day you started. That's your read on your relationship, not mine — and it went up.`,
    };
  }
  if (delta >= 1) {
    return {
      headline: 'A small lift.',
      body: `Up ${delta} ${delta === 1 ? 'point' : 'points'} from where you started. Small, but two weeks is a short window — and small compounds.`,
    };
  }
  if (delta === 0) {
    return {
      headline: 'Level — and that\'s worth saying plainly.',
      body: 'Your answers landed exactly where they did two weeks ago. I\'m not going to dress that up. Most of what you practiced works underneath the surface first; the felt part often arrives later.',
    };
  }
  return {
    headline: 'It reads a little lower right now.',
    body: `Down ${Math.abs(delta)} from where you started. That happens — sometimes paying closer attention makes you notice more, and honest noticing can feel worse before it feels better. It doesn't mean you did this wrong.`,
  };
}

export function CsiTrajectoryCard() {
  const [data, setData] = useState<DeltaState | null>(null);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const headers = await buildAuthedHeaders();
      const res = await fetch('/api/csi/delta', { headers });
      if (!res.ok) return;
      setData(await res.json());
    } catch {
      // fail-soft: card doesn't render
    }
  };

  useEffect(() => { void load(); }, []);

  const answer = async (value: number) => {
    const next = [...scores, value];
    if (next.length < QUESTIONS.length) {
      setScores(next);
      setStep(step + 1);
      return;
    }
    setSaving(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      await fetch('/api/csi/pulse', {
        method: 'POST',
        headers,
        body: JSON.stringify({ item_scores: next }),
      });
      await load(); // re-read so the delta appears immediately
    } catch {
      // fail-soft
    } finally {
      setSaving(false);
    }
  };

  if (!data || data.state === 'no_baseline' || data.state === 'too_early') return null;

  // Hoisted so narrowing survives into the JSX closures below (TS can't keep
  // narrowing on a mutable state variable inside a nested arrow function).
  const view = data;
  const result = view.state === 'ready' ? readTrajectory(view.delta) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-brand-primary/10 bg-brand-parchment p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-3">
        <PeterAvatar mood="afternoon" size={32} />
        <p className="font-serif text-lg tracking-tight text-brand-espresso">
          {view.state === 'remeasure_due' ? 'Same four questions' : 'Where things stand'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {view.state === 'remeasure_due' ? (
          <motion.div key={`q-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="mb-4 text-sm leading-relaxed text-brand-text-secondary">
              You answered these on day one. Same four, honestly as you feel today —
              then I&apos;ll show you both side by side. ({step + 1} of {QUESTIONS.length})
            </p>
            <p className="mb-3 font-serif text-[15px] leading-snug text-brand-espresso">
              {QUESTIONS[step].text}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUESTIONS[step].options.map((label, i) => (
                <button
                  key={label}
                  disabled={saving}
                  onClick={() => answer(i)}
                  className="rounded-full border border-brand-primary/20 px-3 py-1.5 text-xs text-brand-espresso transition-colors hover:bg-brand-primary/10 disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {view.state === 'ready' && result && (
              <>
                <div className="mb-4 flex items-end gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-brand-taupe/70">Day one</p>
                    <p className="font-serif text-2xl text-brand-taupe">{view.baseline}</p>
                  </div>
                  <div className="pb-2 text-brand-taupe/40">→</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-brand-taupe/70">Today</p>
                    <p className="font-serif text-2xl text-brand-espresso">{view.latest}</p>
                  </div>
                </div>
                <p className="mb-1.5 text-sm font-semibold text-brand-espresso">{result.headline}</p>
                <p className="text-sm leading-relaxed text-brand-text-secondary">{result.body}</p>
                <p className="mt-3 text-[11px] leading-relaxed text-brand-taupe/70">
                  Measured with the CSI-4, a short standard relationship-satisfaction
                  scale. Two weeks is a small window — this is a first data point, not a verdict.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

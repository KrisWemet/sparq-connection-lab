// Day-14 CSI trajectory (Master PRD §4.2 — the trial-to-paid conversion
// moment). Non-negotiable: report honestly even if flat or down.
//
// Four states:
//   remeasure_due -> ask the published CSI-4 again (the "after" measurement),
//                    then Sparq's own optional check-in questions
//   ready + up    -> name the rise plainly, no claim about the cause
//   ready + flat  -> say it's the same, without spin
//   ready + down  -> say it honestly and without alarm; never blame the user,
//                    and say the practice can change or pause
//
// Design rule: no diagnosis, no "this proves Sparq works", no manufactured
// urgency, no comparison with a partner. The number is theirs, not a sales device.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { CSI4_ITEMS } from '@/lib/csi4';
import { CHECK_IN_SHORT, type CheckInKey } from '@/lib/check-in';
import { InformalCheckIn } from '@/components/checkin/InformalCheckIn';

type DeltaState =
  | { state: 'no_baseline' | 'too_early' }
  | { state: 'remeasure_due'; baseline: number; days_since_baseline: number }
  | { state: 'ready'; baseline: number; latest: number; delta: number; days_since_baseline: number };

const QUESTIONS = CSI4_ITEMS.map(i => ({ text: i.text, options: i.anchors }));

/**
 * Honest copy for every outcome — including the ones that aren't flattering.
 * It reports what the user said, never why it changed: many things move a
 * relationship, and two answers can't show that Sparq caused anything.
 */
function readTrajectory(delta: number): { headline: string; body: string } {
  if (delta > 0) {
    return {
      headline: 'Your answers went up.',
      body: `Your own answers are ${delta} ${delta === 1 ? 'point' : 'points'} higher than on day one. That is your read on your relationship. Lots of things can move it, so this shows what changed, not why.`,
    };
  }
  if (delta === 0) {
    return {
      headline: 'Your answers are the same as on day one.',
      body: "Two weeks is a short time. A steady answer is real information, not a failing grade.",
    };
  }
  return {
    headline: 'Your answers are a little lower than on day one.',
    body: `Down ${Math.abs(delta)} from where you started. That can happen for many reasons, like a hard week or noticing more than before. It doesn't mean you did this wrong. If what you're practicing isn't helping, you can change it or take a break.`,
  };
}

type Changes = Array<{ key: CheckInKey; then: string; now: string; direction: 'higher' | 'same' | 'lower' }>;

export function CsiTrajectoryCard() {
  const [data, setData] = useState<DeltaState | null>(null);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [informal, setInformal] = useState(false);
  const [changes, setChanges] = useState<Changes>([]);

  const load = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const headers = await buildAuthedHeaders();
      const res = await fetch('/api/csi/delta', { headers });
      if (!res.ok) return;
      setData(await res.json());
      const checkIn = await fetch('/api/me/check-in', { headers });
      if (checkIn.ok) setChanges(((await checkIn.json()).changes || []) as Changes);
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
      setInformal(true); // then the optional informal questions
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
        {informal ? (
          <motion.div key="informal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <InformalCheckIn
              stage="follow_up"
              onDone={() => { setInformal(false); void load(); }}
            />
          </motion.div>
        ) : view.state === 'remeasure_due' ? (
          <motion.div key={`q-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="mb-4 text-sm leading-relaxed text-brand-text-secondary">
              You answered these on day one. Same four, honestly as you feel today.
              Then you&apos;ll see both side by side. ({step + 1} of {QUESTIONS.length})
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
                  className="rounded-full border border-brand-primary/20 px-3 py-1.5 text-xs text-brand-espresso transition-colors hover:bg-brand-primary/10 active:bg-brand-primary/10 disabled:opacity-50"
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
                    <p className="text-[10px] uppercase tracking-[0.18em] text-brand-taupe">Day one</p>
                    <p className="font-serif text-2xl text-brand-taupe">{view.baseline}</p>
                  </div>
                  <div className="pb-2 text-brand-taupe">→</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-brand-taupe">Today</p>
                    <p className="font-serif text-2xl text-brand-espresso">{view.latest}</p>
                  </div>
                </div>
                <p className="mb-1.5 text-sm font-semibold text-brand-espresso">{result.headline}</p>
                <p className="text-sm leading-relaxed text-brand-text-secondary">{result.body}</p>
                {changes.length > 0 && (
                  <div className="mt-4 space-y-1.5 border-t border-brand-primary/10 pt-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-brand-taupe">Your other answers, then → now</p>
                    {changes.map(c => (
                      <p key={c.key} className="text-xs leading-relaxed text-brand-text-secondary">
                        {CHECK_IN_SHORT[c.key]}: {c.then} → <span className="text-brand-espresso">{c.now}</span>
                      </p>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-[11px] leading-relaxed text-brand-taupe">
                  The four questions are the CSI-4, a short published relationship-satisfaction
                  scale (Funk &amp; Rogge, 2007); the others are Sparq&apos;s own. A change in your
                  answers shows what you reported, not proof of what caused it. Using Sparq less
                  can be part of things going well.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

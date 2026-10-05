// CSI-4 pulse card (spec §5.4). The published CSI-4 (src/lib/csi4.ts), ~30
// seconds, then Sparq's own optional check-in questions. Appears only when a
// pulse is due; "Not now" is always available. Scores are never shown as grades.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { CSI4_ITEMS, CSI4_SOURCE_NOTE } from '@/lib/csi4';
import { InformalCheckIn } from '@/components/checkin/InformalCheckIn';

const QUESTIONS = CSI4_ITEMS.map(i => ({ text: i.text, options: i.anchors }));

// "Not now" hides the card on this device for a week (a per-viewer
// convenience; the pulse stays due and nothing is lost).
const SNOOZE_KEY = 'sparq_csi_pulse_snoozed_until';
const SNOOZE_DAYS = 7;

function isSnoozed(): boolean {
  try {
    const until = Number(window.localStorage.getItem(SNOOZE_KEY) || 0);
    return until > Date.now();
  } catch {
    return false;
  }
}

function snooze() {
  try {
    window.localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000));
  } catch {
    // storage blocked — the card just hides for this visit
  }
}

export function CsiPulseCard() {
  const [due, setDue] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [phase, setPhase] = useState<'csi' | 'informal' | 'done'>('csi');
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/csi/pulse', { headers });
        if (!res.ok) return;
        const payload = await res.json();
        if (!cancelled) {
          setDue(payload.due);
          setHidden(isSnoozed());
        }
      } catch {
        // fail-soft: card simply doesn't show
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const answer = async (value: number) => {
    const next = [...scores, value];
    if (next.length < QUESTIONS.length) {
      setScores(next);
      setStep(step + 1);
      return;
    }
    setPhase('informal');
    try {
      const headers = await buildAuthedHeaders();
      await fetch('/api/csi/pulse', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_scores: next }),
      });
    } catch {
      // fail-soft
    }
  };

  if (!due || hidden) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
      <AnimatePresence mode="wait">
        {phase === 'informal' ? (
          <motion.div key="informal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
            <InformalCheckIn stage={due === 'baseline' ? 'baseline' : 'follow_up'} onDone={() => setPhase('done')} />
          </motion.div>
        ) : phase === 'done' ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 relative z-10"
          >
            <PeterAvatar mood="afternoon" size={32} />
            <p className="text-sm leading-relaxed font-serif italic text-brand-text-secondary">
              Thank you for trusting me with that. I&apos;ll keep it safe.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <PeterAvatar mood="afternoon" size={32} />
              <p className="text-xs text-brand-text-secondary">
                30 seconds, just between us. There are no grades here. ({step + 1}/4)
              </p>
            </div>
            <p className="mb-3 text-sm font-serif text-brand-espresso">{QUESTIONS[step].text}</p>
            <div className="flex flex-wrap gap-2">
              {QUESTIONS[step].options.map((label, i) => (
                <button
                  key={label}
                  onClick={() => answer(i)}
                  className="press rounded-full border border-brand-primary/20 px-3 py-1.5 text-xs text-brand-espresso hover:bg-brand-primary/10 active:bg-brand-primary/10"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-[11px] leading-relaxed text-brand-text-secondary">{CSI4_SOURCE_NOTE}</p>
              {step === 0 && (
                <button
                  onClick={() => { snooze(); setHidden(true); }}
                  className="press shrink-0 text-xs text-brand-text-secondary underline underline-offset-2"
                >
                  Not now
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

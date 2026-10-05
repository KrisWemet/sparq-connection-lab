// CSI-4 baseline capture (Master PRD §4.2 — onboarding order is
// sign-up → CSI-4 baseline → hook). This is the "before" measurement that
// makes the Day-14 delta meaningful, so it MUST run before the app has had
// any chance to change how the user feels.
//
// The published CSI-4 (src/lib/csi4.ts — wording and scoring unchanged),
// posted to the same endpoint as CsiPulseCard — the API assigns
// context='baseline' automatically for a user's first pulse. Afterwards the
// user may answer Sparq's own informal questions (also optional).
//
// Enjoyment-first: this is Peter asking, not a form. Skippable — a refused
// baseline costs one data point; a bounced signup costs the user.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { CSI4_ITEMS, CSI4_SOURCE_NOTE } from '@/lib/csi4';
import { InformalCheckIn } from '@/components/checkin/InformalCheckIn';

const QUESTIONS = CSI4_ITEMS.map(i => ({ text: i.text, options: i.anchors }));

interface CsiBaselineProps {
  onComplete: () => void;
}

export function CsiBaseline({ onComplete }: CsiBaselineProps) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [informal, setInformal] = useState(false);

  const submit = async (finalScores: number[]) => {
    setSaving(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      await fetch('/api/csi/pulse', {
        method: 'POST',
        headers,
        body: JSON.stringify({ item_scores: finalScores }),
      });
    } catch {
      // fail-soft: never block onboarding on a measurement
    } finally {
      setSaving(false);
      setInformal(true);
    }
  };

  const answer = (value: number) => {
    const next = [...scores, value];
    if (next.length < QUESTIONS.length) {
      setScores(next);
      setStep(step + 1);
      return;
    }
    void submit(next);
  };

  return (
    <div className="emotion-page min-h-dvh bg-brand-linen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="emotion-paper rounded-[28px] border border-brand-primary/12 bg-brand-parchment px-7 py-8 shadow-[0_20px_50px_hsl(var(--shadow)/0.10)]">
          <div className="flex items-center gap-3 mb-5">
            <PeterAvatar mood="morning" size={40} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-hover">
                Before we start
              </p>
              <p className="text-sm text-brand-taupe">
                {informal ? 'A few more, if you like' : `Four quick questions · ${step + 1} of ${QUESTIONS.length}`}
              </p>
            </div>
          </div>

          {informal ? (
            <InformalCheckIn stage="baseline" size="page" onDone={onComplete} />
          ) : (
          <>
          <p className="text-sm leading-relaxed text-brand-taupe mb-6">
            I want to know where things stand today. Nothing is graded. Later on, you
            can look back and see how your own answers changed. There are no wrong
            answers here, and your answers stay private.
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              <p className="mb-4 font-serif text-[17px] leading-snug text-brand-espresso">
                {QUESTIONS[step].text}
              </p>
              <div className="flex flex-wrap gap-2">
                {QUESTIONS[step].options.map((label, i) => (
                  <button
                    key={label}
                    disabled={saving}
                    onClick={() => answer(i)}
                    className="press rounded-full border border-brand-primary/20 px-3.5 py-2 text-xs text-brand-espresso hover:bg-brand-primary/10 disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-7 flex items-center justify-between">
            <div className="flex gap-1.5">
              {QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i <= step ? 'w-4 bg-brand-primary' : 'w-1.5 bg-brand-primary/25'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onComplete}
              disabled={saving}
              className="press text-xs text-brand-taupe underline underline-offset-2 hover:text-brand-taupe disabled:opacity-50"
            >
              Skip for now
            </button>
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-brand-taupe">{CSI4_SOURCE_NOTE}</p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}

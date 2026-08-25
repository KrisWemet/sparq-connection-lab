// CSI-4 baseline capture (Master PRD §4.2 — onboarding order is
// sign-up → CSI-4 baseline → hook). This is the "before" measurement that
// makes the Day-14 delta meaningful, so it MUST run before the app has had
// any chance to change how the user feels.
//
// Same 4-item instrument as CsiPulseCard (item 1 scored 0–6, items 2–4 scored
// 0–5, total 0–21) posted to the same endpoint — the API assigns
// context='baseline' automatically for a user's first pulse.
//
// Enjoyment-first: this is Peter asking, not a form. Skippable — a refused
// baseline costs one data point; a bounced signup costs the user.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { buildAuthedHeaders } from '@/lib/api-auth';

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

interface CsiBaselineProps {
  onComplete: () => void;
}

export function CsiBaseline({ onComplete }: CsiBaselineProps) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

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
      onComplete();
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
    <div className="min-h-screen bg-brand-linen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="rounded-[28px] border border-brand-primary/12 bg-brand-parchment px-7 py-8 shadow-[0_20px_50px_rgba(46,38,32,0.10)]">
          <div className="flex items-center gap-3 mb-5">
            <PeterAvatar mood="morning" size={40} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary/60">
                Before we start
              </p>
              <p className="text-sm text-brand-taupe">
                Four quick questions · {step + 1} of {QUESTIONS.length}
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-brand-taupe mb-6">
            I want to know where things stand today — not to grade anything, just so
            that later on we can both see what actually changed. There are no wrong
            answers here.
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
                    className="rounded-full border border-brand-primary/20 px-3.5 py-2 text-xs text-brand-espresso transition-colors hover:bg-brand-primary/10 disabled:opacity-50"
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
              className="text-xs text-brand-taupe/70 underline underline-offset-2 hover:text-brand-taupe disabled:opacity-50"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

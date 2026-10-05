// Optional informal check-in, shown after the CSI-4 (onboarding baseline,
// monthly pulse, Day-14 follow-up). Sparq's own questions, clearly labelled
// as such; every question can be skipped and the whole set can be declined.
// See src/lib/check-in.ts and docs/METRICS.md "Outcome measurement".

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { CHECK_IN_LABEL, questionsFor, type CheckInAnswers, type CheckInStage } from '@/lib/check-in';

interface InformalCheckInProps {
  stage: CheckInStage;
  onDone: () => void;
  /** Larger type for the full-page onboarding surface. */
  size?: 'card' | 'page';
}

export function InformalCheckIn({ stage, onDone, size = 'card' }: InformalCheckInProps) {
  const questions = questionsFor(stage);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CheckInAnswers>({});
  const [saving, setSaving] = useState(false);

  const finish = async (final: CheckInAnswers) => {
    if (Object.keys(final).length === 0) return onDone();
    setSaving(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      await fetch('/api/me/check-in', { method: 'POST', headers, body: JSON.stringify({ answers: final }) });
    } catch {
      // fail-soft: a missed check-in costs one data point, never the user's flow
    } finally {
      setSaving(false);
      onDone();
    }
  };

  const advance = (next: CheckInAnswers) => {
    if (step + 1 < questions.length) {
      setAnswers(next);
      setStep(step + 1);
    } else {
      void finish(next);
    }
  };

  const questionText = size === 'page' ? 'font-serif text-[17px] leading-snug' : 'font-serif text-[15px] leading-snug';

  if (!started) {
    return (
      <div>
        <p className={`mb-2 text-brand-espresso ${questionText}`}>
          {stage === 'baseline'
            ? 'Want to answer a few more of my own questions? They help you see later what changed.'
            : 'A few more of my own questions, same as last time?'}
        </p>
        <p className="mb-4 text-xs leading-relaxed text-brand-text-secondary">{CHECK_IN_LABEL}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setStarted(true)}
            className="press rounded-full bg-brand-primary px-4 py-2 text-xs font-medium text-white active:opacity-90"
          >
            Sure
          </button>
          <button
            onClick={onDone}
            className="press rounded-full border border-brand-primary/20 px-4 py-2 text-xs text-brand-espresso hover:bg-brand-primary/10 active:bg-brand-primary/10"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  const q = questions[step];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={q.key}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.22 }}
      >
        <p className="mb-2 text-xs text-brand-text-secondary">
          {step + 1} of {questions.length} · skip any you like
        </p>
        <p className={`mb-3 text-brand-espresso ${questionText}`}>{q.text}</p>
        <div className="flex flex-wrap gap-2">
          {q.options.map(o => (
            <button
              key={o.label}
              disabled={saving}
              onClick={() => advance({ ...answers, [q.key]: o.value })}
              className="press rounded-full border border-brand-primary/20 px-3 py-1.5 text-xs text-brand-espresso hover:bg-brand-primary/10 active:bg-brand-primary/10 disabled:opacity-50"
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-4">
          <button
            disabled={saving}
            onClick={() => advance(answers)}
            className="press text-xs text-brand-text-secondary underline underline-offset-2 disabled:opacity-50"
          >
            Skip this one
          </button>
          <button
            disabled={saving}
            onClick={() => void finish(answers)}
            className="press text-xs text-brand-text-secondary underline underline-offset-2 disabled:opacity-50"
          >
            Stop here
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

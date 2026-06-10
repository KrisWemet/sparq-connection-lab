// CSI-4 pulse card (spec §5.4). Peter-voiced, 4 questions, ~30 seconds.
// Appears only when a pulse is due; disappears after submission.
// Scores are never shown as grades.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

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

export function CsiPulseCard() {
  const [due, setDue] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [done, setDone] = useState(false);

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
        if (!cancelled) setDue(payload.due);
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
    setDone(true);
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

  if (!due) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
      <AnimatePresence mode="wait">
        {done ? (
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
                30 seconds, just between us — there are no grades here. ({step + 1}/4)
              </p>
            </div>
            <p className="mb-3 text-sm font-serif text-brand-espresso">{QUESTIONS[step].text}</p>
            <div className="flex flex-wrap gap-2">
              {QUESTIONS[step].options.map((label, i) => (
                <button
                  key={label}
                  onClick={() => answer(i)}
                  className="rounded-full border border-brand-primary/20 px-3 py-1.5 text-xs text-brand-espresso hover:bg-brand-primary/10 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

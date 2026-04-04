import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, CheckCircle } from 'lucide-react';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { buildAuthedHeaders } from '@/lib/api-auth';

interface EveningCheckinProps {
  sessionId: string;
  morningAction: string;
  journeyTitle?: string | null;
  triggerMoment?: string;
  onComplete: () => void;
}

export function EveningCheckin({ sessionId, morningAction, journeyTitle, triggerMoment, onComplete }: EveningCheckinProps) {
  const [step, setStep] = useState<'practice' | 'reflect' | 'response' | 'done'>('practice');
  const [practiceAttempted, setPracticeAttempted] = useState<boolean | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [peterResponse, setPeterResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePracticeChoice = (attempted: boolean) => {
    setPracticeAttempted(attempted);
    setStep('reflect');
  };

  const handleSubmitReflection = async () => {
    if (!reflectionText.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/daily/session/evening-checkin', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          reflection_text: reflectionText.trim(),
          practice_attempted: practiceAttempted,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPeterResponse(data.peter_response || 'Rest well tonight. I will have something new for you tomorrow.');
        setStep('response');
      } else {
        setPeterResponse('Rest well tonight. I will have something new for you tomorrow.');
        setStep('response');
      }
    } catch {
      setPeterResponse('Rest well tonight. I will have something new for you tomorrow.');
      setStep('response');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-linen pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2"
        >
          <Moon size={16} className="text-brand-primary" />
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
            Evening Check-in
          </span>
        </motion.div>

        {/* Peter */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <PeterAvatar mood="evening" size={64} />
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Practice question ── */}
          {step === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              {/* Peter's opening — references trigger if available */}
              <p className="font-serif italic text-brand-espresso text-lg text-center leading-relaxed">
                {triggerMoment
                  ? `You said this would happen ${triggerMoment.toLowerCase()}. Did it?`
                  : 'Did you get a chance to try today\'s practice?'}
              </p>

              {/* Morning action reminder */}
              <div className="bg-brand-parchment rounded-3xl p-5 border border-brand-primary/10">
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">
                  Today&apos;s Practice
                </p>
                <p className="font-serif italic text-brand-espresso text-[15px] leading-relaxed">
                  {morningAction}
                </p>
              </div>

              {/* Two-option selector */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handlePracticeChoice(true)}
                  className="w-full p-4 rounded-2xl border-2 border-brand-primary/20 bg-brand-parchment text-brand-espresso font-medium text-left hover:border-brand-primary hover:bg-brand-primary/5 active:scale-[0.98] transition-all"
                >
                  Yes, I gave it a try
                </button>
                <button
                  onClick={() => handlePracticeChoice(false)}
                  className="w-full p-4 rounded-2xl border-2 border-brand-primary/20 bg-brand-parchment text-brand-espresso font-medium text-left hover:border-brand-primary hover:bg-brand-primary/5 active:scale-[0.98] transition-all"
                >
                  Not today — and that&apos;s okay
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Reflection ── */}
          {step === 'reflect' && (
            <motion.div
              key="reflect"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <p className="font-serif italic text-brand-espresso text-lg text-center leading-relaxed">
                {practiceAttempted
                  ? triggerMoment
                    ? `What actually happened ${triggerMoment.toLowerCase()}?`
                    : 'How did it go? What did you notice?'
                  : 'What was on your mind today instead?'}
              </p>

              <div className="bg-brand-parchment rounded-3xl p-5 border border-brand-primary/10">
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder={practiceAttempted
                    ? 'Even a sentence or two is perfect...'
                    : 'Whatever is on your mind...'
                  }
                  className="w-full bg-transparent text-brand-text-primary text-[15px] leading-relaxed placeholder:text-brand-text-secondary/50 resize-none focus:outline-none min-h-[120px]"
                  autoFocus
                />
              </div>

              <button
                onClick={handleSubmitReflection}
                disabled={!reflectionText.trim() || isSubmitting}
                className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors disabled:opacity-50 text-base"
              >
                {isSubmitting ? 'Peter is reading...' : 'Share with Peter'}
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: Peter's response ── */}
          {step === 'response' && (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="bg-brand-parchment rounded-3xl p-5 border border-brand-primary/10">
                <p className="font-serif italic text-brand-espresso text-[15px] leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                  {peterResponse}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                <button
                  onClick={() => {
                    setStep('done');
                    onComplete();
                  }}
                  className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors text-base"
                >
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} />
                    Done for today
                  </span>
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

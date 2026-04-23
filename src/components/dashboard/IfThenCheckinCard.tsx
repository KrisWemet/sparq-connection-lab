import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { buildAuthedHeaders } from '@/lib/api-auth';

interface IfThenCheckinCardProps {
  sessionId: string;
  planText: string;
  onDismiss: () => void;
}

export function IfThenCheckinCard({ sessionId, planText, onDismiss }: IfThenCheckinCardProps) {
  const [stage, setStage] = useState<'prompt' | 'note' | 'done'>('prompt');
  const [outcome, setOutcome] = useState<'completed' | 'not_attempted' | null>(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChoice = (choice: 'completed' | 'not_attempted') => {
    setOutcome(choice);
    setStage('note');
  };

  const handleSubmit = async () => {
    if (!outcome || isSaving) return;
    setIsSaving(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      await fetch('/api/daily/if-then-checkin', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          plan_text: planText,
          outcome,
          note: note.trim() || undefined,
        }),
      });
    } catch {
      // silent — dismiss regardless
    } finally {
      setIsSaving(false);
      setStage('done');
      setTimeout(onDismiss, 1200);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-brand-primary/10 bg-brand-parchment px-5 py-5 shadow-sm"
    >
      <AnimatePresence mode="wait">
        {stage === 'prompt' && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
              Yesterday&apos;s intention
            </p>
            <p className="font-serif italic text-brand-espresso leading-snug">
              &ldquo;{planText}&rdquo;
            </p>
            <p className="text-sm text-brand-taupe">How did it go?</p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => handleChoice('completed')}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-primary/10 py-3 text-sm font-medium text-brand-primary hover:bg-brand-primary/20 transition-colors"
              >
                <CheckCircle size={16} />
                Did it
              </button>
              <button
                onClick={() => handleChoice('not_attempted')}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-primary/10 bg-white/50 py-3 text-sm font-medium text-brand-taupe hover:bg-white/80 transition-colors"
              >
                <XCircle size={16} />
                Didn&apos;t happen
              </button>
            </div>
            <button
              onClick={onDismiss}
              className="w-full text-center text-xs text-brand-taupe/60 hover:text-brand-taupe pt-1 transition-colors"
            >
              Skip
            </button>
          </motion.div>
        )}

        {stage === 'note' && (
          <motion.div
            key="note"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-brand-taupe">
              {outcome === 'completed' ? 'Nice. Anything worth noting?' : 'No worries. What got in the way?'}
            </p>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note…"
              className="w-full rounded-xl border border-brand-primary/15 bg-white/60 px-3 py-2 text-sm text-brand-espresso placeholder:text-brand-taupe/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full rounded-2xl bg-brand-primary py-3 text-sm font-semibold text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              Done
            </button>
          </motion.div>
        )}

        {stage === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-2 text-center"
          >
            <p className="text-sm font-medium text-brand-primary">Logged. Keep going.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

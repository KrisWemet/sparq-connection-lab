import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface IfThenPlanStepProps {
  suggestedPlan: string;
  onComplete: (plan: string | null) => void;
}

export function IfThenPlanStep({ suggestedPlan, onComplete }: IfThenPlanStepProps) {
  const [plan, setPlan] = useState(suggestedPlan);

  return (
    <motion.div
      key="if-then-plan"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
      className="min-h-screen bg-brand-linen pb-24"
    >
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <Sparkles size={16} className="text-brand-primary" />
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
            One small intention
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="rounded-3xl border border-brand-primary/10 bg-brand-parchment p-6 shadow-sm space-y-4"
        >
          <p className="text-brand-espresso font-serif italic text-lg leading-snug">
            Before you go — make a plan that sticks.
          </p>
          <p className="text-sm text-brand-taupe leading-relaxed">
            People who write a simple &ldquo;if–then&rdquo; plan are 2–3× more likely to follow through.
            Fill in yours below, or skip.
          </p>

          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-2xl border border-brand-primary/15 bg-white/60 px-4 py-3 text-sm text-brand-espresso placeholder:text-brand-taupe/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 leading-relaxed"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="space-y-3"
        >
          <button
            onClick={() => onComplete(plan.trim() || null)}
            className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors text-base"
          >
            Lock it in
          </button>
          <button
            onClick={() => onComplete(null)}
            className="w-full text-brand-taupe text-sm py-2 hover:text-brand-espresso transition-colors"
          >
            Skip for now
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}

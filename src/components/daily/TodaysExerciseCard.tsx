import React from 'react';
import { motion } from 'framer-motion';

interface TodaysExerciseCardProps {
  durationMin: number;
  /** The serif italic question the user will explore */
  question: string;
  /** Small descriptor beneath the divider — left side */
  sessionLabel?: string;
  buttonLabel?: string;
  onBegin: () => void;
}

export function TodaysExerciseCard({
  durationMin,
  question,
  sessionLabel = 'Morning practice',
  buttonLabel = 'Begin Exercise',
  onBegin,
}: TodaysExerciseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="relative bg-brand-card rounded-3xl border border-brand-primary/10 shadow-sm p-6 overflow-hidden"
    >
      {/* Organic blur orb — depth without photography */}
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl pointer-events-none bg-brand-primary/[6%]" />

      {/* Duration — only user-relevant metadata shown */}
      <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-4">
        {durationMin} min
      </p>

      {/* The question — serif italic, this is the emotional heart of the card */}
      <p className="font-serif italic text-brand-espresso text-xl leading-snug mb-5">
        &ldquo;{question}&rdquo;
      </p>

      {/* Warm divider */}
      <div className="h-px bg-brand-primary/10 mb-4" />

      {/* Footer: session label left, CTA right */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-brand-taupe">{sessionLabel}</span>
        <motion.button
          onClick={onBegin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="bg-brand-primary text-white text-sm font-medium px-5 py-3 rounded-2xl hover:bg-brand-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          {buttonLabel}
        </motion.button>
      </div>
    </motion.div>
  );
}

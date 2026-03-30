import React from 'react';
import { motion } from 'framer-motion';

interface PreviousReflectionCardProps {
  quote: string;
  onViewJournal?: () => void;
}

export function PreviousReflectionCard({ quote, onViewJournal }: PreviousReflectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
      className="bg-[#EDE4D8] rounded-2xl border border-brand-primary/10 shadow-sm p-5"
    >
      {/* Label */}
      <p className="text-xs font-semibold tracking-widest uppercase text-brand-taupe mb-3">
        Yesterday&apos;s Reflection
      </p>

      {/* Quoted reflection — serif italic, the user's own words */}
      <p className="font-serif italic text-[#2C1A14] text-[15px] leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>

      {/* VIEW JOURNAL ghost link — right-aligned, small caps */}
      <div className="flex justify-end mt-3">
        <button
          onClick={onViewJournal}
          className="text-xs font-semibold tracking-widest uppercase text-brand-primary hover:text-brand-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 rounded"
        >
          View Journal
        </button>
      </div>
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

interface PetersInsightCardProps {
  insight: string;
}

export function PetersInsightCard({ insight }: PetersInsightCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="relative w-full max-w-sm ml-auto mr-4 md:mr-8 mb-6"
    >
      {/* Speech bubble tail */}
      <div className="absolute -top-4 right-8 w-6 h-6 bg-brand-linen border-l border-t border-brand-primary/10 transform rotate-45 z-0" />
      
      <div className="bg-brand-linen rounded-2xl rounded-tr-sm border border-brand-primary/10 shadow-sm p-4 relative z-10">
        <p className="font-serif italic text-brand-taupe leading-relaxed text-[15px]">
          &quot;{insight}&quot;
        </p>
      </div>
    </motion.div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TIPS = [
  "Small kind moves change the story in your head.",
  "Pause. Breathe. Then pick the next kind move.",
  "What you repeat starts to feel like you.",
  "One calm sentence can change a hard moment.",
  "Real trust grows one small proof at a time.",
  "When you slow down, you can choose better words.",
  "Notice it. Name it. Choose the next right step."
];

interface PeterLoadingProps {
  isLoading: boolean;
}

export function PeterLoading({ isLoading }: PeterLoadingProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setTipIndex(Math.floor(Math.random() * TIPS.length));
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-linen backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center max-w-sm px-6 text-center"
          >
            {/* Elegant Loading Spinner */}
            <div className="relative w-16 h-16 mb-8">
              <motion.div
                className="absolute inset-0 rounded-full border-t-2 border-brand-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-r-2 border-brand-primary/50"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border-l-2 border-brand-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Tip Card */}
            <div className="bg-white/80 shadow-sm border border-brand-primary/10 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary/40 to-brand-primary/10" />
              <p className="text-sm font-semibold text-brand-primary mb-2 tracking-wider uppercase">Peter&apos;s Reminder</p>
              <p className="text-brand-taupe leading-relaxed text-lg italic font-serif">
                &quot;{TIPS[tipIndex]}&quot;
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

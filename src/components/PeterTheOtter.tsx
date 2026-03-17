import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export type MascotStatus = 'idle' | 'thinking' | 'speaking';

export interface PeterTheOtterProps {
  status?: MascotStatus;
  message?: string | null;
}

export function PeterTheOtter({ status = 'idle', message }: PeterTheOtterProps) {
  // Subtle continuous breathing loop
  const breathingVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-4 mr-4 p-4 max-w-xs bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 relative pointer-events-auto"
          >
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45" />
            
            <div className="text-sm font-medium leading-relaxed flex items-center">
              {status === 'thinking' && (
                <span className="inline-flex space-x-1 mr-2">
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}>.</motion.span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 1 }}>.</motion.span>
                </span>
              )}
              <span>{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={breathingVariants}
        animate="animate"
        className="relative w-24 h-24 pointer-events-auto cursor-pointer drop-shadow-2xl hover:drop-shadow-3xl transition-shadow"
      >
        <Image
          src="/sparq-mascot.png"
          alt="Peter the Otter"
          width={96}
          height={96}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.otter-fallback')) {
              const fallback = document.createElement('div');
              fallback.className = 'otter-fallback w-full h-full flex items-center justify-center text-5xl';
              fallback.textContent = '🦦';
              parent.appendChild(fallback);
            }
          }}
        />
        {/* Status indicator badges */}
        {status === 'thinking' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white animate-pulse" />
        )}
        {status === 'speaking' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.div>
    </div>
  );
}

export default PeterTheOtter;

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf } from 'lucide-react';
import { useRouter } from 'next/router';

interface TodaysFocusCardProps {
  actionText: string;
}

export function TodaysFocusCard({ actionText }: TodaysFocusCardProps) {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push("/daily-growth")}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left bg-brand-primary rounded-[32px] shadow-[0_12px_40px_rgb(192,97,74,0.18)] p-6 md:p-8 relative overflow-hidden group"
    >
      {/* Background organic shape */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none transform translate-x-1/2 -translate-y-1/4" />

      <div className="flex items-start gap-4 relative z-10">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white backdrop-blur-sm">
          <Leaf size={18} fill="currentColor" className="opacity-80" />
        </div>
        
        <div className="flex-1">
          <p className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-1.5">
            Today&apos;s Focus
          </p>
          <p className="text-lg font-serif text-white leading-snug pr-8">
            {actionText}
          </p>
        </div>

        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:bg-white group-hover:text-brand-primary transition-colors duration-300">
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.button>
  );
}

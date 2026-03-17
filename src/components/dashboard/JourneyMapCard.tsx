import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Sprout, Wind, Flame } from 'lucide-react';
import { useRouter } from 'next/router';

interface JourneyMapCardProps {
  currentDay: number;
  totalDays?: number;
  streakCount?: number;
}

export function JourneyMapCard({ currentDay, totalDays = 14, streakCount = 0 }: JourneyMapCardProps) {
  const router = useRouter();
  
  // Calculate progress percentage
  const progress = Math.min(100, Math.max(0, ((currentDay - 1) / totalDays) * 100));
  
  // Generate waypoints
  const waypoints = Array.from({ length: 5 }).map((_, i) => {
    const day = Math.floor((i / 4) * totalDays) || 1;
    const isPast = currentDay > day;
    const isCurrent = currentDay === day;
    
    return {
      day,
      isPast,
      isCurrent,
      x: 10 + (i * 20), // 10% to 90%
      y: 50 + Math.sin(i * 1.5) * 30 // Wavy path
    };
  });

  return (
    <motion.button
      onClick={() => router.push("/daily-growth")}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left bg-gradient-to-br from-white to-brand-linen/80 rounded-[32px] border border-brand-primary/10 shadow-[0_8px_30px_rgb(192,97,74,0.06)] p-6 md:p-8 relative overflow-hidden group"
    >
      {/* Background organic shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-growth/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-sand/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <p className="text-sm font-medium text-brand-growth mb-1 flex items-center gap-1.5">
            <Sprout size={14} />
            Your Journey Map
          </p>
          <h3 className="text-3xl font-serif text-brand-taupe tracking-tight">Day {currentDay} of {totalDays}</h3>
        </div>
        {streakCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-taupe bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-brand-primary/10 shadow-sm">
            <Flame size={14} className="text-brand-sand" fill="currentColor" />
            {streakCount} day streak
          </div>
        )}
      </div>

      {/* Visual Path Area */}
      <div className="h-32 w-full relative mb-6">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 overflow-visible">
          {/* Base path (future) */}
          <path 
            d="M 10,50 Q 30,80 50,50 T 90,50" 
            fill="none" 
            stroke="#FAF6F1" 
            strokeWidth="4" 
            strokeLinecap="round" 
            className="drop-shadow-sm"
          />
          
          {/* Active path (past) */}
          <path 
            d="M 10,50 Q 30,80 50,50 T 90,50" 
            fill="none" 
            stroke="#8FAF8A" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
            className="transition-all duration-1000 ease-out"
          />

          {/* Waypoints */}
          {waypoints.map((wp, i) => (
            <g key={i} transform={`translate(${wp.x}, ${wp.y})`}>
              <circle 
                r={wp.isCurrent ? "6" : "4"} 
                fill={wp.isCurrent ? "#E8A857" : wp.isPast ? "#8FAF8A" : "#FAF6F1"} 
                stroke={wp.isCurrent ? "#FFFFFF" : "none"}
                strokeWidth="2"
                className={`transition-all duration-500 ${wp.isCurrent ? 'animate-pulse shadow-lg' : ''}`}
              />
              {wp.isCurrent && (
                <circle r="12" fill="#E8A857" opacity="0.2" className="animate-ping" />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between relative z-10 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-brand-primary/5 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <Sparkles size={18} className="text-brand-primary group-hover:text-white" />
          </div>
          <div>
            <p className="font-semibold text-brand-taupe group-hover:text-white transition-colors">Start Today&apos;s Loop</p>
            <p className="text-xs text-brand-taupe/60 group-hover:text-white/80 transition-colors">Takes about 5 minutes</p>
          </div>
        </div>
        <ArrowRight className="text-brand-primary group-hover:text-white transition-colors group-hover:translate-x-1 transform duration-300" />
      </div>
    </motion.button>
  );
}

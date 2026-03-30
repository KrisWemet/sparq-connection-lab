import React from 'react';
import { motion } from 'framer-motion';

interface DayProgressArcProps {
  currentDay: number;
  totalDays?: number;
}

const SIZE = 128;
const STROKE = 6;
const RADIUS = SIZE / 2 - STROKE;          // 52
const CENTER = SIZE / 2;                    // 64
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 326.7

export function DayProgressArc({ currentDay, totalDays = 14 }: DayProgressArcProps) {
  const progress = Math.min(currentDay / totalDays, 1);
  const targetOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Circular arc */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          fill="none"
          aria-label={`Day ${currentDay} of ${totalDays}`}
        >
          {/* Track ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#EDE4D8"
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress arc — animates in on mount */}
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#C0614A"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        </svg>

        {/* Text centered inside arc */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#2C1A14] leading-none tabular-nums">
            Day {currentDay}
          </span>
          <span className="text-sm text-brand-taupe mt-0.5">of {totalDays}</span>
        </div>
      </div>

      {/* 14-dot progress row */}
      <div className="flex items-center gap-[7px]">
        {Array.from({ length: totalDays }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i + 0.35, duration: 0.25, ease: 'easeOut' }}
            className={
              i < currentDay
                ? 'w-2 h-2 rounded-full bg-brand-primary'
                : 'w-2 h-2 rounded-full bg-[#EDE4D8] border border-brand-primary/20'
            }
          />
        ))}
      </div>
    </div>
  );
}

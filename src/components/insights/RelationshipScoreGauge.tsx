import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SCORE = 85;

export function RelationshipScoreGauge() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const offset = CIRCUMFERENCE - (animated ? (SCORE / 100) * CIRCUMFERENCE : CIRCUMFERENCE);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4 self-start">
        Relationship Score
      </p>
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#EDE9FE"
            strokeWidth="16"
          />
          <motion.circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{SCORE}</span>
          <span className="text-xs text-gray-400 mt-1">/ 100</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 italic mt-3">Your bond is thriving</p>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

interface LivingArtifactProps {
  score: number;
}

export function LivingArtifact({ score }: LivingArtifactProps) {
  const scale = 0.8 + (score / 100) * 0.4;
  const blur = 20 - (score / 100) * 15;
  const opacity = 0.5 + (score / 100) * 0.5;

  return (
    <div
      className="rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group"
      style={{
        background: 'linear-gradient(145deg, #FFFFFF 0%, #FDF8F6 100%)',
        border: '1px solid rgba(200,106,88,0.1)',
        boxShadow: '0 2px 12px rgba(200,106,88,0.04)',
      }}
    >
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-sm font-semibold text-black">Your Living Art</h3>
        <p className="text-xs mt-0.5" style={{ color: '#8C827A' }}>It grows as you grow</p>
      </div>

      <div className="h-32 w-full flex items-center justify-center relative mt-6">
        <motion.div
          animate={{
            scale: [scale, scale * 1.05, scale],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: `blur(${blur}px)`, opacity, background: '#C86A58' }}
          className="absolute w-24 h-24 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] mix-blend-multiply"
        />
        <motion.div
          animate={{
            scale: [scale * 0.9, scale * 1.1, scale * 0.9],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: `blur(${blur}px)`, opacity: opacity * 0.8, background: '#A95343' }}
          className="absolute w-20 h-20 rounded-[60%_40%_30%_70%/50%_40%_50%_60%] mix-blend-multiply ml-8"
        />
        <motion.div
          animate={{
            scale: [scale * 0.8, scale * 1, scale * 0.8],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: `blur(${blur}px)`, opacity: opacity * 0.6, background: '#E8A090' }}
          className="absolute w-16 h-16 rounded-full mix-blend-multiply -ml-8 mt-4"
        />
      </div>

      <div className="mt-2 text-center z-10">
        <span className="text-2xl font-bold font-serif" style={{ color: '#C86A58' }}>{score}</span>
        <span className="text-xs ml-1 uppercase tracking-widest font-semibold" style={{ color: '#8C827A' }}>Closeness</span>
      </div>
    </div>
  );
}

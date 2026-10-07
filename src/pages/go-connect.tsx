import { AmbientScene, SceneAccent } from '@/components/emotion/EmotionalEnvironment';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock } from 'lucide-react';
import { useRouter } from 'next/router';

const MISSIONS = [
  "Find your partner. Hold eye contact for 60 seconds without speaking.",
  "Give your partner a tight, 20-second hug right now.",
  "Without asking, make their coffee or tea tomorrow morning.",
  "Leave a sticky note with one thing you appreciate about them on the bathroom mirror.",
  "Ask them: 'What's one thing I can do to make your day easier?'",
  "Hold their hand and tell them one thing you admired about them today.",
];

export default function GoConnect() {
  const router = useRouter();
  const [mission, setMission] = useState('');
  const [timeLeft, setTimeLeft] = useState(60 * 15); // 15 minutes to stay off the app

  useEffect(() => {
    setMission(MISSIONS[Math.floor(Math.random() * MISSIONS.length)]);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dark min-h-dvh bg-background text-foreground flex flex-col items-center justify-center p-6 fixed inset-0 z-[100] font-sans">
      <AmbientScene quiet />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative max-w-md text-center flex flex-col items-center gap-10"
      >
        <SceneAccent kind="bridge" quiet className="h-32 w-full" />

        {/* Mission Text */}
        <div className="space-y-4">
          <h2 className="note-label text-lg">Your real-world mission</h2>
          <p className="text-2xl font-serif italic leading-relaxed text-foreground px-4">
            &quot;{mission}&quot;
          </p>
        </div>

        {/* Timer */}
        <div className="bg-card/50 p-6 rounded-3xl border border-border w-full backdrop-blur-md">
          <div className="flex items-center justify-center gap-3 mb-3 text-brand-text-secondary">
            <Lock size={16} />
            <span className="text-sm font-medium">App paused</span>
          </div>
          <div className="text-5xl font-mono tracking-widest text-white/90">
            {formatTime(timeLeft)}
          </div>
          <p className="text-xs text-brand-text-secondary mt-4">
            Take this time to put your phone down and connect.
          </p>
        </div>

        {/* Override / Return */}
        <button
          onClick={() => router.push('/connect')}
          className="text-muted-foreground text-sm hover:text-white transition-colors underline underline-offset-4"
        >
          I&apos;ve completed my mission
        </button>
      </motion.div>
    </div>
  );
}

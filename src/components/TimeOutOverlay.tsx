import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandHelping } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';

// Pages where the floating button would cover a form or duplicate a
// calm-down tool the page already has.
const HIDDEN_ON = new Set(['/', '/login', '/signup', '/onboarding', '/forgot-password', '/reset-password', '/help-now', '/how-sparq-works', '/conflict-first-aid']);

export function TimeOutOverlay() {
  const { user } = useAuth();
  const { pathname } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [breathState, setBreathState] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // 4-7-8 Breathing logic
  useEffect(() => {
    if (!isOpen) return;

    let timeout: NodeJS.Timeout;

    const runBreathingCycle = () => {
      setBreathState('inhale');
      timeout = setTimeout(() => {
        setBreathState('hold');
        timeout = setTimeout(() => {
          setBreathState('exhale');
          timeout = setTimeout(() => {
            runBreathingCycle();
          }, 8000); // Exhale 8s
        }, 7000); // Hold 7s
      }, 4000); // Inhale 4s
    };

    runBreathingCycle();

    return () => clearTimeout(timeout);
  }, [isOpen]);

  const message = "I love you, but I'm feeling overwhelmed right now. I need 20 minutes to cool down, and then I will come back to you.";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the message is on screen to read or type.
    }
  };

  if (!user || HIDDEN_ON.has(pathname)) return null;

  return (
    <>
      {/* Floating Action Button: sits above the bottom nav (~93px + the
          phone's home-bar inset), never under it. */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 md:right-8 bg-primary text-primary-foreground p-3 rounded-full shadow-lg border border-border z-[40] hover:scale-105 transition-transform"
        aria-label="Emergency Time Out"
      >
        <HandHelping size={24} />
      </button>

      {/* The Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-inverse/95 flex flex-col items-center justify-center p-6 backdrop-blur-md"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 text-white/50 hover:text-white p-2"
              aria-label="Close time out"
            >
              <X size={32} />
            </button>

            {/* Minimalist Breathing Circle */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-16">
              <motion.div
                className="absolute bg-popover/20 rounded-full mix-blend-screen"
                animate={{
                  scale: breathState === 'inhale' ? 1 : breathState === 'hold' ? 1 : 0.4,
                  opacity: breathState === 'inhale' ? 0.8 : breathState === 'hold' ? 0.6 : 0.2,
                }}
                transition={{
                  duration: breathState === 'inhale' ? 4 : breathState === 'hold' ? 7 : 8,
                  ease: "easeInOut"
                }}
                style={{ width: '100%', height: '100%' }}
              />
              <motion.div
                className="absolute bg-brand-primary/40 rounded-full mix-blend-screen blur-xl"
                animate={{
                  scale: breathState === 'inhale' ? 1.2 : breathState === 'hold' ? 1.2 : 0.6,
                  opacity: breathState === 'inhale' ? 0.5 : breathState === 'hold' ? 0.4 : 0.1,
                }}
                transition={{
                  duration: breathState === 'inhale' ? 4 : breathState === 'hold' ? 7 : 8,
                  ease: "easeInOut"
                }}
                style={{ width: '80%', height: '80%' }}
              />
              
              <div className="z-10 text-white text-2xl font-serif tracking-widest uppercase opacity-90">
                {breathState}
              </div>
            </div>

            {/* Quick Action Text */}
            <div className="max-w-xs text-center space-y-8">
              <p className="text-white/60 text-sm font-medium uppercase tracking-widest">
                Send to partner
              </p>
              <div className="bg-popover/10 p-5 rounded-2xl border border-popover/20">
                <p className="text-white text-lg font-serif italic leading-relaxed">
                  &quot;{message}&quot;
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="w-full py-4 bg-popover text-foreground font-bold rounded-2xl text-lg hover:bg-border transition-colors"
              >
                {copied ? 'Copied' : 'Copy Message'}
              </button>
              <p className="text-sm text-white/70">
                <Link href="/conflict-first-aid" onClick={() => setIsOpen(false)} className="underline">More calm-down steps</Link>
                {' · '}
                <Link href="/help-now" onClick={() => setIsOpen(false)} className="underline">Need help now?</Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

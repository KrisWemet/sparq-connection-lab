import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandHelping } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';

// 4-7-8 breathing: seconds per phase, and what the circle says.
const BREATH_SECONDS = { inhale: 4, hold: 7, exhale: 8 } as const;
const BREATH_LABELS = { inhale: 'Breathe in', hold: 'Hold', exhale: 'Breathe out' } as const;

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
          }, BREATH_SECONDS.exhale * 1000);
        }, BREATH_SECONDS.hold * 1000);
      }, BREATH_SECONDS.inhale * 1000);
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

            {/* Breathing circle: grows as they breathe in, rests full while
                they hold (a slow glow), and shrinks as they breathe out.
                Reduced-motion users get the fades without the scaling. */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-16" aria-live="polite">
              <motion.div
                className="absolute inset-0 rounded-full bg-brand-primary/40 blur-2xl"
                initial={{ scale: 0.5, opacity: 0.15 }}
                animate={{
                  scale: breathState === 'exhale' ? 0.5 : 1.15,
                  opacity: breathState === 'hold' ? [0.45, 0.65, 0.45] : breathState === 'inhale' ? 0.45 : 0.15,
                }}
                transition={{
                  scale: { duration: BREATH_SECONDS[breathState], ease: 'easeInOut' },
                  opacity: breathState === 'hold'
                    ? { duration: 3.5, ease: 'easeInOut', repeat: 1 }
                    : { duration: BREATH_SECONDS[breathState], ease: 'easeInOut' },
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-popover/25 bg-popover/15"
                initial={{ scale: 0.55 }}
                animate={{ scale: breathState === 'exhale' ? 0.55 : 1 }}
                transition={{ duration: BREATH_SECONDS[breathState], ease: 'easeInOut' }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={breathState}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 0.9, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="z-10 text-white text-2xl font-serif italic"
                >
                  {BREATH_LABELS[breathState]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quick Action Text */}
            <div className="max-w-xs text-center space-y-8">
              <p className="font-serif text-lg italic text-white/70">
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
                {copied ? 'Copied' : 'Copy message'}
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

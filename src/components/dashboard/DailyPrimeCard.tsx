// Daily Micro-Prime (Master PRD §4.3) — the connective tissue between
// Neutral Observer sessions.
//
// Shows one prime per day (PPR / Capitalization alternating), grounded in the
// user's chosen habit anchor and carrying an implementation intention.
//
// Enjoyment-first: no citation, no construct name, no "research shows" — the
// user sees a warm nudge. The science is in the metadata and on the Science
// page. Deliberately quiet: read it in five seconds and get on with your day.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { getPrimeForDay, DEFAULT_ANCHOR, type MicroPrime } from '@/data/micro-primes';

/** Stable day index so the prime doesn't reshuffle on refresh. */
function dayIndexFromEpoch(): number {
  return Math.floor(Date.now() / 86400000);
}

export function DailyPrimeCard() {
  const [anchor, setAnchor] = useState<string>(DEFAULT_ANCHOR);
  const [prime, setPrime] = useState<MicroPrime | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('profiles')
          .select('habit_anchors')
          .eq('id', user.id)
          .maybeSingle();
        const first = Array.isArray(data?.habit_anchors) ? data.habit_anchors[0] : null;
        if (!cancelled) {
          if (first) setAnchor(first);
          setPrime(getPrimeForDay(dayIndexFromEpoch()));
        }
      } catch {
        // fail-soft: show the prime with the default anchor rather than nothing
        if (!cancelled) setPrime(getPrimeForDay(dayIndexFromEpoch()));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!prime) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-brand-primary/10 bg-white/60 p-5 shadow-sm backdrop-blur-sm"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary/60">
        Today&apos;s nudge
      </p>
      <p className="mb-4 text-sm leading-relaxed text-brand-espresso">{prime.body}</p>
      <div className="rounded-2xl border border-brand-growth/30 bg-brand-growth/10 px-4 py-3">
        <p className="text-xs leading-relaxed text-brand-espresso">
          {prime.ifThen(anchor)}
        </p>
      </div>
    </motion.div>
  );
}

// Quarterly Neutral Observer card (spec §4). Appears only when due
// (study dosage: 3×/year). Launches with trigger=scheduled so completion
// advances next_neutral_observer_due +90d.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

export function NeutralObserverCard() {
  const router = useRouter();
  const [due, setDue] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/reflections/due', { headers });
        if (!res.ok) return;
        const payload = await res.json();
        if (!cancelled) setDue(Boolean(payload.due));
      } catch {
        // fail-soft: no card
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!due) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <PeterAvatar mood="afternoon" size={32} />
        <p className="text-lg font-serif text-brand-espresso tracking-tight">A Different Pair of Eyes</p>
      </div>
      <p className="text-sm leading-relaxed text-brand-text-secondary mb-4 relative z-10">
        It&apos;s been a while since you stepped outside a disagreement and looked at it
        from somewhere new. 90 seconds, just you.
      </p>
      <button
        onClick={() => router.push('/neutral-observer?trigger=scheduled')}
        className="relative z-10 rounded-full border border-brand-primary/20 px-4 py-2 text-xs font-medium text-brand-espresso hover:bg-brand-primary/10 transition-colors"
      >
        Take a look
      </button>
    </motion.div>
  );
}

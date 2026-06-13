// Welcome-back card (spec §4). Renders only after a 3+ day gap. Celebrates the
// lifetime practice-days count; one gentle CTA into the normal loop.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { welcomeCardCopy } from '@/lib/welcome-back';

export function WelcomeBackCard() {
  const router = useRouter();
  const [copy, setCopy] = useState<{ headline: string; body: string; cta: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/me/return-state', { headers });
        if (!res.ok) return;
        const rs = await res.json();
        if (!cancelled && rs.returning) setCopy(welcomeCardCopy(rs.practice_days));
      } catch {
        // fail-soft: no card
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!copy) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <PeterAvatar mood="morning" size={32} />
        <p className="text-lg font-serif text-brand-espresso tracking-tight">{copy.headline}</p>
      </div>
      <p className="text-sm leading-relaxed text-brand-text-secondary mb-4 relative z-10">{copy.body}</p>
      <button
        onClick={() => router.push('/daily-growth')}
        className="relative z-10 rounded-full border border-brand-primary/20 px-4 py-2 text-xs font-medium text-brand-espresso hover:bg-brand-primary/10 transition-colors"
      >
        {copy.cta}
      </button>
    </motion.div>
  );
}

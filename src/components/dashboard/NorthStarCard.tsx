// North Star placecard (spec §6): the user's confirmed "becoming" line.
// Quiet by design — no label, no chrome, no edit affordance (editing happens
// through Peter at journey boundaries). Renders nothing until a line exists.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';

export function NorthStarCard() {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/me/north-star', { headers });
        if (!res.ok) return;
        const payload = await res.json();
        if (!cancelled && payload.line) setLine(payload.line);
      } catch {
        // fail-soft: no card
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!line) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm px-6 py-4"
    >
      <p className="font-serif italic text-brand-espresso text-sm leading-relaxed text-center">
        {line}
      </p>
    </motion.div>
  );
}

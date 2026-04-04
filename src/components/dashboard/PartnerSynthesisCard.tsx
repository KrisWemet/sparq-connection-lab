import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface PartnerSynthesis {
  day_index: number;
  synthesis: string;
  generated_at: string;
}

interface PartnerSynthesisCardProps {
  hasPartner?: boolean;
}

export function PartnerSynthesisCard({ hasPartner = true }: PartnerSynthesisCardProps) {
  const [data, setData] = useState<PartnerSynthesis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;

        const { data: rows } = await supabase
          .from('partner_syntheses')
          .select('day_index, synthesis, generated_at')
          .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
          .order('day_index', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (rows) setData(rows);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;

  if (!hasPartner || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-brand-primary/5 backdrop-blur-md rounded-3xl border border-brand-primary/10 shadow-[0_8px_30px_rgb(200,106,88,0.04)] p-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center shadow-sm">
            <span className="text-2xl">🌱</span>
          </div>
          <div>
            <p className="text-lg font-serif text-zinc-900 tracking-tight">Your Solo Reflection</p>
            <p className="text-xs font-medium text-brand-primary uppercase tracking-wide">Practice outside the app</p>
          </div>
        </div>

        <p className="text-[15px] text-zinc-700 leading-relaxed mb-4 relative z-10 italic font-serif">
          &quot;Take tonight&apos;s insight into one real moment. Pause, breathe, and say the truer, kinder version of what you mean.&quot;
        </p>

        <p className="text-xs text-zinc-500 leading-snug relative z-10">
          Your partner does not need to join for this to matter. Shared reflections appear only when both of you are actively participating.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-brand-primary/5 backdrop-blur-md rounded-3xl border border-brand-primary/10 shadow-[0_8px_30px_rgb(200,106,88,0.04)] p-6 relative overflow-hidden"
    >
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center shadow-sm">
          <span className="text-2xl">💜</span>
        </div>
        <div>
          <p className="text-lg font-serif text-zinc-900 tracking-tight">Your Shared Reflection</p>
          <p className="text-xs font-medium text-brand-primary uppercase tracking-wide">Day {data.day_index}</p>
        </div>
      </div>

      <p className="text-[15px] text-zinc-700 leading-relaxed mb-4 relative z-10 italic font-serif">&quot;{data.synthesis}&quot;</p>

      <p className="text-xs text-zinc-500 leading-snug relative z-10">
        Generated from both your reflections — Peter isn&apos;t sharing what either of you said word for word.
      </p>
    </motion.div>
  );
}

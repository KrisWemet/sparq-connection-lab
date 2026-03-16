import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface WeeklyInsight {
  patterns: string[];
  growth_edge: string;
  strength: string;
  week_start: string;
  insufficient_data?: boolean;
}

export function WeeklyMirrorCard() {
  const [data, setData] = useState<WeeklyInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch('/api/me/patterns', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) setData(await res.json());
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/80 rounded-3xl border border-brand-primary/10 shadow-[0_8px_30px_rgb(200,106,88,0.04)] p-6 animate-pulse backdrop-blur-md">
        <div className="h-4 bg-brand-linen rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-brand-linen rounded w-full" />
          <div className="h-3 bg-brand-linen rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!data || data.insufficient_data) {
    return (
      <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #FFFFFF 0%, #FDF8F6 100%)', border: '1px solid rgba(200,106,88,0.1)', boxShadow: '0 2px 12px rgba(200,106,88,0.04)' }}>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none" style={{ background: 'rgba(200,106,88,0.06)' }} />
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <Image src="/images/peter-default.png" alt="Peter" width={32} height={32} style={{ width: 32, height: 32, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
          <p className="text-lg font-serif text-zinc-800 tracking-tight">Weekly Mirror</p>
        </div>
        <p className="text-sm leading-relaxed relative z-10 italic" style={{ color: '#8C827A' }}>
          &quot;Peter&apos;s still learning your patterns. Check back after Day 7 — you&apos;re doing great so far.&quot;
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/90 rounded-3xl border border-brand-primary/10 shadow-[0_8px_30px_rgb(200,106,88,0.04)] p-6 relative overflow-hidden backdrop-blur-md"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-sand/40 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <span className="text-xl">🦦</span>
        <p className="text-lg font-serif text-zinc-800 tracking-tight">What I noticed this week</p>
      </div>

      <div className="space-y-3 mb-6 relative z-10">
        {data.patterns.map((pattern, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-brand-primary/40 mt-1 flex-shrink-0 text-lg leading-none">•</span>
            <p className="text-sm text-zinc-700 leading-relaxed">{pattern}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 relative z-10">
        <span className="inline-flex items-center gap-1.5 bg-brand-linen/80 border border-brand-primary/10 text-zinc-700 text-xs font-semibold px-4 py-2 rounded-full">
          <span className="text-brand-primary">Growing toward:</span>
          <span className="font-medium">{data.growth_edge}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 bg-brand-linen/80 border border-brand-primary/10 text-zinc-700 text-xs font-semibold px-4 py-2 rounded-full">
          <span className="text-brand-primary">Your strength:</span>
          <span className="font-medium">{data.strength}</span>
        </span>
      </div>
    </motion.div>
  );
}

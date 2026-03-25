import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

interface WeeklyInsight {
  patterns: string[];
  growth_edge: string;
  strength: string;
  week_start: string;
  insufficient_data?: boolean;
}

interface WeeklyMirror {
  narrative_text: string;
  practice_count: number;
  practices_felt_natural: number;
  week_start: string;
}

export function WeeklyMirrorCard() {
  const [data, setData] = useState<WeeklyInsight | null>(null);
  const [mirror, setMirror] = useState<WeeklyMirror | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const headers = await buildAuthedHeaders();

        // Fetch patterns and narrative mirror in parallel
        const [patternsRes, mirrorRes] = await Promise.all([
          fetch('/api/me/patterns', { headers }),
          fetch('/api/weekly-mirror/generate', { method: 'POST', headers }),
        ]);

        if (patternsRes.ok) setData(await patternsRes.json());
        if (mirrorRes.ok) {
          const mirrorData = await mirrorRes.json();
          if (mirrorData.mirror) setMirror(mirrorData.mirror);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-brand-linen rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-brand-linen rounded w-full" />
          <div className="h-3 bg-brand-linen rounded w-5/6" />
        </div>
      </div>
    );
  }

  const hasNarrative = mirror?.narrative_text;
  const hasPatterns = data && !data.insufficient_data && data.patterns.length > 0;

  if (!hasNarrative && !hasPatterns) {
    return (
      <div className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <PeterAvatar mood="afternoon" size={32} />
          <p className="text-lg font-serif text-brand-espresso tracking-tight">Your Weekly Mirror</p>
        </div>
        <p className="text-sm leading-relaxed relative z-10 font-serif italic text-brand-text-secondary">
          As you keep showing up, I am learning how you grow. Come back after a few sessions to see your first mirror.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-sand/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <PeterAvatar mood="afternoon" size={32} />
        <p className="text-lg font-serif text-brand-espresso tracking-tight">Weekly Mirror</p>
      </div>

      {/* Narrative synthesis — the primary content */}
      {hasNarrative && (
        <p className="font-serif italic text-brand-espresso text-[15px] leading-relaxed mb-4 relative z-10">
          {mirror.narrative_text}
        </p>
      )}

      {/* Practice stats */}
      {mirror && mirror.practice_count > 0 && (
        <div className="flex gap-4 mb-4 relative z-10">
          <div className="text-center">
            <p className="text-lg font-bold text-brand-primary">{mirror.practice_count}</p>
            <p className="text-xs text-brand-text-secondary">sessions</p>
          </div>
          {mirror.practices_felt_natural > 0 && (
            <div className="text-center">
              <p className="text-lg font-bold text-brand-growth">{mirror.practices_felt_natural}</p>
              <p className="text-xs text-brand-text-secondary">felt natural</p>
            </div>
          )}
        </div>
      )}

      {/* Pattern tags from existing /api/me/patterns */}
      {hasPatterns && (
        <div className="flex flex-wrap gap-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-brand-linen border border-brand-primary/10 text-brand-text-secondary text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="text-brand-primary">Edge:</span>
            <span className="font-medium">{data.growth_edge}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-brand-linen border border-brand-primary/10 text-brand-text-secondary text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="text-brand-primary">Strength:</span>
            <span className="font-medium">{data.strength}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}

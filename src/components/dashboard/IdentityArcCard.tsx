import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const ARC_STAGES = [
  { label: 'Noticing', description: 'Seeing the pattern' },
  { label: 'Pausing', description: 'Creating space before reacting' },
  { label: 'Responding', description: 'Choosing differently' },
  { label: 'Integrating', description: 'Practicing until it feels natural' },
];

// Identity words must be the user's own (constitution v1.1 §5A). These are
// the statements Peter used to assign automatically; rows that still hold
// one are treated as "no statement yet", never shown as the user's identity.
const LEGACY_ASSIGNED_STATEMENTS = new Set([
  "I'm becoming someone who notices the patterns in how I show up.",
  "I'm becoming someone who creates space before reacting.",
  "I'm becoming someone who chooses how to respond.",
  "I'm becoming someone who shows up with presence without even trying.",
]);

export function IdentityArcCard() {
  const [arcStage, setArcStage] = useState(1);
  const [arcStatement, setArcStatement] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [{ data }, { data: northStar }] = await Promise.all([
          supabase
            .from('user_insights')
            .select('arc_stage, arc_statement')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('north_stars')
            .select('line')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .not('line', 'is', null)
            .order('confirmed_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        const stage = Math.max(1, Math.min(4, data?.arc_stage ?? 1));
        setArcStage(stage);
        const ownStatement =
          data?.arc_statement && !LEGACY_ASSIGNED_STATEMENTS.has(data.arc_statement) ? data.arc_statement : '';
        setArcStatement(northStar?.line || ownStatement);
      } catch {
        setArcStatement('');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;

  const currentStageInfo = ARC_STAGES[arcStage - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden"
    >
      {/* Organic blur accent */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-brand-primary/6 rounded-full blur-2xl pointer-events-none" />

      <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover mb-4">
        Your arc
      </p>

      {/* The user's own words, or an open invitation — never assigned. */}
      {arcStatement ? (
        <p className="font-serif italic text-brand-espresso text-xl leading-snug mb-5">
          {arcStatement}
        </p>
      ) : (
        <p className="font-serif text-brand-espresso text-lg leading-snug mb-5">
          Who do you want to be in the hard moments? When you find your words, they&apos;ll live here.
        </p>
      )}

      {/* Stage dots */}
      <div className="flex items-center gap-3">
        {ARC_STAGES.map((stage, i) => {
          const stageNum = i + 1;
          const isPast = stageNum < arcStage;
          const isCurrent = stageNum === arcStage;
          const isFuture = stageNum > arcStage;

          return (
            <div key={stage.label} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`relative w-full h-1.5 rounded-full transition-all duration-500 ${
                  isCurrent
                    ? 'bg-brand-primary'
                    : isPast
                    ? 'bg-brand-primary/50'
                    : 'bg-brand-primary/15'
                }`}
              >
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-brand-primary"
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors ${
                  isCurrent
                    ? 'text-brand-hover'
                    : isPast
                    ? 'text-brand-hover'
                    : 'text-brand-hover'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current stage description */}
      {currentStageInfo && (
        <p className="text-xs text-brand-text-secondary mt-3 leading-relaxed">
          {currentStageInfo.description}
        </p>
      )}
    </motion.div>
  );
}

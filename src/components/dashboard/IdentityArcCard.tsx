import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';

type DeepWhyLayer = { id: string; text: string; depth: number; bedrock: boolean };
type IdentityState = { steps: number; should_ask: boolean; last_answer?: string | null };

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
  const [layers, setLayers] = useState<DeepWhyLayer[]>([]);
  const [showWhy, setShowWhy] = useState(false);
  const [identity, setIdentity] = useState<IdentityState | null>(null);
  const [answer, setAnswer] = useState('');
  const [answered, setAnswered] = useState('');

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

        // Deep Why + identity evidence (constitution v1.2 §5B, §11B). Fail-soft.
        if (northStar?.line) {
          try {
            const headers = await buildAuthedHeaders();
            const [whyRes, idRes] = await Promise.all([
              fetch('/api/me/deep-why', { headers }),
              fetch('/api/me/identity-evidence', { headers }),
            ]);
            if (whyRes.ok) setLayers((await whyRes.json()).layers || []);
            if (idRes.ok) setIdentity(await idRes.json());
          } catch {
            /* the card still shows their line */
          }
        }
      } catch {
        setArcStatement('');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function retireLayer(id: string) {
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/me/deep-why', { method: 'PATCH', headers, body: JSON.stringify({ id }) });
      if (res.ok) setLayers(prev => prev.filter(l => l.id !== id));
    } catch {
      /* keep it showing; nothing changed */
    }
  }

  async function sendIdentity(action: 'answer' | 'not_now') {
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/me/identity-evidence', {
        method: 'POST', headers, body: JSON.stringify(action === 'answer' ? { action, text: answer } : { action }),
      });
      if (res.ok) {
        setAnswered(action === 'answer' ? 'Saved, in your words.' : "Okay. I'll ask another time.");
        setIdentity(prev => (prev ? { ...prev, should_ask: false } : prev));
      }
    } catch {
      /* fail-soft */
    }
  }

  if (loading) return null;
  const bedrock = layers.find(l => l.bedrock) ?? layers[layers.length - 1];

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

      {/* Deep Why — their own layers, shallowest to deepest (§5B). */}
      {arcStatement && bedrock && (
        <div className="mb-5 -mt-2 space-y-2">
          <p className="text-sm text-brand-text-secondary leading-relaxed">
            Why it matters to you: <span className="italic text-brand-espresso">&ldquo;{bedrock.text}&rdquo;</span>
          </p>
          <button type="button" onClick={() => setShowWhy(v => !v)} className="text-xs font-semibold text-brand-hover underline-offset-2 hover:underline">
            {showWhy ? 'Hide your layers' : `See all ${layers.length} layers`}
          </button>
          {showWhy && (
            <ol className="space-y-1.5">
              {layers.map(l => (
                <li key={l.id} className="flex items-start justify-between gap-3 text-sm text-brand-espresso">
                  <span><span className="text-brand-text-secondary">{l.depth}.</span> {l.text}</span>
                  <button type="button" onClick={() => retireLayer(l.id)} className="shrink-0 text-xs text-brand-text-secondary hover:text-brand-espresso">
                    Not why anymore
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Identity evidence: asked, never declared (§11B). */}
      {arcStatement && identity && identity.steps > 0 && !identity.should_ask && !answered && (
        <p className="mb-5 -mt-2 text-sm text-brand-text-secondary">
          You&apos;ve marked {identity.steps} {identity.steps === 1 ? 'step' : 'steps'} toward this lately.
        </p>
      )}
      {arcStatement && identity?.should_ask && !answered && (
        <div className="mb-5 -mt-2 space-y-2 rounded-2xl border border-brand-gold/40 bg-brand-gold-soft p-4">
          <p className="text-sm text-brand-espresso leading-relaxed">
            You said {identity.steps} things you did lately were steps toward this. Does that change how you see yourself?
          </p>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={2} maxLength={500}
            placeholder="In your own words (optional)" aria-label="Does that change how you see yourself?"
            className="w-full rounded-xl border border-brand-border bg-white/70 p-3 text-sm text-brand-espresso placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!answer.trim()} onClick={() => sendIdentity('answer')}
              className="rounded-full bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
              Save
            </button>
            <button type="button" onClick={() => sendIdentity('not_now')}
              className="rounded-full border border-brand-border px-5 py-2 text-sm font-medium text-brand-espresso hover:bg-white/60">
              Not now
            </button>
          </div>
        </div>
      )}
      {answered && <p className="mb-5 -mt-2 text-sm text-brand-text-secondary">{answered}</p>}

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

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { cn } from '@/lib/utils';

type Experiment = {
  id: string;
  intention: string;
  status: string;
  outcome?: string | null;
  outcome_note?: string | null;
};

type Outcome = 'helped' | 'mixed' | 'didnt_help';

const OUTCOME_LABELS: Record<Outcome, string> = {
  helped: 'It helped',
  mixed: 'Mixed',
  didnt_help: 'Not really',
};

/**
 * Self-chosen experiments (constitution §5, §9 Days 8–14): the user picks
 * something small to try, and Peter comes back to ask what happened.
 * `compact` renders only when a check-in is due (for Home).
 */
export function ExperimentsCard({ compact = false }: { compact?: boolean }) {
  const [due, setDue] = useState<Experiment[]>([]);
  const [open, setOpen] = useState<Experiment[]>([]);
  const [recent, setRecent] = useState<Experiment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<'ask' | 'tried' | 'not_yet'>('ask');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [note, setNote] = useState('');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [thanks, setThanks] = useState('');

  const load = useCallback(async () => {
    try {
      const headers = await buildAuthedHeaders();
      const res = await fetch('/api/experiments', { headers });
      if (!res.ok) return;
      const data = await res.json();
      setDue(data.due || []);
      setOpen(data.open || []);
      setRecent(data.recent || []);
    } catch {
      // fail-soft: the card just stays quiet
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function patch(body: Record<string, unknown>, message: string) {
    setBusy(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/experiments', { method: 'PATCH', headers, body: JSON.stringify(body) });
      if (res.ok) {
        setThanks(message);
        setStep('ask');
        setOutcome(null);
        setNote('');
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function addExperiment() {
    if (!draft.trim() || busy) return;
    setBusy(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/experiments', { method: 'POST', headers, body: JSON.stringify({ intention: draft }) });
      if (res.ok) {
        setDraft('');
        setThanks("Saved. I'll check in with you in a couple of days. 🦦");
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  const current = due[0];
  if (!loaded || (compact && !current && !thanks)) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">Your experiments</p>
      </div>

      <AnimatePresence mode="wait">
        {thanks && !current ? (
          <motion.p key="thanks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-brand-espresso">
            {thanks}
          </motion.p>
        ) : current ? (
          <motion.div key={current.id + step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="font-serif text-brand-espresso text-[15px] leading-relaxed">
              A few days ago you said you&apos;d try: <span className="italic">&ldquo;{current.intention}&rdquo;</span>
            </p>

            {step === 'ask' && (
              <>
                <p className="text-sm text-brand-text-secondary">How did it go?</p>
                <div className="flex gap-2">
                  <button type="button" disabled={busy} onClick={() => setStep('tried')}
                    className="rounded-full bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
                    I tried it
                  </button>
                  <button type="button" disabled={busy} onClick={() => setStep('not_yet')}
                    className="rounded-full border border-brand-border px-5 py-2 text-sm font-medium text-brand-espresso hover:bg-white/60 disabled:opacity-50">
                    Not yet
                  </button>
                </div>
              </>
            )}

            {step === 'tried' && (
              <>
                <p className="text-sm text-brand-text-secondary">How did it feel?</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(OUTCOME_LABELS) as Outcome[]).map(key => (
                    <button key={key} type="button" onClick={() => setOutcome(key)}
                      className={cn(
                        'rounded-full border px-4 py-1.5 text-sm transition-colors',
                        outcome === key ? 'border-brand-primary bg-brand-primary/10 font-semibold text-brand-hover' : 'border-brand-border text-brand-espresso hover:bg-white/60',
                      )}>
                      {OUTCOME_LABELS[key]}
                    </button>
                  ))}
                </div>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={500}
                  placeholder="What did you notice? (optional)" aria-label="What did you notice?"
                  className="w-full rounded-xl border border-brand-border bg-white/70 p-3 text-sm text-brand-espresso placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
                <button type="button" disabled={!outcome || busy}
                  onClick={() => patch({ id: current.id, status: 'tried', outcome, outcome_note: note }, 'Thank you for trying. That counts, whatever happened. 🦦')}
                  className="rounded-full bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
                  Save
                </button>
              </>
            )}

            {step === 'not_yet' && (
              <div className="flex gap-2">
                <button type="button" disabled={busy}
                  onClick={() => patch({ id: current.id, status: 'planned', snooze_days: 2 }, "Okay. I'll ask again in a couple of days.")}
                  className="rounded-full bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
                  Keep it for later
                </button>
                <button type="button" disabled={busy}
                  onClick={() => patch({ id: current.id, status: 'let_go' }, 'Letting it go is a choice too.')}
                  className="rounded-full border border-brand-border px-5 py-2 text-sm font-medium text-brand-espresso hover:bg-white/60 disabled:opacity-50">
                  Let it go
                </button>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!compact && (
        <>
          {open.filter(e => e.id !== current?.id).length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-text-secondary">Still trying</p>
              {open.filter(e => e.id !== current?.id).map(e => (
                <p key={e.id} className="text-sm text-brand-espresso">&ldquo;{e.intention}&rdquo;</p>
              ))}
            </div>
          )}
          {recent.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-text-secondary">What you learned</p>
              {recent.filter(e => e.status === 'tried').slice(0, 5).map(e => (
                <p key={e.id} className="text-sm text-brand-espresso">
                  &ldquo;{e.intention}&rdquo;
                  {e.outcome && <span className="text-brand-text-secondary"> · {OUTCOME_LABELS[e.outcome as Outcome]}</span>}
                </p>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-brand-text-secondary">Something small you want to try?</p>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2} maxLength={300}
              placeholder="When ___ happens, I'll try ___" aria-label="Something small you want to try"
              className="w-full rounded-xl border border-brand-border bg-white/70 p-3 text-sm text-brand-espresso placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
            <button type="button" disabled={!draft.trim() || busy} onClick={addExperiment}
              className="rounded-full bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
              Save my experiment
            </button>
          </div>
        </>
      )}
    </motion.section>
  );
}

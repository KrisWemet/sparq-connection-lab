import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { TONE } from '@/lib/moment-tone';
import { cn } from '@/lib/utils';

type Step = 'offer' | 'drafting' | 'editing' | 'kept' | 'shared';

/**
 * "Keep it private, or share with partner" (constitution §8).
 * Shown after a user writes a private discovery. Renders nothing unless the
 * user has a linked partner. Private is the default; nothing is shared until
 * the user reads, edits and taps Share.
 */
export function SharePrompt({ text, kind = 'discovery' }: { text: string; kind?: 'discovery' | 'appreciation' | 'need' }) {
  const [linked, setLinked] = useState(false);
  const [step, setStep] = useState<Step>('offer');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/couple', { headers });
        if (res.ok) setLinked(Boolean((await res.json()).space_id));
      } catch {
        // not linked / offline: stay hidden
      }
    })();
  }, []);

  async function helpMeShare() {
    setStep('drafting');
    setError('');
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/peter/share-draft', { method: 'POST', headers, body: JSON.stringify({ text }) });
      const data = res.ok ? await res.json() : null;
      setDraft(data?.draft || text);
    } catch {
      setDraft(text);
    }
    setStep('editing');
  }

  async function share() {
    if (!draft.trim()) return;
    setError('');
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/couple', { method: 'POST', headers, body: JSON.stringify({ kind, body: draft }) });
      if (!res.ok) throw new Error('share failed');
      setStep('shared');
    } catch {
      setError("That didn't send. Try again in a moment.");
    }
  }

  if (!linked) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={cn('mt-3 rounded-2xl p-4 space-y-3', step === 'offer' || step === 'kept' ? 'border border-brand-primary/10 bg-popover/60' : TONE.connect.card)}
      >
        {step === 'offer' && (
          <>
            <p className="text-sm text-brand-espresso">This is yours. Keep it private, or share it with your partner? You&apos;ll see the words before anything is sent.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setStep('kept')}
                className="rounded-full border border-brand-border px-4 py-1.5 text-sm font-medium text-brand-espresso hover:bg-popover">
                Keep it private
              </button>
              <button type="button" onClick={helpMeShare}
                className={cn(TONE.connect.button, 'rounded-full px-4 py-1.5 text-sm')}>
                Share with partner
              </button>
            </div>
          </>
        )}
        {step === 'drafting' && <p className="text-sm text-brand-text-secondary">Finding the words with you…</p>}
        {step === 'editing' && (
          <>
            <p className="text-xs text-brand-text-secondary">Change anything you like. Nothing is sent until you tap Share.</p>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={4} maxLength={1000}
              aria-label="Message to share with your partner"
              className="w-full rounded-xl border border-brand-border bg-popover p-3 text-sm text-brand-espresso focus:outline-none focus:ring-2 focus:ring-ring border-input placeholder:text-muted-foreground" />
            {error && <p className="text-xs text-brand-hover">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={share} disabled={!draft.trim()}
                className={cn(TONE.connect.button, 'rounded-full px-4 py-1.5 text-sm disabled:opacity-50')}>
                Share
              </button>
              <button type="button" onClick={() => setStep('kept')}
                className="rounded-full border border-brand-border px-4 py-1.5 text-sm font-medium text-brand-espresso hover:bg-popover">
                Not now
              </button>
            </div>
          </>
        )}
        {step === 'kept' && <p className="text-sm text-brand-text-secondary">It stays just yours. 🦦</p>}
        {step === 'shared' && <p className="text-sm text-brand-espresso">Shared. You&apos;ll both find it in your shared space.</p>}
      </motion.div>
    </AnimatePresence>
  );
}

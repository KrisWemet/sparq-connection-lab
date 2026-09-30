import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildAuthedHeaders } from '@/lib/api-auth';

type Step = 'offer' | 'drafting' | 'editing' | 'kept' | 'shared';

/**
 * "Keep it private, or help me put it into words" (constitution §8).
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
        className="mt-3 rounded-2xl border border-brand-primary/10 bg-white/60 p-4 space-y-3"
      >
        {step === 'offer' && (
          <>
            <p className="text-sm text-brand-espresso">This is yours. Do you want to keep it private, or put it into words for your partner?</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setStep('kept')}
                className="rounded-full border border-brand-border px-4 py-1.5 text-sm font-medium text-brand-espresso hover:bg-white">
                Keep it private
              </button>
              <button type="button" onClick={helpMeShare}
                className="rounded-full bg-brand-primary px-4 py-1.5 text-sm font-bold text-white hover:opacity-90">
                Help me share it
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
              className="w-full rounded-xl border border-brand-border bg-white p-3 text-sm text-brand-espresso focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
            {error && <p className="text-xs text-brand-hover">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={share} disabled={!draft.trim()}
                className="rounded-full bg-brand-primary px-4 py-1.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
                Share
              </button>
              <button type="button" onClick={() => setStep('kept')}
                className="rounded-full border border-brand-border px-4 py-1.5 text-sm font-medium text-brand-espresso hover:bg-white">
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

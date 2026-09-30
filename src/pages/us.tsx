import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

type SharedItem = { id: string; author_id: string; kind: string; body: string; created_at: string };
type Cycle = { id: string; name: string; what_helps: string | null; confirmed_by: string[]; status: string };

const KIND_LABELS: Record<string, string> = {
  appreciation: 'Something I appreciate',
  need: 'Something I need',
  discovery: 'Something I noticed',
  value: 'Something that matters to us',
  ritual: 'A ritual',
  agreement: 'An agreement',
  memory: 'A memory',
  repair: 'What helps us reconnect',
};
const SHARE_KINDS = ['appreciation', 'need', 'discovery'] as const;

/**
 * Your shared space ("Us", constitution §7–8). Only what each partner chose
 * to share lives here. Shared Peter builds on these items alone.
 */
export default function UsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const partnerName = profile?.partner_name?.trim() || 'your partner';

  const [loaded, setLoaded] = useState(false);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [me, setMe] = useState('');
  const [items, setItems] = useState<SharedItem[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [kind, setKind] = useState<typeof SHARE_KINDS[number]>('appreciation');
  const [body, setBody] = useState('');
  const [cycleName, setCycleName] = useState('');
  const [cycleHelps, setCycleHelps] = useState('');
  const [peter, setPeter] = useState<{ question: string | null; why?: string | null; message?: string } | null>(null);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const headers = await buildAuthedHeaders();
      const res = await fetch('/api/couple', { headers });
      if (res.ok) {
        const data = await res.json();
        setSpaceId(data.space_id);
        setMe(data.me);
        setItems(data.items || []);
        setCycles(data.cycles || []);
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function send(path: string, method: string, payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch(path, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) await load();
      return res.ok;
    } finally {
      setBusy(false);
    }
  }

  async function askPeter() {
    setAsking(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/peter/shared-reflect', { method: 'POST', headers, body: '{}' });
      if (res.ok) setPeter(await res.json());
    } finally {
      setAsking(false);
    }
  }

  const card = 'bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6';
  const input = 'w-full rounded-xl border border-brand-border bg-white/70 p-3 text-sm text-brand-espresso placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/30';
  const primary = 'rounded-full bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-brand-linen pb-28">
        <header className="max-w-lg mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.push('/dashboard')} aria-label="Back to Home"
              className="w-10 h-10 rounded-full border border-brand-primary/10 bg-brand-parchment text-brand-primary flex items-center justify-center hover:bg-brand-primary/5">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-hover">Us</span>
            <div className="w-10 h-10" aria-hidden="true" />
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 space-y-5">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
            <h1 className="font-serif text-2xl text-brand-espresso">Your shared space</h1>
            <p className="text-sm text-brand-text-secondary leading-relaxed mt-2">
              Only what each of you chooses to share lives here. Everything else stays private, even from Peter&apos;s shared side.
            </p>
          </motion.section>

          {loaded && !spaceId && (
            <section className={card}>
              <p className="font-serif text-brand-espresso">Once you and {partnerName} are linked, this becomes a place you both can add to.</p>
              <Link href="/join-partner" className="inline-block mt-3 text-sm font-semibold text-brand-hover hover:text-brand-espresso">
                Link with your partner
              </Link>
            </section>
          )}

          {spaceId && (
            <>
              <section className={cn(card, 'space-y-3')}>
                <div className="flex items-center gap-3">
                  <PeterAvatar mood="afternoon" size={32} />
                  <p className="font-serif text-brand-espresso">Something to talk about together</p>
                </div>
                {peter?.question ? (
                  <>
                    <p className="font-serif text-lg text-brand-espresso leading-snug">{peter.question}</p>
                    {peter.why && <p className="text-sm text-brand-text-secondary">{peter.why}</p>}
                  </>
                ) : peter?.message ? (
                  <p className="text-sm text-brand-text-secondary">{peter.message}</p>
                ) : (
                  <p className="text-sm text-brand-text-secondary">I only use what you two shared here.</p>
                )}
                <button type="button" onClick={askPeter} disabled={asking} className={primary}>
                  {asking ? 'Thinking…' : peter ? 'Another question' : 'Give us a question'}
                </button>
              </section>

              <section className={cn(card, 'space-y-3')}>
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">Share something</p>
                <div className="flex flex-wrap gap-2">
                  {SHARE_KINDS.map(k => (
                    <button key={k} type="button" onClick={() => setKind(k)}
                      className={cn('rounded-full border px-3 py-1.5 text-xs transition-colors',
                        kind === k ? 'border-brand-primary bg-brand-primary/10 font-semibold text-brand-hover' : 'border-brand-border text-brand-espresso hover:bg-white/60')}>
                      {KIND_LABELS[k]}
                    </button>
                  ))}
                </div>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} maxLength={1000}
                  aria-label="What you want to share" placeholder="In your own words…" className={input} />
                <button type="button" disabled={!body.trim() || busy} className={primary}
                  onClick={async () => { if (await send('/api/couple', 'POST', { kind, body })) setBody(''); }}>
                  Share with {partnerName}
                </button>
              </section>

              {items.length > 0 && (
                <section className={cn(card, 'space-y-4')}>
                  <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">What you&apos;ve shared</p>
                  {items.map(item => (
                    <div key={item.id} className="border-b border-brand-border/60 pb-3 last:border-0 last:pb-0">
                      <p className="text-xs text-brand-text-secondary mb-1">
                        {item.author_id === me ? 'You' : partnerName} · {KIND_LABELS[item.kind] ?? item.kind}
                      </p>
                      <p className="font-serif text-brand-espresso text-[15px] leading-relaxed whitespace-pre-wrap">{item.body}</p>
                      {item.author_id === me && (
                        <button type="button" disabled={busy} onClick={() => send('/api/couple', 'DELETE', { id: item.id })}
                          className="mt-1 text-xs text-brand-hover hover:text-brand-espresso">
                          Un-share
                        </button>
                      )}
                    </div>
                  ))}
                </section>
              )}

              <section className={cn(card, 'space-y-3')}>
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">Patterns between you</p>
                <p className="text-sm text-brand-text-secondary">
                  Name a loop you both fall into, like &ldquo;one of us reaches, one of us steps back.&rdquo; The loop is the problem, never either of you. It only becomes &ldquo;ours&rdquo; when you both agree.
                </p>
                {cycles.map(c => {
                  const iConfirmed = c.confirmed_by.includes(me);
                  return (
                    <div key={c.id} className="rounded-2xl bg-brand-linen p-4 border border-brand-primary/10">
                      <p className="font-serif text-brand-espresso">{c.name}</p>
                      {c.what_helps && <p className="text-sm text-brand-text-secondary mt-1">What helps: {c.what_helps}</p>}
                      <p className="text-xs text-brand-text-secondary mt-2">
                        {c.status === 'confirmed' ? 'You both named this one.' : iConfirmed ? `Waiting for ${partnerName} to agree.` : `${partnerName} named this. Does it fit for you too?`}
                      </p>
                      {!iConfirmed && (
                        <button type="button" disabled={busy} className="mt-2 text-sm font-semibold text-brand-hover hover:text-brand-espresso"
                          onClick={() => send('/api/couple/cycles', 'PATCH', { id: c.id, action: 'confirm' })}>
                          Yes, this is us
                        </button>
                      )}
                    </div>
                  );
                })}
                <input value={cycleName} onChange={e => setCycleName(e.target.value)} maxLength={120}
                  aria-label="Name a pattern" placeholder="When ___, one of us ___ and the other ___" className={input} />
                <input value={cycleHelps} onChange={e => setCycleHelps(e.target.value)} maxLength={1000}
                  aria-label="What helps" placeholder="What helps us find our way back (optional)" className={input} />
                <button type="button" disabled={!cycleName.trim() || busy} className={primary}
                  onClick={async () => {
                    if (await send('/api/couple/cycles', 'POST', { name: cycleName, what_helps: cycleHelps })) {
                      setCycleName('');
                      setCycleHelps('');
                    }
                  }}>
                  Suggest this pattern
                </button>
              </section>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

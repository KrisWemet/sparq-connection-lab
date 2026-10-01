import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { cn } from '@/lib/utils';

type Guess = {
  trait_key: string;
  topic: string;
  text: string;
  level: 'told' | 'evidence' | 'wondering' | 'excluded';
  status: string | null;
  user_feedback: string | null;
};
type Rejected = { id: string; offered_text: string | null; user_response: string | null };
type Reason = { id: string; reason_text: string; for_what: string | null };
type Data = { prefs: Record<string, string>; guesses: Guess[]; rejected: Rejected[]; reasons: Reason[] };

// Mirrors CONVERSATION_PREFS in src/lib/server/insight-profile.ts (labels only).
const PREFS: Array<{ key: string; label: string; options: Array<{ value: string; label: string }> }> = [
  { key: 'reply_length', label: 'How long Peter’s replies are', options: [
    { value: 'short', label: 'Short and simple' },
    { value: 'detailed', label: 'A bit more detail' },
  ] },
  { key: 'question_style', label: 'Questions that help you think', options: [
    { value: 'specific', label: 'Specific ones' },
    { value: 'open', label: 'Open ones' },
  ] },
  { key: 'directness', label: 'When you’re stuck', options: [
    { value: 'gentle', label: 'Go gently' },
    { value: 'direct', label: 'Be direct with me' },
  ] },
];

const LEVEL_WORDS: Record<Guess['level'], string> = {
  told: 'You told Peter this fits',
  evidence: 'Peter’s guess, from a few moments',
  wondering: 'Just a hunch so far',
  excluded: 'You said this doesn’t fit',
};

/**
 * "How I see things most clearly" — the user-visible Insight Profile
 * (constitution v1.1 §3). Everything Peter guesses is shown here in plain
 * words; the user keeps, fixes or removes it.
 */
export default function InsightProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const headers = await buildAuthedHeaders();
      const res = await fetch('/api/me/insight-profile', { headers });
      if (res.ok) setData(await res.json());
    } catch {
      // fail-soft: page shows the empty state
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function send(url: string, body: Record<string, unknown>) {
    setBusy(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(body) });
      if (res.ok) await load();
    } finally {
      setBusy(false);
    }
  }

  const card = 'bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 space-y-4';
  const chip = (active: boolean) => cn(
    'rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50',
    active ? 'border-brand-primary bg-brand-primary/10 font-semibold text-brand-hover' : 'border-brand-border text-brand-espresso hover:bg-white/60',
  );

  const guesses = (data?.guesses || []).filter(g => g.level !== 'excluded');

  return (
    <ProtectedRoute>
      <div className="min-h-dvh bg-brand-linen pb-28">
        <header className="max-w-lg mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.push('/journal')} aria-label="Back to Journal"
              className="w-10 h-10 rounded-full border border-brand-primary/10 bg-brand-parchment text-brand-primary flex items-center justify-center hover:bg-brand-primary/5">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-hover">About you</span>
            <div className="w-10 h-10" aria-hidden="true" />
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 space-y-5">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
            <div className="flex items-center gap-3">
              <PeterAvatar mood="afternoon" size={36} />
              <h1 className="font-serif text-2xl text-brand-espresso">How you see things most clearly</h1>
            </div>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              This is everything Peter is guessing about you, plus the things you told him. You&apos;re the judge.
              Keep what fits, fix what doesn&apos;t, and remove anything you like.
            </p>
          </motion.section>

          {/* 1. Their own settings */}
          <section className={card}>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">How you like Peter to talk with you</p>
            {PREFS.map(pref => (
              <div key={pref.key} className="space-y-2">
                <p className="text-sm text-brand-espresso">{pref.label}</p>
                <div className="flex flex-wrap gap-2">
                  {pref.options.map(opt => {
                    const active = data?.prefs?.[pref.key] === opt.value;
                    return (
                      <button key={opt.value} type="button" disabled={busy} className={chip(active)}
                        onClick={() => send('/api/me/insight-profile', { action: 'set_pref', key: pref.key, value: active ? null : opt.value })}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="text-xs text-brand-text-secondary">Tap again to clear. Peter follows these.</p>
          </section>

          {/* 2. Peter's guesses */}
          <section className={card}>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">Peter&apos;s guesses about you</p>
            {guesses.length === 0 ? (
              <p className="text-sm text-brand-text-secondary">Peter doesn&apos;t have any guesses yet. They&apos;ll show up here as you keep going.</p>
            ) : guesses.map(g => (
              <div key={g.trait_key} className="rounded-2xl bg-brand-linen p-4 border border-brand-primary/10 space-y-2">
                <p className="text-xs font-semibold text-brand-text-secondary">{g.topic}</p>
                <p className="font-serif text-brand-espresso text-[15px] leading-relaxed">{g.text}</p>
                <p className="text-xs text-brand-text-secondary">{LEVEL_WORDS[g.level]}</p>
                <div className="flex flex-wrap gap-2">
                  {([['yes', 'That’s me'], ['not_really', 'Not really'], ['unsure', 'Not sure']] as const).map(([value, label]) => (
                    <button key={value} type="button" disabled={busy} className={chip(g.user_feedback === value)}
                      onClick={() => send('/api/profile/traits', { trait_key: g.trait_key, feedback: value })}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* 3. What they said doesn't fit */}
          {(data?.rejected?.length ?? 0) > 0 && (
            <section className={card}>
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">Things you told Peter don&apos;t fit</p>
              <p className="text-sm text-brand-text-secondary">Peter won&apos;t bring these up again. If one actually does fit, you can bring it back.</p>
              {data!.rejected.map(r => (
                <div key={r.id} className="border-b border-brand-border/60 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm text-brand-espresso">&ldquo;{(r.offered_text || '').slice(0, 160)}&rdquo;</p>
                  {r.user_response && <p className="text-xs text-brand-text-secondary mt-1">You said: &ldquo;{r.user_response.slice(0, 160)}&rdquo;</p>}
                  <button type="button" disabled={busy} className="mt-1 text-xs font-semibold text-brand-hover hover:text-brand-espresso"
                    onClick={() => send('/api/me/insight-profile', { action: 'unreject', id: r.id })}>
                    Bring this back
                  </button>
                </div>
              ))}
            </section>
          )}

          {/* 4. Their own reasons */}
          {(data?.reasons?.length ?? 0) > 0 && (
            <section className={card}>
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">Your reasons, in your words</p>
              <p className="text-sm text-brand-text-secondary">Peter only ever reminds you of reasons you gave. If one isn&apos;t true anymore, let it go.</p>
              {data!.reasons.map(r => (
                <div key={r.id} className="border-b border-brand-border/60 pb-3 last:border-0 last:pb-0">
                  {r.for_what && <p className="text-xs text-brand-text-secondary">For: &ldquo;{r.for_what}&rdquo;</p>}
                  <p className="font-serif text-brand-espresso text-[15px]">&ldquo;{r.reason_text}&rdquo;</p>
                  <button type="button" disabled={busy} className="mt-1 text-xs font-semibold text-brand-hover hover:text-brand-espresso"
                    onClick={() => send('/api/me/insight-profile', { action: 'retire_reason', id: r.id })}>
                    Not true anymore
                  </button>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

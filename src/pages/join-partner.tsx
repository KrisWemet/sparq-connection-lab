import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ChevronLeft, HeartHandshake, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { TONE } from '@/lib/moment-tone';
import { readPendingInvite as readPending, writePendingInvite as writePending } from '@/lib/partner-invite';

const REASONS: Record<string, string> = {
  expired: 'That invite has run out (they last 24 hours). Ask your partner to send a new one.',
  not_found: "That code didn't match anyone. Check it with your partner and try again.",
  own_code: "That's your own code. Send it to your partner, or enter theirs.",
  you_are_linked: "You're already linked with someone. Unlink first if you want to change that.",
  they_are_linked: 'That person is already linked with someone else.',
  not_signed_in: 'Please sign in first.',
};

/**
 * Partner linking by code. Sharing your code is the consent to link; either
 * partner can unlink at any time. Linking shares nothing by itself — "Us"
 * holds only what each of you chooses to share (RELATIONSHIP_MODEL.md).
 */
export default function JoinPartner() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const queryCode = typeof router.query.inviteCode === 'string' ? router.query.inviteCode : '';
  const partnerName = profile?.partner_name?.trim() || 'your partner';

  const [loaded, setLoaded] = useState(false);
  // Invites last 24 hours; a new one can be made once the last runs out.
  const [myCode, setMyCode] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [hadInvite, setHadInvite] = useState(false);
  const [linked, setLinked] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  // Fill the code box from the link (or one remembered from before sign-in).
  useEffect(() => {
    if (!router.isReady) return;
    const incoming = queryCode || readPending();
    if (incoming) setCode(incoming.toUpperCase());
    if (queryCode && !user) writePending(queryCode);
  }, [router.isReady, queryCode, user]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('partner_code, partner_code_expires_at, partner_id')
      .eq('id', user.id)
      .maybeSingle();
    setMyCode((data?.partner_code || '').toUpperCase());
    setExpiresAt(data?.partner_code_expires_at ? new Date(data.partner_code_expires_at) : null);
    setHadInvite(!!data?.partner_code_expires_at);
    setLinked(!!data?.partner_id);
    setLoaded(true);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const inviteActive = !!expiresAt && expiresAt.getTime() > Date.now();
  const inviteLink = myCode && typeof window !== 'undefined'
    ? `${window.location.origin}/join-partner?inviteCode=${myCode}`
    : '';

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(
        `I'm trying Sparq. Want to link up? Open this link, or enter my code ${myCode} (it works for 24 hours): ${inviteLink}`
      );
      toast.success('Copied. Send it to your partner however you like.');
    } catch {
      toast('Couldn’t copy just now — your code is right here on screen.');
    }
  }

  async function createInvite() {
    setBusy(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('new_partner_code');
      if (rpcError || !data?.ok) throw rpcError ?? new Error('no code');
      setMyCode(String(data.code).toUpperCase());
      setExpiresAt(new Date(data.expires_at));
      setHadInvite(true);
    } catch {
      toast("We couldn't make an invite just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function link() {
    setBusy(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('link_partner', { code: code.trim() });
      if (rpcError) throw rpcError;
      if (!data?.ok) {
        setError(REASONS[data?.reason] ?? "We couldn't link you just now. Please try again.");
        return;
      }
      writePending(null);
      toast.success('You’re linked. Your shared space is ready.');
      router.push('/us');
    } catch {
      setError("We couldn't link you just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function unlink() {
    setBusy(true);
    try {
      const { error: rpcError } = await supabase.rpc('unlink_partner');
      if (rpcError) throw rpcError;
      setConfirmUnlink(false);
      toast('You’re unlinked. Your own practice is just as it was.');
      await load();
    } catch {
      toast("We couldn't unlink just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const card = cn(TONE.connect.card, 'emotion-paper rounded-3xl shadow-sm p-6');
  const primary = cn(TONE.connect.button, 'w-full rounded-full px-5 py-3 text-sm disabled:opacity-50');
  const outline = cn(TONE.connect.outline, 'press w-full rounded-full px-5 py-3 text-sm font-bold disabled:opacity-50');

  return (
    <div className="emotion-page min-h-dvh bg-brand-linen pb-28">
      <header className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push(user ? '/us' : '/')} aria-label="Back"
            className="w-10 h-10 rounded-full border border-brand-primary/10 bg-brand-parchment text-brand-primary flex items-center justify-center hover:bg-brand-primary/5">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="bar-title">Link up</span>
          <div className="w-10 h-10" aria-hidden="true" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 space-y-5">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="bg-brand-coral/20 p-3 rounded-full w-fit mb-4">
            <HeartHandshake className="w-7 h-7 text-brand-coral-deep" />
          </div>
          <h1 className="font-serif text-2xl text-brand-espresso">Add a shared layer to your growth</h1>
          <p className="text-sm text-brand-text-secondary leading-relaxed mt-2">
            Your own practice stays yours. Linking only opens a shared space, and nothing goes there unless one of you chooses to share it.
          </p>
        </motion.section>

        {authLoading || (user && !loaded) ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-brand-coral-deep" /></div>
        ) : !user ? (
          <section className={cn(card, 'space-y-3')}>
            <p className="font-serif text-brand-espresso">
              {code ? 'Your partner invited you. Sign in or make an account, and their code will be waiting.' : 'Sign in to link with your partner.'}
            </p>
            <button type="button" className={primary} onClick={() => router.push('/login?mode=register')}>Create an account</button>
            <button type="button" className={outline} onClick={() => router.push('/login')}>I already have one</button>
          </section>
        ) : linked ? (
          <section className={cn(card, 'space-y-3')}>
            <p className="font-serif text-lg text-brand-espresso">You and {partnerName} are linked.</p>
            <Link href="/us" className={cn(primary, 'block text-center')}>Go to your shared space</Link>
            {!confirmUnlink ? (
              <button type="button" className="press block w-full text-center text-sm font-semibold text-brand-text-secondary underline underline-offset-4"
                onClick={() => setConfirmUnlink(true)}>
                Unlink
              </button>
            ) : (
              <div className={cn(TONE.connect.inset, 'rounded-2xl p-4 space-y-3')}>
                <p className="text-sm text-brand-espresso leading-relaxed">
                  You’ll both stop seeing the shared space. Your own practice, journal and reflections aren’t touched. You can link again any time.
                </p>
                <button type="button" disabled={busy} className={outline} onClick={unlink}>
                  {busy ? 'Unlinking…' : 'Yes, unlink'}
                </button>
                <button type="button" className="press block w-full text-center text-sm font-semibold text-brand-text-secondary"
                  onClick={() => setConfirmUnlink(false)}>
                  Keep us linked
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            <section className={cn(card, 'space-y-3')}>
              <h2 className="section-title">Have their code?</h2>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError(null); }}
                aria-label="Partner's code"
                placeholder="e.g. 3FA9C21B"
                maxLength={16}
                autoCapitalize="characters"
                autoComplete="off"
                className="w-full rounded-xl border border-input bg-popover/70 p-3 font-mono text-lg tracking-widest text-foreground placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {error && <p className="text-sm text-destructive-emphasis" role="alert">{error}</p>}
              <button type="button" disabled={!code.trim() || busy} className={primary} onClick={link}>
                {busy ? 'Linking…' : 'Link us'}
              </button>
            </section>

            <section className={cn(card, 'space-y-3')}>
              <h2 className="section-title">Or send yours</h2>
              {inviteActive && expiresAt ? (
                <>
                  <p className="font-mono text-2xl tracking-[0.3em] text-brand-espresso text-center py-2">{myCode}</p>
                  <p className="text-center text-xs text-brand-text-secondary">
                    Works until {expiresAt.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                  </p>
                  <button type="button" className={outline} onClick={copyInvite}>Copy invite</button>
                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    Only share it with your partner. It works once, for 24 hours, and you can unlink any time.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-brand-espresso leading-relaxed">
                    {hadInvite
                      ? 'Your last invite ran out. Make a new one whenever you’re ready.'
                      : 'Make an invite to send your partner. It works for 24 hours.'}
                  </p>
                  <button type="button" disabled={busy} className={outline} onClick={createInvite}>
                    {busy ? 'Making it…' : hadInvite ? 'Make a new invite' : 'Make an invite'}
                  </button>
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

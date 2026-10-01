import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { cn } from '@/lib/utils';
import {
  FELT_LABELS,
  GOT_IN_THE_WAY_LABELS,
  missionText,
  type Domain,
  type Felt,
  type GotInTheWay,
  type MissionSuggestion,
  type SkillCapacity,
} from '@/lib/missions';

type Experiment = {
  id: string;
  intention: string;
  status: string;
  outcome?: string | null;
  outcome_note?: string | null;
  reason?: string | null; // the user's own words for why it matters
  difficulty_level?: number | null;
  learning?: { felt?: Felt | null; what_got_in_way?: string | null } | null;
};

type Outcome = 'helped' | 'mixed' | 'didnt_help';
type Step = 'ask' | 'tried' | 'identity' | 'not_yet' | 'reshape';

const OUTCOME_LABELS: Record<Outcome, string> = {
  helped: 'It helped',
  mixed: 'Mixed',
  didnt_help: 'Not really',
};

// Contribution (constitution §11D) is offered, never required — "Me & us" is the default.
const DOMAIN_LABELS: Array<[Domain, string]> = [
  ['self', 'Me & us'],
  ['family', 'Family'],
  ['friends', 'Friends'],
  ['work', 'Work'],
  ['community', 'Community'],
];

// "Not now" on an idea is respected for two weeks on this device.
const DECLINED_KEY = 'sparq_declined_missions';
const DECLINE_DAYS = 14;

function readDeclined(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(DECLINED_KEY) || '{}') as Record<string, number>;
    const cutoff = Date.now() - DECLINE_DAYS * 86_400_000;
    return Object.entries(raw).filter(([, at]) => at > cutoff).map(([skill]) => skill);
  } catch {
    return [];
  }
}

function rememberDeclined(skill: string) {
  try {
    const raw = JSON.parse(localStorage.getItem(DECLINED_KEY) || '{}') as Record<string, number>;
    raw[skill] = Date.now();
    localStorage.setItem(DECLINED_KEY, JSON.stringify(raw));
  } catch {
    /* private mode: the idea may come back, which is harmless */
  }
}

const field =
  'w-full rounded-xl border border-brand-border bg-white/70 p-3 text-sm text-brand-espresso placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/30';
const primaryBtn = 'rounded-full bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50';
const quietBtn = 'rounded-full border border-brand-border px-5 py-2 text-sm font-medium text-brand-espresso hover:bg-white/60 disabled:opacity-50';

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm transition-colors',
        active ? 'border-brand-primary bg-brand-primary/10 font-semibold text-brand-hover' : 'border-brand-border text-brand-espresso hover:bg-white/60',
      )}
    >
      {children}
    </button>
  );
}

/**
 * Experiments and Real-World Missions (constitution §5, §9 Days 8–14,
 * v1.2 §11A–§11B). The user picks something small to try out in real life;
 * Sparq comes back to ask what happened — as learning, never a grade — and
 * helps them adapt it. `compact` renders only when a check-in is due (Home).
 */
export function ExperimentsCard({ compact = false }: { compact?: boolean }) {
  const [due, setDue] = useState<Experiment[]>([]);
  const [open, setOpen] = useState<Experiment[]>([]);
  const [recent, setRecent] = useState<Experiment[]>([]);
  const [capacity, setCapacity] = useState<SkillCapacity[]>([]);
  const [suggestion, setSuggestion] = useState<MissionSuggestion | null>(null);
  const [identityLine, setIdentityLine] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [step, setStep] = useState<Step>('ask');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [felt, setFelt] = useState<Felt | null>(null);
  const [note, setNote] = useState('');
  const [envNote, setEnvNote] = useState('');
  const [gotInTheWay, setGotInTheWay] = useState<GotInTheWay | null>(null);
  const [reshaped, setReshaped] = useState('');
  const [triedId, setTriedId] = useState<string | null>(null);

  const [draft, setDraft] = useState('');
  const [draftReason, setDraftReason] = useState('');
  const [draftDomain, setDraftDomain] = useState<Domain>('self');
  const [fromSuggestion, setFromSuggestion] = useState<MissionSuggestion | null>(null);
  const [busy, setBusy] = useState(false);
  const [thanks, setThanks] = useState('');

  const load = useCallback(async () => {
    try {
      const headers = await buildAuthedHeaders();
      const declined = readDeclined();
      const qs = declined.length ? `?declined=${encodeURIComponent(declined.join(','))}` : '';
      const res = await fetch(`/api/experiments${qs}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setDue(data.due || []);
      setOpen(data.open || []);
      setRecent(data.recent || []);
      setCapacity(data.capacity || []);
      setSuggestion(data.suggestion || null);
      setIdentityLine(data.identity_line || null);
    } catch {
      // fail-soft: the card just stays quiet
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetCheckIn() {
    setStep('ask');
    setOutcome(null);
    setFelt(null);
    setNote('');
    setEnvNote('');
    setGotInTheWay(null);
    setReshaped('');
  }

  async function send(method: 'POST' | 'PATCH', body: Record<string, unknown>, url = '/api/experiments'): Promise<boolean> {
    setBusy(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      return res.ok;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function finish(message: string) {
    setThanks(message);
    resetCheckIn();
    await load();
  }

  async function saveTried() {
    if (!current || !outcome) return;
    const ok = await send('PATCH', {
      id: current.id, status: 'tried', outcome, outcome_note: note,
      learning: { felt }, environment_note: envNote,
    });
    if (!ok) return;
    // Identity evidence is only ever linked by the user (§11B).
    if (identityLine && outcome !== 'didnt_help') {
      setTriedId(current.id);
      setStep('identity');
      return;
    }
    await finish('Thank you for trying. That counts, whatever happened. 🦦');
  }

  async function answerIdentity(linked: boolean) {
    if (linked && triedId) {
      await send('POST', { action: 'step', experiment_id: triedId }, '/api/me/identity-evidence');
    }
    setTriedId(null);
    await finish(linked ? "Noted — in your words, not mine. 🦦" : 'Thank you for trying. That counts, whatever happened. 🦦');
  }

  async function saveSetback(action: 'keep' | 'let_go' | 'reshape') {
    if (!current) return;
    const learning = { what_got_in_way: gotInTheWay };
    if (action === 'reshape') {
      if (!reshaped.trim()) return;
      const ok = await send('PATCH', { id: current.id, action: 'revise', intention: reshaped, smaller: gotInTheWay === 'too_big', learning });
      if (ok) await finish("New version saved. I'll check in again in a couple of days. 🦦");
      return;
    }
    const ok = await send('PATCH', action === 'keep'
      ? { id: current.id, status: 'planned', snooze_days: 2, learning }
      : { id: current.id, status: 'let_go', learning });
    if (!ok) return;
    await finish(action === 'keep'
      ? "Okay. That's useful to know. I'll ask again in a couple of days."
      : gotInTheWay === 'not_important_now'
        ? "That's a real answer. I won't bring it back."
        : 'Letting it go is a choice too.');
  }

  async function addExperiment() {
    if ((!draft.trim() && !fromSuggestion) || busy) return;
    const ok = await send('POST', {
      intention: draft,
      reason: draftReason,
      domain: draftDomain,
      ...(fromSuggestion ? {
        from_suggestion: { skill_key: fromSuggestion.skill_key, difficulty_level: fromSuggestion.difficulty_level },
        cue: fromSuggestion.cue,
      } : {}),
    });
    if (!ok) return;
    setDraft('');
    setDraftReason('');
    setDraftDomain('self');
    setFromSuggestion(null);
    setThanks("Saved. Go try it out there — I'll check in with you in a couple of days. 🦦");
    await load();
  }

  function acceptSuggestion(edit: boolean) {
    if (!suggestion) return;
    setFromSuggestion(suggestion);
    setDraft(missionText(suggestion.cue, suggestion.intention));
    if (!edit) setThanks('');
  }

  function declineSuggestion() {
    if (!suggestion) return;
    rememberDeclined(suggestion.skill_key);
    setSuggestion(null);
  }

  const current = due[0];
  if (!loaded || (compact && !current && !thanks)) return null;
  const others = open.filter(e => e.id !== current?.id);
  const learned = recent.filter(e => e.status === 'tried' || e.learning?.what_got_in_way).slice(0, 5);
  const growing = capacity.filter(c => c.easyAtLevel > 0 || c.triedAtLevel > 0);

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
        <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">Out in your life</p>
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
            {/* Their own reason, never a new one from Peter (constitution §5A). */}
            {current.reason && step !== 'identity' && (
              <p className="text-sm text-brand-text-secondary leading-relaxed">
                You said it matters because: <span className="italic text-brand-espresso">&ldquo;{current.reason}&rdquo;</span>
              </p>
            )}

            {step === 'ask' && (
              <>
                <p className="text-sm text-brand-text-secondary">How did it go?</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => setStep('tried')} className={primaryBtn}>I tried it</button>
                  <button type="button" disabled={busy} onClick={() => setStep('not_yet')} className={quietBtn}>It didn&apos;t happen yet</button>
                </div>
              </>
            )}

            {step === 'tried' && (
              <>
                <p className="text-sm text-brand-text-secondary">How did it feel?</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(OUTCOME_LABELS) as Outcome[]).map(key => (
                    <Chip key={key} active={outcome === key} onClick={() => setOutcome(key)}>{OUTCOME_LABELS[key]}</Chip>
                  ))}
                </div>
                <p className="text-sm text-brand-text-secondary">And how hard was it?</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(FELT_LABELS) as Felt[]).map(key => (
                    <Chip key={key} active={felt === key} onClick={() => setFelt(felt === key ? null : key)}>{FELT_LABELS[key]}</Chip>
                  ))}
                </div>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={500}
                  placeholder="What did you notice? (optional)" aria-label="What did you notice?" className={field} />
                <textarea value={envNote} onChange={e => setEnvNote(e.target.value)} rows={2} maxLength={300}
                  placeholder="What made it easier or harder? (optional)" aria-label="What made it easier or harder?" className={field} />
                <button type="button" disabled={!outcome || busy} onClick={saveTried} className={primaryBtn}>Save</button>
              </>
            )}

            {step === 'identity' && identityLine && (
              <>
                <p className="text-sm text-brand-espresso leading-relaxed">
                  You said you want to be <span className="italic">{identityLine.replace(/[.!]+$/, '')}</span>.
                  Did this feel like a step toward that?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => answerIdentity(true)} className={primaryBtn}>Yes, it did</button>
                  <button type="button" disabled={busy} onClick={() => answerIdentity(false)} className={quietBtn}>Not really</button>
                </div>
              </>
            )}

            {step === 'not_yet' && (
              <>
                <p className="text-sm text-brand-text-secondary">That&apos;s information, not failure. What got in the way?</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(GOT_IN_THE_WAY_LABELS) as GotInTheWay[]).map(key => (
                    <Chip key={key} active={gotInTheWay === key} onClick={() => setGotInTheWay(key)}>{GOT_IN_THE_WAY_LABELS[key]}</Chip>
                  ))}
                </div>
                {gotInTheWay === 'not_important_now' && (
                  <button type="button" disabled={busy} onClick={() => saveSetback('let_go')} className={primaryBtn}>Let it go</button>
                )}
                {gotInTheWay && gotInTheWay !== 'not_important_now' && (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busy}
                      onClick={() => { setReshaped(current.intention); setStep('reshape'); }} className={primaryBtn}>
                      {gotInTheWay === 'too_big' ? 'Make it smaller' : gotInTheWay === 'wrong_moment' ? 'Pick a different moment' : 'Change it'}
                    </button>
                    <button type="button" disabled={busy} onClick={() => saveSetback('keep')} className={quietBtn}>Keep it for later</button>
                    <button type="button" disabled={busy} onClick={() => saveSetback('let_go')} className={quietBtn}>Let it go</button>
                  </div>
                )}
              </>
            )}

            {step === 'reshape' && (
              <>
                <p className="text-sm text-brand-text-secondary">
                  {gotInTheWay === 'too_big'
                    ? 'What would a smaller version look like?'
                    : gotInTheWay === 'wrong_moment'
                      ? 'When might a better moment be? "When ___ happens, I\'ll try ___"'
                      : 'Change it however you like.'}
                </p>
                <textarea value={reshaped} onChange={e => setReshaped(e.target.value)} rows={2} maxLength={300}
                  aria-label="Your new version" className={field} />
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy || !reshaped.trim()} onClick={() => saveSetback('reshape')} className={primaryBtn}>Save new version</button>
                  <button type="button" disabled={busy} onClick={() => setStep('not_yet')} className={quietBtn}>Back</button>
                </div>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!compact && (
        <>
          {others.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-text-secondary">Still trying</p>
              {others.map(e => (
                <p key={e.id} className="text-sm text-brand-espresso">&ldquo;{e.intention}&rdquo;</p>
              ))}
            </div>
          )}

          {learned.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-text-secondary">What you learned</p>
              {learned.map(e => (
                <p key={e.id} className="text-sm text-brand-espresso">
                  &ldquo;{e.intention}&rdquo;
                  {e.status === 'tried' && e.outcome && (
                    <span className="text-brand-text-secondary"> · {OUTCOME_LABELS[e.outcome as Outcome]}{e.learning?.felt ? `, ${FELT_LABELS[e.learning.felt].toLowerCase()}` : ''}</span>
                  )}
                  {e.status !== 'tried' && e.learning?.what_got_in_way && e.learning.what_got_in_way in GOT_IN_THE_WAY_LABELS && (
                    <span className="text-brand-text-secondary"> · {GOT_IN_THE_WAY_LABELS[e.learning.what_got_in_way as GotInTheWay].toLowerCase()}</span>
                  )}
                </p>
              ))}
            </div>
          )}

          {/* Progress built only from their own outcomes (constitution §5C tier 2). */}
          {growing.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-text-secondary">What you&apos;re practicing</p>
              {growing.map(c => (
                <p key={c.skill} className="text-sm text-brand-espresso">
                  {c.label} <span className="text-brand-text-secondary">· step {c.level} · tried {c.triedAtLevel}×</span>
                </p>
              ))}
            </div>
          )}

          {/* One idea at most, tied to what THEY said matters (§5A provenance). */}
          {suggestion && !fromSuggestion && open.length === 0 && (
            <div className="rounded-2xl border border-brand-gold/40 bg-brand-gold-soft p-4 space-y-2">
              <p className="text-sm text-brand-text-secondary leading-relaxed">
                {suggestion.kind === 'next_step'
                  ? 'That step has gotten easier for you. Want to try the next one, or stay with it a while?'
                  : suggestion.kind === 'smaller_step'
                    ? 'Want to try a smaller version for now?'
                    : suggestion.because.type === 'north_star'
                      ? <>You said you want to be <span className="italic text-brand-espresso">{suggestion.because.text.replace(/[.!]+$/, '')}</span>. One small idea:</>
                      : <>You said: <span className="italic text-brand-espresso">&ldquo;{suggestion.because.text}&rdquo;</span>. One small idea:</>}
              </p>
              <p className="font-serif text-brand-espresso">{missionText(suggestion.cue, suggestion.intention)}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => acceptSuggestion(false)} className={primaryBtn}>I&apos;ll try this</button>
                <button type="button" onClick={() => acceptSuggestion(true)} className={quietBtn}>Change it</button>
                <button type="button" onClick={declineSuggestion} className={quietBtn}>Not now</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-brand-text-secondary">
              {fromSuggestion ? 'Make it yours — change any words.' : 'Something small you want to try out there?'}
            </p>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2} maxLength={300}
              placeholder="When ___ happens, I'll try ___" aria-label="Something small you want to try" className={field} />
            {draft.trim() && (
              <>
                <textarea value={draftReason} onChange={e => setDraftReason(e.target.value)} rows={2} maxLength={500}
                  placeholder="What makes it worth trying for you? (optional)" aria-label="What makes it worth trying for you?" className={field} />
                <div className="space-y-1">
                  <p className="text-xs text-brand-text-secondary">Who does it reach? (optional)</p>
                  <div className="flex flex-wrap gap-2">
                    {DOMAIN_LABELS.map(([key, label]) => (
                      <Chip key={key} active={draftDomain === key} onClick={() => setDraftDomain(key)}>{label}</Chip>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={!draft.trim() || busy} onClick={addExperiment} className={primaryBtn}>
                Save it
              </button>
              {fromSuggestion && (
                <button type="button" onClick={() => { setFromSuggestion(null); setDraft(''); }} className={quietBtn}>Never mind</button>
              )}
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { Copy, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { toast } from 'sonner';

type RehearsalPhase =
  | 'init'
  | 'abandoned'
  | 'setup'
  | 'confidence_before'
  | 'intensity_dial'
  | 'rehearsal'
  | 'debrief'
  | 'debrief_close'
  | 'close'
  | 'complete';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isPartner?: boolean; // true during rehearsal phase (no avatar, different bubble style)
}

const INTENSITY_OPTIONS = [
  {
    value: 'gentle' as const,
    label: 'Gentle',
    desc: 'Receptive, slightly guarded, low friction',
  },
  {
    value: 'realistic' as const,
    label: 'Realistic',
    desc: 'Distracted, mildly defensive, occasional pushback',
    default: true,
  },
  {
    value: 'challenging' as const,
    label: 'Challenging',
    desc: 'Resistant, deflects, gets defensive under pressure',
  },
];

export default function RehearsalRoom() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [phase, setPhase] = useState<RehearsalPhase>('init');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Setup tracking
  const [setupQuestionIndex, setSetupQuestionIndex] = useState<1 | 2 | 3>(1);
  const [setupMessages, setSetupMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  // Rehearsal tracking
  const [intensityLevel, setIntensityLevel] = useState<'gentle' | 'realistic' | 'challenging'>('realistic');
  const [rehearsalMessages, setRehearsalMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [suggestedClose, setSuggestedClose] = useState(false);
  const [suggestedCloseDismissed, setSuggestedCloseDismissed] = useState(false);

  // Debrief tracking
  const [debriefMessages, setDebriefMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [debriefRound, setDebriefRound] = useState(0);

  // Completion tracking
  const [confidenceBefore, setConfidenceBefore] = useState(0);
  const [confidenceAfter, setConfidenceAfter] = useState(0);
  const [peterAnchor, setPeterAnchor] = useState('');
  const [anchorCopied, setAnchorCopied] = useState(false);

  // Abandoned session state
  const [isAbandonedSession, setIsAbandonedSession] = useState(false);

  const hasInitialized = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Initialize on mount
  useEffect(() => {
    if (hasInitialized.current || !user) return;
    hasInitialized.current = true;
    startSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function startSession() {
    setIsLoading(true);
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const resp = await fetch('/api/peter/rehearsal/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

      if (resp.status === 429) {
        const data = await resp.json();
        // Show rate limit as Peter message, don't advance
        setMessages([{ role: 'assistant', content: data.message }]);
        setPhase('complete'); // Terminal state — can't do more today
        return;
      }

      if (!resp.ok) throw new Error('Start failed');
      const data = await resp.json();

      setSessionId(data.session_id);

      if (data.abandoned) {
        // Show abandoned recovery message
        setIsAbandonedSession(true);
        setMessages([{ role: 'assistant', content: data.peter_message }]);
        setPhase('abandoned');
      } else {
        // Normal start — Q1
        const peterMsg: ChatMessage = { role: 'assistant', content: data.peter_message };
        setMessages([peterMsg]);
        setSetupMessages([{ role: 'assistant', content: data.peter_message }]);
        setPhase('setup');
      }
    } catch {
      toast.error("Couldn't connect to Peter. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendSetupMessage(text: string) {
    if (!text.trim()) return;
    setIsLoading(true);
    setUserInput('');

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    const nextSetupMessages = [...setupMessages, { role: 'user' as const, content: text }];

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const resp = await fetch('/api/peter/rehearsal/message', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          phase: 'setup',
          message: text,
          messages: nextSetupMessages,
          setup_question_index: setupQuestionIndex,
        }),
      });

      if (!resp.ok) throw new Error('Message failed');
      const data = await resp.json();

      const peterMsg: ChatMessage = { role: 'assistant', content: data.peter_message };
      setMessages(prev => [...prev, peterMsg]);

      const updatedSetupMsgs = [...nextSetupMessages, { role: 'assistant' as const, content: data.peter_message }];
      setSetupMessages(updatedSetupMsgs);

      if (data.next_phase === 'intensity_dial') {
        // Setup complete — move to confidence_before
        setPhase('confidence_before');
      } else if (data.answer_accepted) {
        // Advance to next setup question
        setSetupQuestionIndex(prev => Math.min(prev + 1, 3) as 1 | 2 | 3);
      }
      // If not answer_accepted: stay on same question (follow-up)
    } catch {
      toast.error("Peter is having a moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendIntensitySelection(level: 'gentle' | 'realistic' | 'challenging') {
    setIntensityLevel(level);
    setIsLoading(true);

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const resp = await fetch('/api/peter/rehearsal/message', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          phase: 'intensity_selection',
          message: level,
          messages: [],
          intensity_level: level,
        }),
      });

      if (!resp.ok) throw new Error('Message failed');
      const data = await resp.json();

      const peterMsg: ChatMessage = { role: 'assistant', content: data.peter_message };
      setMessages(prev => [...prev, peterMsg]);

      if (data.next_phase === 'rehearsal') {
        setPhase('rehearsal');
      }
    } catch {
      toast.error("Peter is having a moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendRehearsalMessage(text: string) {
    if (!text.trim()) return;
    setIsLoading(true);
    setUserInput('');

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    const nextRehearsalMessages = [...rehearsalMessages, { role: 'user' as const, content: text }];

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const resp = await fetch('/api/peter/rehearsal/message', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          phase: 'rehearsal',
          message: text,
          messages: nextRehearsalMessages,
        }),
      });

      if (resp.status === 200) {
        const data = await resp.json();

        if (data.shouldClose) {
          // Crisis detected during rehearsal
          const peterMsg: ChatMessage = { role: 'assistant', content: data.peter_message };
          setMessages(prev => [...prev, peterMsg]);
          return;
        }

        const peterMsg: ChatMessage = { role: 'assistant', content: data.peter_message, isPartner: true };
        setMessages(prev => [...prev, peterMsg]);

        const updatedRehearsalMsgs = [
          ...nextRehearsalMessages,
          { role: 'assistant' as const, content: data.peter_message },
        ];
        setRehearsalMessages(updatedRehearsalMsgs);

        if (data.suggested_close && !suggestedCloseDismissed) {
          setSuggestedClose(true);
        }
      }
    } catch {
      toast.error("Peter is having a moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function endRehearsal() {
    setSuggestedClose(false);
    setPhase('debrief');
    // Add Peter's "I'm back" message and trigger debrief
    sendDebriefMessage(null);
  }

  async function sendDebriefMessage(userText: string | null) {
    setIsLoading(true);
    if (userText) {
      setUserInput('');
      const userMsg: ChatMessage = { role: 'user', content: userText };
      setMessages(prev => [...prev, userMsg]);
    }

    const nextDebriefMessages = userText
      ? [...debriefMessages, { role: 'user' as const, content: userText }]
      : debriefMessages;

    const isClosingDebrief = debriefRound >= 1 || userText !== null;
    const currentPhase = isClosingDebrief && debriefRound >= 1 ? 'debrief_close' : 'debrief';

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const resp = await fetch('/api/peter/rehearsal/message', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          phase: currentPhase,
          message: userText || '',
          messages: nextDebriefMessages,
        }),
      });

      if (!resp.ok) throw new Error('Debrief failed');
      const data = await resp.json();

      const peterMsg: ChatMessage = { role: 'assistant', content: data.peter_message };
      setMessages(prev => [...prev, peterMsg]);

      const updatedDebriefMsgs = [
        ...nextDebriefMessages,
        { role: 'assistant' as const, content: data.peter_message },
      ];
      setDebriefMessages(updatedDebriefMsgs);

      if (data.next_phase === 'close' && data.peter_anchor) {
        setPeterAnchor(data.peter_anchor);
        setPhase('close');
      } else {
        setDebriefRound(prev => prev + 1);
        if (currentPhase === 'debrief') {
          setPhase('debrief');
        } else {
          setPhase('debrief_close');
        }
      }
    } catch {
      toast.error("Peter is having a moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function completeSession() {
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      await fetch('/api/peter/rehearsal/complete', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          confidence_before: confidenceBefore,
          confidence_after: confidenceAfter,
          peter_anchor: peterAnchor,
        }),
      });
    } catch {
      // Non-blocking — don't surface to user
    }
    setPhase('complete');
  }

  async function copyAnchor() {
    try {
      await navigator.clipboard.writeText(peterAnchor);
      setAnchorCopied(true);
      setTimeout(() => setAnchorCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  }

  if (loading || phase === 'init') {
    return (
      <div className="min-h-screen bg-brand-linen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <PeterAvatar mood="curious" size={64} />
          <p className="text-brand-text-secondary text-sm font-serif italic">Getting ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-linen flex flex-col">
      {/* Rehearsal banner — only during rehearsal phase */}
      <AnimatePresence>
        {phase === 'rehearsal' && (
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -48, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
            style={{ background: 'rgba(181,96,78,0.95)', backdropFilter: 'blur(8px)' }}
          >
            <span className="text-white text-sm font-semibold">Peter is playing your partner</span>
            <button
              onClick={endRehearsal}
              className="text-white/80 text-sm font-medium border border-white/30 rounded-xl px-3 py-1 hover:text-white hover:border-white/60 transition-colors"
            >
              End rehearsal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested close banner */}
      <AnimatePresence>
        {phase === 'rehearsal' && suggestedClose && !suggestedCloseDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-14 left-0 right-0 z-30 flex items-center justify-between px-4 py-2"
            style={{ background: 'rgba(244,240,235,0.96)', borderBottom: '1px solid rgba(181,96,78,0.15)' }}
          >
            <span className="text-brand-text-secondary text-sm font-serif italic">Ready to debrief?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSuggestedCloseDismissed(true)}
                className="text-xs text-brand-text-secondary px-2 py-1"
              >
                Keep going
              </button>
              <button
                onClick={endRehearsal}
                className="text-xs text-brand-primary font-semibold px-3 py-1 rounded-xl bg-brand-primary/10"
              >
                Debrief
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-36 max-w-md mx-auto w-full"
        style={{ paddingTop: phase === 'rehearsal' ? '80px' : '32px' }}
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && !msg.isPartner && (
                <PeterAvatar
                  mood={phase === 'debrief' || phase === 'debrief_close' || phase === 'close' || phase === 'complete' ? 'morning' : 'curious'}
                  size={40}
                />
              )}
              {msg.role === 'assistant' && msg.isPartner && (
                <div className="w-10 h-10 rounded-full bg-brand-parchment border border-brand-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-primary text-sm font-semibold">P</span>
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-primary text-white rounded-tr-sm'
                    : msg.isPartner
                    ? 'bg-amber-50 border border-amber-200 text-brand-espresso rounded-tl-sm'
                    : 'bg-white border border-brand-primary/10 text-brand-espresso rounded-tl-sm font-serif italic'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 mb-4">
            <PeterAvatar mood="curious" size={40} />
            <div className="bg-white border border-brand-primary/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <motion.div className="flex gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-brand-primary"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {/* Abandoned session options */}
        {phase === 'abandoned' && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 mt-4"
          >
            <button
              onClick={() => {
                setIsAbandonedSession(false);
                setPhase('init');
                hasInitialized.current = false;
                setMessages([]);
                startSession();
              }}
              className="w-full p-4 rounded-2xl border-2 border-brand-primary/20 bg-brand-parchment text-brand-espresso font-medium text-left hover:border-brand-primary hover:bg-brand-primary/5 active:scale-[0.98] transition-all"
            >
              Start fresh
            </button>
            <button
              onClick={() => {
                setIsAbandonedSession(false);
                setPhase('init');
                hasInitialized.current = false;
                setMessages([]);
                startSession();
              }}
              className="w-full p-4 rounded-2xl border-2 border-brand-primary/20 bg-brand-parchment text-brand-espresso font-medium text-left hover:border-brand-primary hover:bg-brand-primary/5 active:scale-[0.98] transition-all"
            >
              Different topic
            </button>
          </motion.div>
        )}

        {/* Confidence before — 1–5 tap */}
        {phase === 'confidence_before' && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <p className="text-center text-brand-text-secondary text-sm mb-4 font-serif italic">
              Before we begin — how ready do you feel to have this conversation right now?
            </p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => {
                    setConfidenceBefore(n);
                    setPhase('intensity_dial');
                    const peterMsg: ChatMessage = {
                      role: 'assistant',
                      content: `I'm going to step into your partner's shoes. I won't be perfect — but I'll be real. How much resistance do you want me to bring?`,
                    };
                    setMessages(prev => [...prev, peterMsg]);
                  }}
                  className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                    confidenceBefore === n
                      ? 'bg-brand-primary border-brand-primary text-white'
                      : 'border-brand-primary/30 bg-brand-parchment text-brand-text-primary hover:border-brand-primary hover:bg-brand-primary/10'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Intensity dial */}
        {phase === 'intensity_dial' && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 mt-4"
          >
            {INTENSITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => sendIntensitySelection(opt.value)}
                className="w-full p-4 rounded-2xl border-2 border-brand-primary/20 bg-brand-parchment text-left hover:border-brand-primary hover:bg-brand-primary/5 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-brand-espresso font-semibold text-sm">{opt.label}</span>
                  {opt.default && (
                    <span className="text-xs text-brand-primary font-semibold tracking-widest uppercase">Default</span>
                  )}
                </div>
                <span className="text-brand-text-secondary text-xs">{opt.desc}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Debrief — second turn triggers close */}
        {(phase === 'debrief' || phase === 'debrief_close') && !isLoading && debriefRound >= 1 && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <button
              onClick={() => sendDebriefMessage(null)}
              className="text-sm text-brand-primary font-semibold underline underline-offset-2"
            >
              Get my anchor →
            </button>
          </motion.div>
        )}

        {/* Close phase — confidence after + anchor card */}
        {phase === 'close' && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            {/* Anchor card */}
            {peterAnchor && (
              <div className="bg-white border border-brand-primary/15 rounded-2xl p-5 mb-6 shadow-sm">
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">
                  Your anchor
                </p>
                <p className="text-brand-espresso font-serif italic leading-relaxed mb-4">
                  &ldquo;{peterAnchor}&rdquo;
                </p>
                <button
                  onClick={copyAnchor}
                  className="flex items-center gap-2 text-sm text-brand-primary font-medium"
                >
                  {anchorCopied ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy to clipboard
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Confidence after */}
            {confidenceAfter === 0 && (
              <>
                <p className="text-center text-brand-text-secondary text-sm mb-4 font-serif italic">
                  How ready do you feel now?
                </p>
                <div className="flex justify-center gap-3 mb-6">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setConfidenceAfter(n)}
                      className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                        confidenceAfter === n
                          ? 'bg-brand-primary border-brand-primary text-white'
                          : 'border-brand-primary/30 bg-brand-parchment text-brand-text-primary hover:border-brand-primary hover:bg-brand-primary/10'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </>
            )}

            {confidenceAfter > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-center text-brand-text-secondary text-sm mb-4 font-serif italic">
                  When you&apos;re ready, you&apos;ll know what to say. I&apos;ll check in with you tomorrow.
                </p>
                <button
                  onClick={completeSession}
                  className="w-full bg-brand-primary text-white rounded-2xl py-4 text-base font-semibold"
                >
                  Done
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Complete state */}
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-brand-primary text-white rounded-2xl py-4 text-base font-semibold"
            >
              Back to home
            </button>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar — shown during setup and rehearsal and debrief phases */}
      {(phase === 'setup' || phase === 'rehearsal' || phase === 'debrief' || phase === 'debrief_close') && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-brand-linen border-t border-brand-primary/10 px-4 py-3">
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => {
                if (e.key !== 'Enter' || !userInput.trim()) return;
                if (phase === 'setup') sendSetupMessage(userInput);
                else if (phase === 'rehearsal') sendRehearsalMessage(userInput);
                else if (phase === 'debrief' || phase === 'debrief_close') sendDebriefMessage(userInput);
              }}
              placeholder={
                phase === 'rehearsal'
                  ? 'Say what you came to say...'
                  : 'Type your response...'
              }
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-brand-primary/20 bg-white text-brand-espresso placeholder-brand-text-secondary/50 focus:outline-none focus:border-brand-primary text-sm"
            />
            <button
              onClick={() => {
                if (!userInput.trim()) return;
                if (phase === 'setup') sendSetupMessage(userInput);
                else if (phase === 'rehearsal') sendRehearsalMessage(userInput);
                else if (phase === 'debrief' || phase === 'debrief_close') sendDebriefMessage(userInput);
              }}
              disabled={!userInput.trim()}
              className="bg-brand-primary text-white rounded-2xl px-4 py-3 font-semibold text-sm disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

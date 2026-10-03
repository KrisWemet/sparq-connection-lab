// src/components/onboarding/PeterSession.tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { PeterResponseStatus } from '@/components/peter/PeterResponseStatus';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { supabase } from '@/lib/supabase';
import type { DerivedProfile } from '@/lib/onboarding/types';
import type { PeterMessage } from '@/lib/peterService';

interface PeterSessionProps {
  profile: DerivedProfile;
  onComplete: (updatedProfile: DerivedProfile) => void;
  userId: string;
}

export function PeterSession({ profile, onComplete, userId }: PeterSessionProps) {
  const [messages, setMessages] = useState<PeterMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  // Set once the closing message is saved; the user taps Next when they've read it.
  const [closingProfile, setClosingProfile] = useState<DerivedProfile | null>(null);
  const hasInitialized = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fire the first Peter message on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    sendMessage(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(userText: string | null) {
    if (isClosing) return;
    setIsLoading(true);

    const nextMessages: PeterMessage[] = userText
      ? [...messages, { role: 'user', content: userText }]
      : messages;

    if (userText) {
      setMessages(nextMessages);
      setUserInput('');
    }

    const nextExchangeCount = exchangeCount + 1;

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const resp = await fetch('/api/peter/onboarding', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: nextMessages,
          profile,
          exchangeCount: nextExchangeCount,
        }),
      });

      if (!resp.ok) throw new Error('Peter request failed');

      const { message, shouldClose } = await resp.json();

      setMessages(prev => [...prev, { role: 'assistant', content: message }]);
      setExchangeCount(nextExchangeCount);

      if (shouldClose) {
        setIsClosing(true);
        // Extract just the personalised observation sentence (first line before sign-off).
        // The system prompt instructs Peter to put the closing observation on its own first line
        // followed by "Let me show you where I think we start. 🦦" on the next line.
        const closingObservation = message.split('\n')[0].trim() || message;
        const updatedProfile: DerivedProfile = { ...profile, peterClosingSentence: closingObservation };

        // Second PATCH to psychological_profile to add closing sentence
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            psychological_profile: updatedProfile,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('PeterSession profile save error:', updateError);
        }

        // Wait for the user to tap Next so they can read Peter's closing message.
        setClosingProfile(updatedProfile);
      }
    } catch (err) {
      console.error('PeterSession error:', err);
      setIsClosing(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a moment — give me a second and try again. 🦦",
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  const canSend = userInput.trim().length > 0 && !isLoading && !isClosing && exchangeCount < 5;

  return (
    <div className="emotion-page min-h-dvh bg-brand-linen flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-8 pb-32 max-w-md mx-auto w-full">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && <PeterAvatar mood="curious" size={40} />}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-popover border border-border text-foreground rounded-tl-sm font-serif italic'
                    : 'bg-brand-primary text-white rounded-tr-sm'
                } font-bold`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && <PeterResponseStatus />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {messages.length > 0 && !isLoading && !isClosing && (
        <div className="fixed bottom-0 left-0 right-0 bg-brand-light border-t border-border px-4 py-3">
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSend && sendMessage(userInput)}
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-input bg-popover text-brand-text-primary placeholder:text-muted-foreground focus:outline-none focus:border-ring text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
            <button
              onClick={() => sendMessage(userInput)}
              disabled={!canSend}
              className="press bg-brand-primary text-white rounded-2xl px-4 py-3 font-bold text-sm disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}

      {messages.length > 0 && isClosing && (
        <div className="fixed bottom-0 left-0 right-0 bg-brand-light border-t border-border px-4 py-3">
          <div className="max-w-md mx-auto">
            {closingProfile ? (
              <button
                type="button"
                autoFocus
                onClick={() => onComplete(closingProfile)}
                className="press w-full bg-brand-primary text-white rounded-2xl py-3 font-bold"
              >
                Next →
              </button>
            ) : (
              <p className="text-center text-sm text-brand-text-secondary">One moment…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { PeterResponseStatus } from '@/components/peter/PeterResponseStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Square, Loader2 } from 'lucide-react';
import { PeterMessage } from '@/lib/peterService';
import { stripMarkdown } from '@/lib/strip-markdown';

interface PeterChatProps {
  messages: PeterMessage[];
  onUserMessage: (text: string) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  inputDisabled?: boolean;
}

export function PeterChat({
  messages,
  onUserMessage,
  isLoading = false,
  placeholder = 'Say something to Peter…',
  inputDisabled = false,
}: PeterChatProps) {
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading || inputDisabled || isRecording || isTranscribing) return;
    setInputText('');
    await onUserMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await handleAudioSubmit(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone access denied or error:', err);
        alert('Microphone access is required to send voice notes.');
      }
    }
  };

  const handleAudioSubmit = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'voicenote.webm');

      const res = await fetch('/api/peter/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Transcription failed');
      const data = await res.json();

      // We auto-send the transcribed text with a note that it was transcribed from audio
      // This way Peter knows it was a voice note and can analyze tone markers if any.
      if (data.text) {
        // Auto-send or just fill input? We'll auto-send.
        await onUserMessage(`[Voice Note]: ${data.text}`);
      }
    } catch (err) {
      console.error('Audio processing error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };


  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.role === 'assistant' && <PeterAvatar size={36} state="neutral" />}

              <motion.div
                layout="position"
                className={`max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed relative ${msg.role === 'assistant'
                  ? 'rounded-[20px] rounded-bl-[4px] font-serif'
                  : 'rounded-[20px] rounded-br-[4px] font-sans'
                  }`}
                style={msg.role === 'assistant'
                  ? { backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))' }
                  : { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
                }
              >
                {msg.role === 'assistant' && <span className="sr-only">Peter: </span>}
                {msg.role === 'assistant' ? stripMarkdown(msg.content) : msg.content}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {(isLoading || isTranscribing) && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          >
            {isTranscribing ? (
              <div className="flex items-end gap-3 flex-row-reverse">
                <div className="bg-muted text-muted-foreground rounded-[20px] rounded-br-[4px] px-4 py-2.5 text-[15px] flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-brand-text-secondary" /> Turning your voice into words...
                </div>
              </div>
            ) : (
              <PeterResponseStatus />
            )}
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!inputDisabled && (
        <form
          onSubmit={handleSubmit}
          className="bg-popover/80 backdrop-blur-xl border-t border-border px-4 py-3 flex gap-2 items-end relative"
        >
          {isRecording ? (
            <div className="flex-1 flex items-center justify-center gap-3 h-10 bg-destructive-subtle text-destructive-emphasis rounded-full px-4 border border-destructive">
              <motion.div
                className="w-2.5 h-2.5 bg-destructive rounded-full"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-sm font-medium">Listening...</span>
            </div>
          ) : (
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label="Message Peter"
              rows={1}
              disabled={isLoading || isTranscribing}
              className="min-w-0 flex-1 resize-none rounded-2xl bg-popover border border-border px-4 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring disabled:opacity-50 max-h-32 overflow-y-auto shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border-input"
              style={{ lineHeight: '1.4' }}
            />
          )}

          <button
            type="button"
            onClick={toggleRecording}
            aria-label={isRecording ? 'Stop recording' : 'Record a voice note'}
            disabled={isLoading || isTranscribing}
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors shadow-sm ${isRecording
              ? 'bg-destructive text-white hover:bg-destructive'
              : 'bg-popover text-brand-text-secondary hover:bg-background hover:text-foreground border border-border'
              }`}
          >
            {isRecording ? <Square size={16} fill="white" /> : <Mic size={18} strokeWidth={2.5} />}
          </button>

          {!isRecording && (
            <button
              type="submit"
              aria-label="Send message"
              disabled={!inputText.trim() || isLoading || isTranscribing}
              className="w-11 h-11 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-brand-hover transition-colors shadow-sm font-bold"
            >
              <Send size={16} className={inputText.trim() ? "translate-x-[-1px] translate-y-[1px]" : ""} />
            </button>
          )}
        </form>
      )}
    </div>
  );
}

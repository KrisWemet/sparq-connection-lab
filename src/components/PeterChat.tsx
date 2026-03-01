import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { PeterMessage } from '@/lib/peterService';

interface PeterChatProps {
  messages: PeterMessage[];
  onUserMessage: (text: string) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  inputDisabled?: boolean;
  /** Quick-reply chips shown above the input. Tapping one sends it as a message. */
  quickReplies?: string[];
}

function PeterAvatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white text-xl flex-shrink-0 shadow-md">
      🦦
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <PeterAvatar />
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-teal-400 rounded-full"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PeterChat({
  messages,
  onUserMessage,
  isLoading = false,
  placeholder = 'Say something to Peter…',
  inputDisabled = false,
  quickReplies = [],
}: PeterChatProps) {
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading || inputDisabled) return;
    setInputText('');
    await onUserMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.role === 'assistant' && <PeterAvatar />}

              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-white border border-gray-100 rounded-bl-sm text-gray-800'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <TypingIndicator />
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick-reply chips */}
      {!inputDisabled && quickReplies.length > 0 && !isLoading && (
        <div className="px-4 py-2 bg-gray-50/80 border-t border-gray-100 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <motion.button
              key={reply}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                if (!isLoading && !inputDisabled) {
                  onUserMessage(reply);
                }
              }}
              className="px-3 py-1.5 text-sm font-medium rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors shadow-sm"
            >
              {reply}
            </motion.button>
          ))}
        </div>
      )}

      {/* Input */}
      {!inputDisabled && (
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-100 bg-white px-4 py-3 flex gap-3 items-end"
        >
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send size={16} />
          </button>
        </form>
      )}
    </div>
  );
}

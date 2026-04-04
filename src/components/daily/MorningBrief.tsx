import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

interface MorningBriefProps {
  morningAction: string;
  peterBrief: string;
  journeyTitle?: string | null;
  currentDay: number;
  onReady: (triggerMoment: string) => void;
}

const TRIGGER_OPTIONS = [
  'At dinner tonight',
  'On my commute home',
  'During a quiet moment',
  'When I feel tension rise',
  'Before bed tonight',
  'First thing tomorrow morning',
];

type Screen = 'why' | 'what' | 'when';

const SCREEN_ORDER: Screen[] = ['why', 'what', 'when'];

export function MorningBrief({
  morningAction,
  peterBrief,
  journeyTitle,
  currentDay,
  onReady,
}: MorningBriefProps) {
  const [screen, setScreen] = useState<Screen>('why');
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [customTrigger, setCustomTrigger] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const screenIndex = SCREEN_ORDER.indexOf(screen);
  const triggerMoment = selectedTrigger === '__custom__' ? customTrigger.trim() : selectedTrigger;
  const canProceed = triggerMoment.length > 0;

  return (
    <div className="min-h-screen bg-brand-linen pb-28 font-sans">
      <div className="max-w-lg mx-auto px-5 pt-8 space-y-8">

        {/* ── Progress dots + day label ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
            {journeyTitle ? `${journeyTitle} · Day ${currentDay}` : `Day ${currentDay}`}
          </span>
          <div className="flex gap-2 items-center">
            {SCREEN_ORDER.map((s, i) => (
              <div
                key={s}
                className={`rounded-full transition-all duration-300 ${
                  i === screenIndex
                    ? 'w-4 h-2 bg-brand-primary'
                    : i < screenIndex
                    ? 'w-2 h-2 bg-brand-primary/50'
                    : 'w-2 h-2 bg-brand-primary/20'
                }`}
              />
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── SCREEN 1: Why — Peter's coaching brief ── */}
          {screen === 'why' && (
            <motion.div
              key="why"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {/* Peter — no container, directly on linen */}
              <div className="flex flex-col items-center gap-5 pt-2">
                <PeterAvatar mood="morning" size={72} />
                <p className="font-serif italic text-brand-espresso text-xl leading-relaxed text-center max-w-sm">
                  {peterBrief}
                </p>
              </div>

              {/* Organic blur accent */}
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
              </div>

              <button
                onClick={() => setScreen('what')}
                className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 text-base"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ── SCREEN 2: What — The practice ── */}
          {screen === 'what' && (
            <motion.div
              key="what"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
                  Today&apos;s practice
                </p>

                {/* Action card — warm clay background */}
                <div className="relative bg-brand-primary rounded-3xl p-6 overflow-hidden">
                  {/* Organic blur shapes */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                  <p className="relative font-serif italic text-white text-xl leading-snug">
                    {morningAction}
                  </p>
                </div>

                <p className="text-sm text-[#5B4A86] text-center leading-relaxed">
                  This is for you. Your partner doesn&apos;t need to be involved.
                </p>
              </div>

              <button
                onClick={() => setScreen('when')}
                className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 text-base"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ── SCREEN 3: When — The trigger ── */}
          {screen === 'when' && (
            <motion.div
              key="when"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <p className="font-serif italic text-brand-espresso text-xl text-center leading-relaxed">
                When will this moment show up today?
              </p>

              <div className="flex flex-col gap-2.5">
                {TRIGGER_OPTIONS.map((option) => {
                  const isSelected = selectedTrigger === option;
                  return (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedTrigger(option);
                        setShowCustomInput(false);
                        setCustomTrigger('');
                      }}
                      className={`w-full px-4 py-3.5 rounded-2xl border-2 text-left font-medium text-[15px] transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary/8 text-brand-espresso'
                          : 'border-brand-primary/20 bg-brand-parchment text-brand-espresso hover:border-brand-primary/50 hover:bg-brand-primary/5'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'border-brand-primary bg-brand-primary' : 'border-brand-primary/30'
                      }`}>
                        {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      {option}
                    </motion.button>
                  );
                })}

                {/* Write your own */}
                {!showCustomInput ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowCustomInput(true);
                      setSelectedTrigger('__custom__');
                    }}
                    className={`w-full px-4 py-3.5 rounded-2xl border-2 text-left font-medium text-[15px] transition-all flex items-center gap-3 ${
                      selectedTrigger === '__custom__'
                        ? 'border-brand-primary bg-brand-primary/8 text-brand-espresso'
                        : 'border-brand-primary/20 bg-brand-parchment text-[#5B4A86] hover:border-brand-primary/50 hover:bg-brand-primary/5'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-brand-primary/30 flex-shrink-0" />
                    Write your own moment...
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-parchment rounded-2xl border-2 border-brand-primary px-4 py-3.5 flex items-center gap-3"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-brand-primary bg-brand-primary flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                    <input
                      type="text"
                      value={customTrigger}
                      onChange={(e) => setCustomTrigger(e.target.value)}
                      placeholder="Describe your moment..."
                      className="flex-1 bg-transparent text-brand-espresso text-[15px] placeholder:text-[#5B4A86]/50 focus:outline-none font-medium"
                      autoFocus
                    />
                  </motion.div>
                )}
              </div>

              <motion.button
                animate={{ opacity: canProceed ? 1 : 0.45 }}
                transition={{ duration: 0.25 }}
                onClick={() => canProceed && onReady(triggerMoment)}
                disabled={!canProceed}
                className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors disabled:cursor-not-allowed text-base"
              >
                I&apos;m ready
              </motion.button>

              <p className="text-xs text-[#5B4A86]/60 text-center leading-relaxed">
                Peter will ask about this moment tonight.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

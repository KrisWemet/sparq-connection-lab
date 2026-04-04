// src/components/onboarding/QuestionFlow.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { QUESTIONS } from '@/lib/onboarding/questions';
import { INITIAL_SCORES } from '@/lib/onboarding/types';
import type { OnboardingProgress, RawScores, QuestionOption } from '@/lib/onboarding/types';

const STORAGE_KEY = 'sparq_onboarding_progress';
const BRIDGE_DELAY_MS = 1500;

function interpolate(text: string, firstName: string, partnerName: string | null): string {
  return text
    .replace(/\{firstName\}/g, firstName)
    .replace(/\{partnerName\}/g, partnerName ?? 'your partner');
}

function getPeterText(
  question: typeof QUESTIONS[number],
  firstName: string,
  partnerName: string | null,
): string {
  if (typeof question.peterText === 'function') {
    return question.peterText({ firstName, partnerName });
  }
  return interpolate(question.peterText, firstName, partnerName);
}

interface QuestionFlowProps {
  initialProgress?: OnboardingProgress | null;
  onComplete: (progress: OnboardingProgress) => void;
}

const EMPTY_PROGRESS: OnboardingProgress = {
  answers: {},
  freeTextAnswers: {},
  scores: { ...INITIAL_SCORES },
  lastQuestionIndex: 0,
  firstName: '',
  ageRange: '',
  pronouns: '',
  relationshipStatus: '',
  partnerName: null,
  relationshipLength: null,
  partnerUsing: null,
  loveLanguage: '',
  conflictStyle: '',
  lifeContext: '',
  checkInFrequency: '',
  growthGoal: '',
};

export function QuestionFlow({ initialProgress, onComplete }: QuestionFlowProps) {
  const [progress, setProgress] = useState<OnboardingProgress>(initialProgress ?? EMPTY_PROGRESS);
  const [currentIndex, setCurrentIndex] = useState(initialProgress?.lastQuestionIndex ?? 0);
  const [textInput, setTextInput] = useState('');
  const [multiPartState, setMultiPartState] = useState<{ ageRange?: string; pronouns?: string }>({});
  const [activeBridge, setActiveBridge] = useState<string | null>(null);
  const [isBridging, setIsBridging] = useState(false);
  // For Q3: partner name inline input
  const [partnerNameInput, setPartnerNameInput] = useState('');
  const [awaitingPartnerName, setAwaitingPartnerName] = useState(false);
  // For Q14: awaiting frequency after growth goal
  const [growthGoalSubmitted, setGrowthGoalSubmitted] = useState(false);

  const question = QUESTIONS[currentIndex];

  // Persist to localStorage on every progress change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...progress, lastQuestionIndex: currentIndex }));
  }, [progress, currentIndex]);

  function applyScoreDeltas(scores: RawScores, deltas: Partial<RawScores> | undefined): RawScores {
    if (!deltas) return scores;
    const next = { ...scores };
    for (const [key, val] of Object.entries(deltas) as [keyof RawScores, number][]) {
      next[key] = (next[key] ?? 0) + val;
    }
    return next;
  }

  function playBridge(bridgeText: string, then: () => void) {
    setActiveBridge(bridgeText);
    setIsBridging(true);
    setTimeout(() => {
      setActiveBridge(null);
      setIsBridging(false);
      then();
    }, BRIDGE_DELAY_MS);
  }

  function advanceQuestion(updatedProgress: OnboardingProgress) {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= QUESTIONS.length) {
      onComplete({ ...updatedProgress, lastQuestionIndex: nextIndex });
    } else {
      setCurrentIndex(nextIndex);
      setProgress(updatedProgress);
      setTextInput('');
      setMultiPartState({});
      setPartnerNameInput('');
      setAwaitingPartnerName(false);
      setGrowthGoalSubmitted(false);
    }
  }

  function handleOptionSelect(option: QuestionOption, updatedFields?: Partial<OnboardingProgress>) {
    if (isBridging) return;

    const newProgress: OnboardingProgress = {
      ...progress,
      scores: applyScoreDeltas(progress.scores, option.scoreDeltas),
      answers: { ...progress.answers, [currentIndex]: option.label },
      ...updatedFields,
    };

    if (option.sets) {
      (newProgress as unknown as Record<string, unknown>)[option.sets.field] = option.sets.value;
    }

    playBridge(option.bridge, () => advanceQuestion(newProgress));
  }

  function handleFreeTextSubmit(text: string, fieldOverride?: keyof OnboardingProgress) {
    if (!text.trim()) return;
    const field = fieldOverride ?? question.captures[0];
    const newProgress: OnboardingProgress = {
      ...progress,
      freeTextAnswers: { ...progress.freeTextAnswers, [currentIndex]: text.trim() },
      answers: { ...progress.answers, [currentIndex]: text.trim() },
      ...(field ? { [field]: text.trim() } : {}),
    };
    playBridge("I appreciate you putting that into your own words.", () => advanceQuestion(newProgress));
  }

  function handleBack() {
    if (currentIndex === 0) return;
    const prevIndex = currentIndex - 1;
    // Clear the answer at prevIndex so the user starts fresh at that question.
    // Then replay scores for all answers before prevIndex.
    let replayedScores = { ...INITIAL_SCORES };
    for (let i = 0; i < prevIndex; i++) {
      const q = QUESTIONS[i];
      const answer = progress.answers[i];
      if (answer && q.options) {
        const opt = q.options.find(o => o.label === answer);
        if (opt?.scoreDeltas) replayedScores = applyScoreDeltas(replayedScores, opt.scoreDeltas);
      }
    }
    setProgress(prev => {
      const updatedAnswers = { ...prev.answers };
      delete updatedAnswers[prevIndex];
      const updatedFreeText = { ...prev.freeTextAnswers };
      delete updatedFreeText[prevIndex];
      return { ...prev, scores: replayedScores, answers: updatedAnswers, freeTextAnswers: updatedFreeText };
    });
    setCurrentIndex(prevIndex);
    setTextInput('');
    setActiveBridge(null);
    setIsBridging(false);
  }

  const peterText = getPeterText(question, progress.firstName, progress.partnerName);
  const showBack = currentIndex > 0 && !isBridging;

  return (
    <div className="min-h-screen bg-brand-linen">
      <div className="container max-w-md mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="w-full mb-6">
          <div className="h-1 w-full rounded-full" style={{ backgroundColor: '#EDE9FE' }}>
            <motion.div
              className="h-1 rounded-full"
              style={{ backgroundColor: '#8B5CF6' }}
              animate={{ width: `${((currentIndex) / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
          <p className="mt-1.5 text-xs text-[#5B4A86]">
            {currentIndex + 1} of {QUESTIONS.length}
          </p>
        </div>

        {/* Peter avatar + question bubble */}
        <div className="flex items-start gap-3 mb-6">
          <PeterAvatar mood="curious" size={48} />
          <div
            className="flex-1 bg-white rounded-2xl rounded-tl-sm p-4 text-[#1f2937] text-[15px] leading-relaxed font-serif italic"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {peterText}
          </div>
        </div>

        {/* Bridge message */}
        <AnimatePresence>
          {activeBridge && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 mb-6"
            >
              <PeterAvatar mood="celebrating" size={48} />
              <div
                className="flex-1 bg-white rounded-2xl rounded-tl-sm p-4 text-[#1f2937] text-[14px] leading-relaxed"
                style={{ border: '1px solid #e5e7eb' }}
              >
                {activeBridge}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Q1: text input */}
        {question.index === 0 && !isBridging && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Your first name..."
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#8B5CF6]/20 bg-[#EDE9FE] text-[#2E1065] placeholder-[#5B4A86]/50 focus:outline-none focus:border-[#8B5CF6] transition-colors text-base"
              onKeyDown={e => e.key === 'Enter' && textInput.trim() && handleFreeTextSubmit(textInput, 'firstName')}
              autoFocus
            />
            <button
              disabled={textInput.trim().length < 1}
              onClick={() => handleFreeTextSubmit(textInput, 'firstName')}
              className="w-full bg-[#8B5CF6] text-white rounded-2xl py-3 font-semibold disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Q2: multi-part age + pronouns */}
        {question.index === 1 && !isBridging && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#8B5CF6] mb-2">How old are you?</p>
              <div className="flex flex-col gap-2">
                {['Under 25', '25–34', '35–44', '45+'].map(label => (
                  <button
                    key={label}
                    onClick={() => setMultiPartState(s => ({ ...s, ageRange: label }))}
                    className={`w-full p-3 rounded-2xl border-2 text-left text-sm font-medium transition-all ${
                      multiPartState.ageRange === label
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#2E1065]'
                        : 'border-[#8B5CF6]/20 bg-[#EDE9FE] text-[#2E1065]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#8B5CF6] mb-2">Your pronouns</p>
              <div className="flex flex-col gap-2">
                {['She / Her', 'He / Him', 'They / Them'].map(label => (
                  <button
                    key={label}
                    onClick={() => setMultiPartState(s => ({ ...s, pronouns: label.toLowerCase().replace(' / ', '/') }))}
                    className={`w-full p-3 rounded-2xl border-2 text-left text-sm font-medium transition-all ${
                      multiPartState.pronouns === label.toLowerCase().replace(' / ', '/')
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#2E1065]'
                        : 'border-[#8B5CF6]/20 bg-[#EDE9FE] text-[#2E1065]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="Something else..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#8B5CF6]/20 bg-[#EDE9FE] text-[#2E1065] text-sm focus:outline-none focus:border-[#8B5CF6]"
                  onChange={e => e.target.value && setMultiPartState(s => ({ ...s, pronouns: e.target.value }))}
                />
              </div>
            </div>
            <button
              disabled={!multiPartState.ageRange || !multiPartState.pronouns}
              onClick={() => {
                if (!multiPartState.ageRange || !multiPartState.pronouns) return;
                const ageMap: Record<string, string> = { 'Under 25': 'under-25', '25–34': '25-34', '35–44': '35-44', '45+': '45-plus' };
                const newProgress: OnboardingProgress = {
                  ...progress,
                  ageRange: ageMap[multiPartState.ageRange] ?? multiPartState.ageRange,
                  pronouns: multiPartState.pronouns,
                  answers: { ...progress.answers, [1]: `${multiPartState.ageRange} / ${multiPartState.pronouns}` },
                };
                playBridge("Good to know. Let's keep going.", () => advanceQuestion(newProgress));
              }}
              className="w-full bg-[#8B5CF6] text-white rounded-2xl py-3 font-semibold disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Q3: relationship status + conditional partner name */}
        {question.index === 2 && !isBridging && !awaitingPartnerName && (
          <div className="flex flex-col gap-2">
            {question.options?.filter(o => !o.isFreeText).map(option => (
              <button
                key={option.label}
                onClick={() => {
                  if (option.sets?.value === 'complicated') {
                    handleOptionSelect(option, { partnerName: null, relationshipLength: null, partnerUsing: null });
                  } else {
                    // Show bridge first, then reveal partner name input after it clears
                    setProgress(p => ({ ...p, relationshipStatus: option.sets?.value ?? '' }));
                    setActiveBridge(option.bridge);
                    setTimeout(() => { setActiveBridge(null); setAwaitingPartnerName(true); }, BRIDGE_DELAY_MS);
                  }
                }}
                className="w-full p-4 rounded-2xl border-2 border-[#8B5CF6]/20 bg-[#EDE9FE] text-[#2E1065] text-left text-sm font-medium hover:border-[#8B5CF6]"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {question.index === 2 && !isBridging && awaitingPartnerName && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold tracking-widest uppercase text-[#8B5CF6]">
              Partner&apos;s name
            </label>
            <input
              autoFocus
              type="text"
              value={partnerNameInput}
              onChange={e => setPartnerNameInput(e.target.value)}
              placeholder="What should we call them?"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#8B5CF6]/20 bg-[#EDE9FE] text-[#2E1065] placeholder-[#5B4A86]/50 focus:outline-none focus:border-[#8B5CF6] transition-colors text-base"
            />
            <button
              disabled={partnerNameInput.trim().length < 1}
              onClick={() => {
                const newProgress: OnboardingProgress = {
                  ...progress,
                  partnerName: partnerNameInput.trim(),
                  answers: { ...progress.answers, [2]: `${progress.relationshipStatus} / ${partnerNameInput.trim()}` },
                };
                advanceQuestion(newProgress);
              }}
              className="w-full bg-[#8B5CF6] text-white rounded-2xl py-3 font-semibold disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Q14: growth goal free text + check-in frequency */}
        {question.index === 13 && !isBridging && !growthGoalSubmitted && (
          <div className="flex flex-col gap-3">
            <textarea
              rows={3}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Type anything that comes to mind..."
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#8B5CF6]/20 bg-[#EDE9FE] text-[#2E1065] placeholder-[#5B4A86]/50 focus:outline-none focus:border-[#8B5CF6] transition-colors text-base resize-none"
            />
            <button
              disabled={textInput.trim().length < 3}
              onClick={() => {
                setProgress(p => ({
                  ...p,
                  growthGoal: textInput.trim(),
                  freeTextAnswers: { ...p.freeTextAnswers, [13]: textInput.trim() },
                }));
                // Bridge first, then show frequency buttons after it clears
                playBridge("That matters. Hold onto that — it's exactly why you're here.", () => {
                  setGrowthGoalSubmitted(true);
                });
              }}
              className="w-full bg-[#8B5CF6] text-white rounded-2xl py-3 font-semibold disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {question.index === 13 && !isBridging && growthGoalSubmitted && (
          <div className="flex flex-col gap-3">
            <p className="text-[#5B4A86] text-sm font-serif italic mb-2">
              Got it. How often would you like to check in with me?
            </p>
            {question.options?.map(option => (
              <button
                key={option.label}
                onClick={() => handleOptionSelect(option)}
                className="w-full p-4 rounded-2xl border-2 border-[#8B5CF6]/20 bg-[#EDE9FE] text-[#2E1065] text-left text-sm font-medium hover:border-[#8B5CF6]"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Standard quick-reply questions (Q4–Q13 except Q14) */}
        {question.inputType === 'quick-reply' && question.index >= 3 && question.index <= 12 && !isBridging && (
          <div className="flex flex-col gap-2">
            {question.options?.map(option => (
              <button
                key={option.label}
                onClick={() => {
                  if (option.isFreeText) {
                    setTextInput('__freetext__');
                  } else {
                    handleOptionSelect(option);
                  }
                }}
                className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-medium transition-all ${
                  option.isFreeText
                    ? 'border-dashed border-[#8B5CF6]/30 bg-transparent text-[#5B4A86] text-xs italic'
                    : 'border-[#8B5CF6]/20 bg-[#EDE9FE] text-[#2E1065] hover:border-[#8B5CF6]'
                }`}
              >
                {option.label}
              </button>
            ))}
            {/* Free-text input for "write my own" */}
            {textInput === '__freetext__' && (
              <div className="flex flex-col gap-2 mt-2">
                <textarea
                  rows={2}
                  autoFocus
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#8B5CF6]/20 bg-[#EDE9FE] text-[#2E1065] placeholder-[#5B4A86]/50 focus:outline-none focus:border-[#8B5CF6] text-sm resize-none"
                  onChange={e => setTextInput(e.target.value === '' ? '__freetext__' : e.target.value)}
                />
                <button
                  disabled={textInput === '__freetext__' || (textInput as string).trim().length < 2}
                  onClick={() => handleFreeTextSubmit(textInput)}
                  className="w-full bg-[#8B5CF6] text-white rounded-2xl py-3 font-semibold disabled:opacity-40 text-sm"
                >
                  Continue →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back button */}
        {showBack && (
          <button
            onClick={handleBack}
            className="mt-6 text-[#5B4A86] text-sm font-medium px-2 py-1"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

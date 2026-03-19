
import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Crown, Star, Lightbulb, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PeterLoading } from '@/components/PeterLoading';
import { saveJourneyProgress } from '@/services/journeyContentService';

type ConceptItem = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  example: string;
};

type CompletionCriteria = {
  requireConceptSelection?: boolean;
  requireReflection?: boolean;
  minReflectionLength?: number;
  requireActivity?: boolean;
};

interface JourneyContentViewProps {
  journeyId: string;
  title?: string;
  totalDays?: number;
  conceptItems?: ConceptItem[];
  completionCriteria?: CompletionCriteria;
}

// ── Day content generation from concept items ──────────────────────────────

interface GeneratedDay {
  number: number;
  title: string;
  conceptTitle: string;
  conceptDescription: string;
  conceptIcon: ReactNode;
  learning: string;
  whyItMatters: string;
  activity: {
    title: string;
    instructions: string;
    reflectionQuestions: string[];
  };
}

function generateDayContent(concepts: ConceptItem[], totalDays: number): GeneratedDay[] {
  const days: GeneratedDay[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const conceptIdx = (d - 1) % concepts.length;
    const concept = concepts[conceptIdx];
    const cycle = Math.floor((d - 1) / concepts.length);

    // Each cycle through the concepts goes deeper
    const depthLabels = ['Discover', 'Practice', 'Deepen', 'Master', 'Integrate'];
    const depthLabel = depthLabels[Math.min(cycle, depthLabels.length - 1)];

    const day: GeneratedDay = {
      number: d,
      title: `${depthLabel}: ${concept.title}`,
      conceptTitle: concept.title,
      conceptDescription: concept.description,
      conceptIcon: concept.icon,
      learning: getLearningContent(concept, cycle),
      whyItMatters: getWhyItMatters(concept, cycle),
      activity: {
        title: getActivityTitle(concept, cycle),
        instructions: getActivityInstructions(concept, cycle),
        reflectionQuestions: getReflectionQuestions(concept, cycle),
      },
    };

    days.push(day);
  }

  return days;
}

function getLearningContent(concept: ConceptItem, cycle: number): string {
  const base = concept.description;
  const example = concept.example;

  if (cycle === 0) {
    return `Today we explore **${concept.title}** — ${base.toLowerCase()}.\n\n${example}\n\nThis is one of the foundational skills that strong relationships are built on. You don't need to master it today — just begin to notice how it shows up in your life.`;
  }
  if (cycle === 1) {
    return `Welcome back to **${concept.title}**. Now that you've been introduced to this concept, it's time to practice it more intentionally.\n\n${example}\n\nToday, focus on one specific moment where you can apply this skill. Small, consistent practice creates lasting change.`;
  }
  if (cycle === 2) {
    return `You've been working with **${concept.title}** for a while now. Today we go deeper — looking at the patterns underneath.\n\n${base}. Notice not just what happens, but what you feel when you practice this. What comes up for you emotionally?`;
  }
  return `You've developed real familiarity with **${concept.title}**. Today is about integration — making this a natural part of how you relate.\n\n${base}. At this stage, it's less about doing it perfectly and more about doing it authentically.`;
}

function getWhyItMatters(concept: ConceptItem, cycle: number): string {
  if (cycle === 0) {
    return `Research shows that couples who develop skills in ${concept.title.toLowerCase()} report significantly higher relationship satisfaction. This isn't about perfection — it's about showing up with intention.`;
  }
  if (cycle === 1) {
    return `Practice makes this feel natural over time. The couples who thrive aren't the ones who never struggle with ${concept.title.toLowerCase()} — they're the ones who keep practicing.`;
  }
  return `At this depth, you're building the kind of relational skill that transforms not just your romantic relationship, but all your important connections. This is identity-level growth.`;
}

function getActivityTitle(concept: ConceptItem, cycle: number): string {
  const labels = ['Introduction Exercise', 'Practice Exercise', 'Deep Dive Exercise', 'Integration Exercise', 'Mastery Exercise'];
  return `${concept.title}: ${labels[Math.min(cycle, labels.length - 1)]}`;
}

function getActivityInstructions(concept: ConceptItem, cycle: number): string {
  if (cycle === 0) {
    return `**Step 1:** Take a quiet moment (2-3 minutes) and think about ${concept.title.toLowerCase()} in your relationship. When does it show up naturally? When is it missing?\n\n**Step 2:** Share one observation with your partner. Keep it simple — "I noticed that..." or "I've been thinking about..."\n\n**Step 3:** Listen to their response without planning what to say next. Just receive it.`;
  }
  if (cycle === 1) {
    return `**Step 1:** Choose one specific moment today where you will intentionally practice ${concept.title.toLowerCase()}.\n\n**Step 2:** Before the moment, set a quiet intention: "I'm going to focus on ${concept.title.toLowerCase()} right now."\n\n**Step 3:** Afterward, notice what happened. What felt different? What was harder than expected? What surprised you?`;
  }
  if (cycle === 2) {
    return `**Step 1:** Have a 5-minute conversation with your partner about ${concept.title.toLowerCase()}. Ask them: "How do you experience this in our relationship?"\n\n**Step 2:** Share your own experience — not to correct or compare, but to deepen understanding.\n\n**Step 3:** Together, identify one small thing you could both do differently this week.`;
  }
  return `**Step 1:** Reflect on how far you've come with ${concept.title.toLowerCase()} since you started this journey. What has shifted?\n\n**Step 2:** Write a brief note to your partner about what you've learned. It can be one sentence.\n\n**Step 3:** Discuss: How do we want to keep growing in this area together?`;
}

function getReflectionQuestions(concept: ConceptItem, cycle: number): string[] {
  if (cycle === 0) {
    return [
      `What did you notice about ${concept.title.toLowerCase()} in your relationship today?`,
      `On a scale of 1-10, how comfortable do you feel with this concept? What would move you one point higher?`,
      `What's one small thing you could try tomorrow related to ${concept.title.toLowerCase()}?`,
    ];
  }
  if (cycle === 1) {
    return [
      `Describe the specific moment you practiced ${concept.title.toLowerCase()} today. What happened?`,
      `What felt natural about it? What felt difficult or awkward?`,
      `How did your partner respond? What did you notice in their reaction?`,
    ];
  }
  if (cycle === 2) {
    return [
      `What did your partner share about their experience with ${concept.title.toLowerCase()} that surprised you?`,
      `Where do you see growth in yourself around this concept? Be specific.`,
      `What would it look like if this skill became effortless for both of you?`,
    ];
  }
  return [
    `How has your understanding of ${concept.title.toLowerCase()} evolved since you started this journey?`,
    `What has this practice taught you about yourself as a partner?`,
    `What commitment are you making to yourself and your partner going forward?`,
  ];
}

// ── Component ──────────────────────────────────────────────────────────────

export function JourneyContentView({
  journeyId,
  title,
  totalDays = 14,
  conceptItems,
  completionCriteria,
}: JourneyContentViewProps) {
  const router = useRouter();
  const [currentDay, setCurrentDay] = useState(1);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const progress = (currentDay / totalDays) * 100;

  const days = conceptItems ? generateDayContent(conceptItems, totalDays) : [];
  const currentDayContent = days.find(d => d.number === currentDay);

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
      setResponses({});
      setValidationError(null);
    }
  };

  const validateCompletion = (): boolean => {
    if (!completionCriteria) return true;

    if (completionCriteria.requireReflection) {
      const hasAnyResponse = Object.values(responses).some(r => r.trim().length > 0);
      if (!hasAnyResponse) {
        setValidationError('Take a moment to answer at least one reflection question before continuing.');
        return false;
      }
    }

    if (completionCriteria.minReflectionLength) {
      const totalLength = Object.values(responses).reduce((sum, r) => sum + r.trim().length, 0);
      if (totalLength < completionCriteria.minReflectionLength) {
        setValidationError(`Try to write a bit more — even a few sentences helps deepen the practice.`);
        return false;
      }
    }

    return true;
  };

  const handleNextDay = async () => {
    if (!validateCompletion()) return;
    setValidationError(null);

    await saveJourneyProgress(journeyId, currentDay, true, responses);

    if (currentDay >= totalDays) {
      setCompleted(true);
    } else {
      toast.success(`Day ${currentDay} completed!`);
      setCurrentDay(currentDay + 1);
      setResponses({});
    }
  };

  const handleResponseChange = (questionIndex: number, value: string) => {
    setValidationError(null);
    setResponses(prev => ({
      ...prev,
      [`question_${questionIndex}`]: value,
    }));
  };

  // No concepts? Show a graceful message
  if (!conceptItems || conceptItems.length === 0) {
    return (
      <div className="min-h-screen bg-brand-linen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-serif text-brand-taupe">This journey is coming soon.</p>
          <p className="text-sm text-zinc-500 mt-2">We're building something special for you.</p>
          <button
            onClick={() => router.push('/journeys')}
            className="mt-6 px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-hover transition-colors"
          >
            Browse Journeys
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-brand-linen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        {/* Cinematic Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[40vw] h-[40vw] max-w-lg max-h-lg bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3 mix-blend-multiply" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[50vw] h-[50vw] max-w-xl max-h-xl bg-brand-growth/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/4 mix-blend-multiply" 
        />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-brand-sand/15 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-multiply" />

        <motion.div
          initial={{ scale: 0, shadow: "0px 0px 0px rgba(192,97,74,0)" }}
          animate={{ scale: 1, shadow: "0px 20px 40px rgba(192,97,74,0.3)" }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-primary to-[#d87b64] flex items-center justify-center mb-8 shadow-2xl relative z-10"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-serif font-bold text-brand-taupe mb-3">
            You&apos;ve completed<br />{title || 'this journey'}!
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mb-8">
            You&apos;ve done the work. The skills you&apos;ve practiced are now part of how you relate. Keep building on what you&apos;ve learned.
          </p>

          <div className="flex justify-center gap-2 mb-8">
            {[0, 0.1, 0.2].map((delay, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + delay, type: "spring" }}
              >
                <Star className="w-8 h-8 fill-brand-sand text-brand-sand" />
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => router.push('/journeys')}
            className="w-full max-w-xs py-4 rounded-2xl bg-brand-primary text-white font-semibold text-base mb-3 shadow-md hover:bg-brand-hover transition-colors"
          >
            Explore More Journeys
          </button>

          <button
            onClick={() => router.push('/subscription')}
            className="w-full max-w-xs py-4 rounded-2xl bg-brand-taupe text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity"
          >
            <Crown className="w-4 h-4" />
            Unlock Premium Journeys
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-linen pb-32 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[40%] right-[-10%] w-[50%] h-[600px] bg-brand-sand/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />

      <div className="max-w-lg mx-auto py-6 px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-serif font-bold text-brand-taupe mb-4 tracking-tight drop-shadow-sm">{title || journeyId}</h1>

          <div className="rounded-[1.5rem] bg-white/70 backdrop-blur-md border border-white p-5 shadow-sm">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-semibold text-brand-taupe">Day {currentDay} of {totalDays}</span>
              <span className="text-brand-primary font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-brand-primary/10" />
          </div>
        </motion.div>

        {/* Day content */}
        {currentDayContent && (
          <div className="space-y-5">
            {/* Day title with concept icon */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                {currentDayContent.conceptIcon}
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest">Day {currentDay}</p>
                <h2 className="text-lg font-bold text-brand-taupe">{currentDayContent.title}</h2>
              </div>
            </motion.div>

            {/* Learning card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-[2rem] bg-white/80 backdrop-blur-md border border-white/60 p-6 shadow-xl shadow-brand-taupe/5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand-sand/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-brand-sand" />
                </div>
                <p className="text-xs font-bold text-brand-sand uppercase tracking-[0.2em]">Today&apos;s Learning</p>
              </div>
              <div className="text-sm text-zinc-700 leading-relaxed space-y-3">
                {currentDayContent.learning.split('\n\n').map((p, i) => (
                  <p key={i}>
                    {p.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j} className="text-brand-taupe">{part.slice(2, -2)}</strong>
                        : <span key={j}>{part}</span>
                    )}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Why it matters */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-2xl bg-brand-sand/10 border border-brand-sand/20 p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-brand-sand opacity-50" />
              <p className="text-sm text-zinc-700 font-serif italic leading-relaxed pl-2 tracking-wide">
                {currentDayContent.whyItMatters}
              </p>
            </motion.div>

            {/* Activity card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-[2rem] bg-white border border-white/60 overflow-hidden shadow-2xl shadow-brand-primary/5"
            >
              <div className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-brand-primary" />
                  </div>
                  <p className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em]">Activity</p>
                </div>
                <h3 className="text-lg font-bold text-brand-taupe">{currentDayContent.activity.title}</h3>
              </div>
              <div className="px-6 pb-6 space-y-5">
                <div className="text-sm text-zinc-700 leading-relaxed space-y-3">
                  {currentDayContent.activity.instructions.split('\n\n').map((p, i) => (
                    <p key={i}>
                      {p.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                        part.startsWith('**') && part.endsWith('**')
                          ? <strong key={j} className="text-brand-taupe">{part.slice(2, -2)}</strong>
                          : <span key={j}>{part}</span>
                      )}
                    </p>
                  ))}
                </div>

                {/* Reflection questions */}
                {currentDayContent.activity.reflectionQuestions.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest">
                      Reflection
                    </p>
                    {currentDayContent.activity.reflectionQuestions.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <p className="text-sm font-medium text-brand-taupe">{index + 1}. {question}</p>
                        <Textarea
                          placeholder="Your thoughts..."
                          value={responses[`question_${index}`] || ''}
                          onChange={(e) => handleResponseChange(index, e.target.value)}
                          className="min-h-[120px] rounded-[1.25rem] border-zinc-200 focus:ring-2 focus:ring-brand-primary/30 bg-zinc-50/50 shadow-inner resize-none p-4 text-brand-taupe placeholder:text-zinc-400 transition-all font-medium"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Validation error */}
                {validationError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-brand-primary bg-brand-primary/5 rounded-xl px-4 py-3"
                  >
                    {validationError}
                  </motion.p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            onClick={handlePreviousDay}
            disabled={currentDay === 1}
            className="flex-1 rounded-2xl border-brand-primary/15 text-brand-taupe hover:bg-brand-primary/5 h-14 font-semibold text-base"
          >
            <ChevronLeft className="mr-1 h-5 w-5" /> Previous
          </Button>
          <Button
            onClick={handleNextDay}
            className="flex-1 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white h-14 font-semibold text-base shadow-lg shadow-brand-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            {currentDay >= totalDays
              ? <>Complete <CheckCircle className="ml-1 h-5 w-5" /></>
              : <>Next Day <ChevronRight className="ml-1 h-5 w-5" /></>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

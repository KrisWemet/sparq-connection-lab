import React, { useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Star, Lightbulb, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { saveJourneyProgress, getJourneyVelocityStatus } from '@/services/journeyContentService';
import { TierId } from './JourneyTierView';

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
  tierId?: TierId;
  title?: string;
  tierName?: string;
  totalDays?: number;
  conceptItems?: ConceptItem[];
  completionCriteria?: CompletionCriteria;
  onBackToTiers?: () => void;
}

// ── Day content generation ──────────────────────────────────────────────────

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

function generateDayContent(concepts: ConceptItem[], totalDays: number, tierId?: TierId, journeyTitle: string = ''): GeneratedDay[] {
  const days: GeneratedDay[] = [];
  const tierDepth = tierId === 'bloom' ? 2 : tierId === 'growth' ? 1 : 0;

  for (let d = 1; d <= totalDays; d++) {
    const conceptIdx = (d - 1) % concepts.length;
    const concept = concepts[conceptIdx];
    const cycle = Math.floor((d - 1) / concepts.length);

    const depthLabels = tierId === 'bloom'
      ? ['Integrate', 'Embody', 'Teach', 'Master']
      : tierId === 'growth'
        ? ['Practice', 'Apply', 'Deepen', 'Refine']
        : ['Discover', 'Explore', 'Reflect', 'Connect'];
    const depthLabel = depthLabels[Math.min(cycle, depthLabels.length - 1)];

    days.push({
      number: d,
      title: `${depthLabel}: ${concept.title}`,
      conceptTitle: concept.title,
      conceptDescription: concept.description,
      conceptIcon: concept.icon,
      learning: getLearningContent(concept, cycle, tierDepth, journeyTitle),
      whyItMatters: getWhyItMatters(concept, cycle, tierDepth, journeyTitle),
      activity: {
        title: getActivityTitle(concept, cycle, tierDepth),
        instructions: getActivityInstructions(concept, cycle, tierDepth, journeyTitle),
        reflectionQuestions: getReflectionQuestions(concept, cycle, tierDepth, journeyTitle),
      },
    });
  }

  return days;
}

function getLearningContent(concept: ConceptItem, cycle: number, tierDepth: number, journeyTitle: string = 'your relationship'): string {
  const base = concept.description;
  const example = concept.example;
  const contextLower = journeyTitle ? journeyTitle.toLowerCase() : 'your relationship';

  if (tierDepth === 0) {
    // Roots — awareness and understanding
    if (cycle === 0) return `Today we explore **${concept.title}** — ${base.toLowerCase()}.\n\n${example}\n\nThis is one of the foundational skills for ${contextLower}. You don't need to master it today — just begin to notice how it shows up in your life.`;
    if (cycle === 1) return `Welcome back to **${concept.title}**. Now that you've been introduced, it's time to observe it more intentionally within the context of ${contextLower}.\n\n${example}\n\nToday, focus on noticing one specific moment where this shows up naturally. Awareness is the first step toward growth.`;
    return `You've been sitting with **${concept.title}** for a while now. Today, reflect on what you've noticed about your habits regarding ${contextLower}.\n\n${base}. What patterns are emerging? What surprises you about your own relationship with this concept?`;
  }

  if (tierDepth === 1) {
    // Growth — practice and application
    if (cycle === 0) return `You've built awareness of **${concept.title}** — now it's time to practice it deliberately.\n\n${base}.\n\nThe difference between knowing and doing is practice. Today, you'll move from understanding to intentional action. Growth happens in the doing.`;
    if (cycle === 1) return `Today we push deeper into **${concept.title}**. You've practiced the basics — now let's add nuance.\n\n${example}\n\nNotice the edges: where does this skill feel natural? Where does it still feel effortful? The friction points are where the real growth lives.`;
    return `You're building real skill with **${concept.title}**. Today, apply it in a situation that feels slightly challenging.\n\n${base}. Stretch beyond your comfort zone — not recklessly, but courageously. This is how practice becomes capability.`;
  }

  // Bloom — integration and embodiment
  if (cycle === 0) return `You've practiced **${concept.title}** extensively. Now it's time to make it part of who you are — not just something you do.\n\n${base}.\n\nAt this stage, the goal is fluency. When this skill becomes natural, it transforms not just conversations but the entire texture of your relationship.`;
  if (cycle === 1) return `Today, explore how **${concept.title}** connects to other skills you've developed.\n\n${example}\n\nMastery isn't about perfecting one skill in isolation — it's about weaving skills together so they reinforce each other naturally.`;
  return `You're ready to own **${concept.title}** fully. Today, consider how you'd share this skill with someone else.\n\n${base}. Teaching deepens understanding. When you can articulate why this matters in your own words, it's truly yours.`;
}

function getWhyItMatters(concept: ConceptItem, cycle: number, tierDepth: number, journeyTitle: string = 'relationship'): string {
  const contextLower = journeyTitle ? journeyTitle.toLowerCase() : 'relationship';

  if (tierDepth === 0) {
    if (cycle === 0) return `Research shows that couples who develop awareness of ${concept.title.toLowerCase()} report significantly greater success with ${contextLower}. This isn't about perfection — it's about showing up with intention.`;
    if (cycle === 1) return `The more you notice ${concept.title.toLowerCase()} in your daily life, the more naturally it improves ${contextLower}. Awareness is the seed of change.`;
    return `You're building the foundation that ${contextLower} rests on. Without awareness of ${concept.title.toLowerCase()}, deeper practice would be guesswork.`;
  }
  if (tierDepth === 1) {
    if (cycle === 0) return `Knowledge without practice fades. The couples who transform their relationships are the ones who move from understanding ${concept.title.toLowerCase()} to deliberately practicing it — even when it's uncomfortable.`;
    if (cycle === 1) return `You're in the messy middle — where practice feels awkward but real change is happening. Trust the process. Every repetition of ${concept.title.toLowerCase()} is rewiring how you relate.`;
    return `Consistent, deliberate practice of ${concept.title.toLowerCase()} is building neural pathways that will eventually feel effortless. You're closer than you think.`;
  }
  if (cycle === 0) return `When ${concept.title.toLowerCase()} becomes second nature, it stops being a skill you deploy and becomes part of your relational identity. That's the shift from practice to presence.`;
  if (cycle === 1) return `Integration means you don't have to think about ${concept.title.toLowerCase()} — you just live it. This is the level of mastery that creates lasting, deeply satisfying partnerships.`;
  return `You're at the level where ${concept.title.toLowerCase()} is woven into everything. This kind of relational fluency is rare — and it ripples into every meaningful relationship in your life.`;
}

function getActivityTitle(concept: ConceptItem, cycle: number, tierDepth: number): string {
  if (tierDepth === 0) {
    const labels = ['Awareness Exercise', 'Observation Exercise', 'Reflection Exercise', 'Connection Exercise'];
    return `${concept.title}: ${labels[Math.min(cycle, labels.length - 1)]}`;
  }
  if (tierDepth === 1) {
    const labels = ['Practice Exercise', 'Application Exercise', 'Challenge Exercise', 'Skill-Building Exercise'];
    return `${concept.title}: ${labels[Math.min(cycle, labels.length - 1)]}`;
  }
  const labels = ['Integration Exercise', 'Mastery Exercise', 'Teaching Exercise', 'Embodiment Exercise'];
  return `${concept.title}: ${labels[Math.min(cycle, labels.length - 1)]}`;
}

function getActivityInstructions(concept: ConceptItem, cycle: number, tierDepth: number, journeyTitle: string = 'relationship'): string {
  const contextLower = journeyTitle ? journeyTitle.toLowerCase() : 'relationship';

  if (tierDepth === 0) {
    // Roots — observation and awareness
    if (cycle === 0) return `**Step 1:** Take a quiet moment (2-3 minutes) and think about ${concept.title.toLowerCase()} in regards to ${contextLower}. When does it show up naturally? When is it missing?\n\n**Step 2:** Share one observation with your partner. Keep it simple — "I noticed that..." or "I've been thinking about..."\n\n**Step 3:** Listen to their response without planning what to say next. Just receive it.`;
    if (cycle === 1) return `**Step 1:** Set an intention to notice ${concept.title.toLowerCase()} three times today — once in the morning, once in the afternoon, once in the evening.\n\n**Step 2:** After each moment, jot down a quick note about how it influenced ${contextLower}.\n\n**Step 3:** At the end of the day, share your favorite observation with your partner.`;
    return `**Step 1:** Reflect on everything you've noticed about ${concept.title.toLowerCase()} so far. What pattern stands out most for ${contextLower}?\n\n**Step 2:** Share this pattern with your partner and ask: "Does this match what you see?"\n\n**Step 3:** Together, identify one thing you both want to be more intentional about going forward.`;
  }

  if (tierDepth === 1) {
    // Growth — deliberate practice
    if (cycle === 0) return `**Step 1:** Choose one specific moment today where you will intentionally practice ${concept.title.toLowerCase()}. Plan it in advance.\n\n**Step 2:** Before the moment, set a quiet intention: "I'm going to focus on ${concept.title.toLowerCase()} right now."\n\n**Step 3:** Afterward, debrief with yourself: What worked? What felt forced? What would you try differently next time?`;
    if (cycle === 1) return `**Step 1:** Have a 10-minute conversation with your partner where you both practice ${concept.title.toLowerCase()} simultaneously. Set a timer.\n\n**Step 2:** Halfway through, pause and check in: "How is this going for you? What are you noticing?"\n\n**Step 3:** After the conversation, each share one thing the other did well and one thing to try next time.`;
    return `**Step 1:** Identify a situation this week where ${concept.title.toLowerCase()} was difficult for you. What made it hard?\n\n**Step 2:** Role-play the situation with your partner, trying a different approach. Let them coach you.\n\n**Step 3:** Discuss: What did the new approach feel like? What would make it easier to do this in the moment?`;
  }

  // Bloom — integration and teaching
  if (cycle === 0) return `**Step 1:** Go through an entire day treating ${concept.title.toLowerCase()} as your default mode — not just with your partner, but in all interactions.\n\n**Step 2:** At the end of the day, reflect: Where did it feel natural? Where did you have to consciously remember?\n\n**Step 3:** Share with your partner what you learned about yourself. How has your relationship with this skill evolved?`;
  if (cycle === 1) return `**Step 1:** Think about how ${concept.title.toLowerCase()} connects to other skills you've practiced. Write down at least two connections.\n\n**Step 2:** Share these connections with your partner. Ask them what connections they see.\n\n**Step 3:** Together, create a "personal practice" — a daily micro-ritual (under 2 minutes) that weaves multiple skills together.`;
  return `**Step 1:** Imagine you're explaining ${concept.title.toLowerCase()} to a close friend who's struggling in their relationship. What would you say? Write it in your own words.\n\n**Step 2:** Share what you wrote with your partner. Let them add to it or refine it.\n\n**Step 3:** Reflect together: How is your relationship different now than when you started working on this?`;
}

function getReflectionQuestions(concept: ConceptItem, cycle: number, tierDepth: number, journeyTitle: string = 'relationship'): string[] {
  const contextLower = journeyTitle ? journeyTitle.toLowerCase() : 'relationship';

  if (tierDepth === 0) {
    if (cycle === 0) return [
      `What did you notice about ${concept.title.toLowerCase()} specifically regarding ${contextLower} today?`,
      `On a scale of 1-10, how aware do you feel of this concept? What would move you one point higher?`,
      `What's one small thing you could pay attention to tomorrow related to ${concept.title.toLowerCase()}?`,
    ];
    if (cycle === 1) return [
      `Describe a moment today when you noticed ${concept.title.toLowerCase()} happening naturally.`,
      `What surprised you about your observations today?`,
      `How did your partner respond when you shared what you noticed?`,
    ];
    return [
      `What pattern has emerged in how ${concept.title.toLowerCase()} shows up in your relationship?`,
      `What feels most important to carry forward from this awareness practice?`,
      `How has simply paying attention to this changed your experience?`,
    ];
  }

  if (tierDepth === 1) {
    if (cycle === 0) return [
      `Describe the specific moment you practiced ${concept.title.toLowerCase()} today. What happened?`,
      `What felt natural about the practice? What felt forced or awkward?`,
      `What would you try differently next time?`,
    ];
    if (cycle === 1) return [
      `How did it feel to practice ${concept.title.toLowerCase()} together with your partner?`,
      `What feedback did your partner give you? How did it land?`,
      `Where do you see the most growth in yourself around this skill?`,
    ];
    return [
      `What made ${concept.title.toLowerCase()} difficult in the challenging situation you identified?`,
      `What did you learn from role-playing a different approach?`,
      `How confident do you feel about applying this in real-time now? What's still needed?`,
    ];
  }

  if (cycle === 0) return [
    `How did it feel to treat ${concept.title.toLowerCase()} as your default mode for a full day?`,
    `Where has this skill become genuinely natural vs. where are you still performing it?`,
    `What has this practice taught you about who you are as a partner?`,
  ];
  if (cycle === 1) return [
    `What connections did you discover between ${concept.title.toLowerCase()} and other skills you've built?`,
    `Describe the micro-ritual you created. Why did you choose it?`,
    `How does weaving skills together feel different from practicing them separately?`,
  ];
  return [
    `In your own words, why does ${concept.title.toLowerCase()} matter in a relationship?`,
    `How has your understanding of this evolved from when you first encountered it in Roots?`,
    `What commitment are you making to yourself and your partner going forward?`,
  ];
}

// ── Tier progress helpers ──────────────────────────────────────────────────

function saveTierDay(journeyId: string, tierId: TierId, day: number, totalDays: number) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('sparq_tier_progress');
    const progress = raw ? JSON.parse(raw) : {};
    if (!progress[journeyId]) progress[journeyId] = {};
    progress[journeyId][tierId] = {
      currentDay: day,
      totalDays,
      completed: day >= totalDays,
    };
    localStorage.setItem('sparq_tier_progress', JSON.stringify(progress));
  } catch {
    // Silently fail
  }
}

function loadTierDay(journeyId: string, tierId: TierId): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = localStorage.getItem('sparq_tier_progress');
    if (!raw) return 1;
    const progress = JSON.parse(raw);
    const current = progress?.[journeyId]?.[tierId]?.currentDay;
    return current && !progress[journeyId][tierId].completed ? current : 1;
  } catch {
    return 1;
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function JourneyContentView({
  journeyId,
  tierId,
  title,
  tierName,
  totalDays = 14,
  conceptItems,
  completionCriteria,
  onBackToTiers,
}: JourneyContentViewProps) {
  const router = useRouter();
  const initialDay = tierId ? loadTierDay(journeyId, tierId) : 1;
  const [currentDay, setCurrentDay] = useState(initialDay);
  const [highestUnlockedDay, setHighestUnlockedDay] = useState(initialDay);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [canDoNextDay, setCanDoNextDay] = useState(true);

  React.useEffect(() => {
    async function checkVelocity() {
      const status = await getJourneyVelocityStatus(journeyId);
      setCanDoNextDay(status.canDoNextDay !== false);
    }
    checkVelocity();
  }, [journeyId]);

  const progress = (currentDay / totalDays) * 100;

  const days = conceptItems ? generateDayContent(conceptItems, totalDays, tierId, title) : [];
  const currentDayContent = days.find(d => d.number === currentDay);

  const displayTitle = tierName ? `${title} — ${tierName}` : (title || journeyId);

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
        setValidationError('Try to write a bit more — even a few sentences helps deepen the practice.');
        return false;
      }
    }
    return true;
  };

  const handleNextDay = async () => {
    if (!validateCompletion()) return;
    setValidationError(null);

    const journeyKey = tierId ? `${journeyId}_${tierId}` : journeyId;
    await saveJourneyProgress(journeyKey, currentDay, true, responses);

    if (tierId) {
      saveTierDay(journeyId, tierId, currentDay, totalDays);
    }

    if (currentDay >= totalDays) {
      if (tierId) {
        saveTierDay(journeyId, tierId, totalDays, totalDays);
      }
      setCompleted(true);
    } else {
      toast.success(`Day ${currentDay} complete!`);
      setCanDoNextDay(false); // Manually block them from the next day
      setHighestUnlockedDay(currentDay + 1);
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

  // No concepts
  if (!conceptItems || conceptItems.length === 0) {
    return (
      <div className="min-h-screen bg-brand-linen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-serif text-brand-taupe">This journey is coming soon.</p>
          <p className="text-sm text-zinc-500 mt-2">We&apos;re building something special for you.</p>
          <button
            onClick={() => onBackToTiers ? onBackToTiers() : router.push('/journeys')}
            className="mt-6 px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-hover transition-colors"
          >
            {onBackToTiers ? 'Back to Tiers' : 'Browse Journeys'}
          </button>
        </div>
      </div>
    );
  }

  // Completed
  if (completed) {
    const tierEmoji = tierId === 'bloom' ? '🌸' : tierId === 'growth' ? '🌿' : '🌱';
    const nextTier: TierId | null = tierId === 'roots' ? 'growth' : tierId === 'growth' ? 'bloom' : null;
    const nextTierName = nextTier === 'growth' ? 'Growth' : nextTier === 'bloom' ? 'Bloom' : null;

    return (
      <div className="min-h-screen bg-brand-linen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
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

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
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
          <p className="text-4xl mb-4">{tierEmoji}</p>
          <h1 className="text-2xl font-serif font-bold text-brand-taupe mb-3">
            {tierName ? `${tierName} Complete!` : `You've completed ${title || 'this journey'}!`}
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mb-8 mx-auto">
            {tierId === 'roots' && "You've built a strong foundation of awareness. You're ready to take these insights into active practice."}
            {tierId === 'growth' && "You've moved from understanding to real skill. The concepts are becoming part of how you naturally relate."}
            {tierId === 'bloom' && "You've fully integrated these skills into who you are as a partner. This is lasting, meaningful growth."}
            {!tierId && "You've done the work. The skills you've practiced are now part of how you relate."}
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

          {nextTier && onBackToTiers ? (
            <button
              onClick={onBackToTiers}
              className="w-full max-w-xs py-4 rounded-2xl bg-brand-primary text-white font-semibold text-base mb-3 shadow-md hover:bg-brand-hover transition-colors"
            >
              Continue to {nextTierName} →
            </button>
          ) : (
            <button
              onClick={() => router.push('/journeys')}
              className="w-full max-w-xs py-4 rounded-2xl bg-brand-primary text-white font-semibold text-base mb-3 shadow-md hover:bg-brand-hover transition-colors"
            >
              Explore More Journeys
            </button>
          )}

          {onBackToTiers && (
            <button
              onClick={onBackToTiers}
              className="w-full max-w-xs py-3 rounded-2xl text-zinc-500 font-medium text-sm hover:text-brand-taupe transition-colors"
            >
              Back to Journey Overview
            </button>
          )}
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
        {/* Back to tiers */}
        {onBackToTiers && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBackToTiers}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-brand-taupe transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Journey Overview
          </motion.button>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-serif font-bold text-brand-taupe mb-4 tracking-tight drop-shadow-sm">{displayTitle}</h1>

          <div className="rounded-[1.5rem] bg-white/70 backdrop-blur-md border border-white p-5 shadow-sm">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-semibold text-brand-taupe">Day {currentDay} of {totalDays}</span>
              <span className="text-brand-primary font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-brand-primary/10" />
          </div>
        </motion.div>

        {/* Rest & Reflect Limit Screen */}
        {(!canDoNextDay && currentDay >= highestUnlockedDay) ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl mt-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-brand-sand/20 to-brand-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Star className="w-10 h-10 text-brand-primary" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-brand-taupe mb-4">Rest & Reflect</h2>
            <p className="text-zinc-600 text-lg leading-relaxed max-w-sm mb-8">
              You've completed your session for today. 30 minutes of thoughtful focus builds a stronger foundation than rushing through. Let today's concepts sink in, and come back tomorrow to continue your growth!
            </p>
            <Button
              onClick={() => router.push('/journeys')}
              className="bg-brand-primary text-white rounded-full px-8 py-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-lg font-semibold"
            >
              Back to Journeys
            </Button>
          </motion.div>
        ) : (
          /* Day content */
          currentDayContent && (
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
          )
        )}        {/* Navigation */}
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

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight, Lock } from "lucide-react";
import { useSubscription } from "@/lib/subscription-provider";
import { useRouter } from 'next/router';

interface PersuasiveJourneyPromptProps {
  journeyId: string;
  journeyTitle: string;
  journeyDescription: string;
  isPremiumJourney: boolean;
  completionPercentage: number;
  onContinue: () => void;
}

export function PersuasiveJourneyPrompt({
  journeyId,
  journeyTitle,
  journeyDescription,
  isPremiumJourney,
  completionPercentage,
  onContinue
}: PersuasiveJourneyPromptProps) {
  const { subscription } = useSubscription();
  const router = useRouter();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [motivationalIndex, setMotivationalIndex] = useState(0);

  const isPremium = subscription?.tier === "premium";
  const hasAccess = !isPremiumJourney || isPremium;

  // Open reflection prompts (constitution v1.1 §5A): questions the user
  // answers for themselves — no embedded commands, no pulsing emphasis.
  const reflectionPrompts = [
    "What have you noticed about the two of you since you started?",
    "Which part of this journey has felt most useful so far — if any?",
    "Is there one small thing from this journey you want to keep doing?",
  ];

  // Rotate slowly through the prompts
  useEffect(() => {
    if (hasAccess && completionPercentage > 0) {
      const interval = setInterval(() => {
        setMotivationalIndex((prev) => (prev + 1) % reflectionPrompts.length);
      }, 12000);

      return () => clearInterval(interval);
    }
  }, [hasAccess, completionPercentage, reflectionPrompts.length]);

  // Benefits based on journey type
  const getJourneyBenefits = () => {
    // Plain descriptions of what the journey covers — no invented results.
    const benefits: Record<string, string[]> = {
      communication: [
        "Practice listening without planning your reply",
        "Find words for what's underneath the small stuff",
        "Try small experiments for hard conversations",
      ],
      intimacy: [
        "Explore what closeness means for each of you",
        "Practice sharing something tender, at your own pace",
        "Try small ways to feel close in everyday moments",
      ],
      trust: [
        "Notice what helps each of you feel safe",
        "Practice keeping small promises and naming them",
        "Talk about trust without blame",
      ],
      future: [
        "Talk about what you each hope for",
        "Find the places your hopes overlap",
        "Plan one small step toward a shared idea",
      ],
      attachment: [
        "Notice what you each need when things feel shaky",
        "Practice asking for reassurance in a clear way",
        "Try small ways to respond to each other's needs",
      ],
      conflict: [
        "Notice the loop you two fall into — without blame",
        "Practice pausing before a hard moment gets hot",
        "Try small repair moves after a disagreement",
      ],
    };

    const journeyType = Object.keys(benefits).find(type => journeyId.includes(type)) || "communication";
    return benefits[journeyType];
  };

  return (
    <>
      <div className="rounded-3xl overflow-hidden border border-brand-primary/10 shadow-sm bg-gradient-to-br from-white to-brand-linen/30">
        <div className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-primary" />
              <h3 className="text-lg font-bold text-brand-taupe">{journeyTitle}</h3>

              {isPremiumJourney && !isPremium && (
                <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-brand-sand">
                  <Lock className="h-3 w-3" />
                  Premium
                </div>
              )}
            </div>

            <p className="text-sm text-zinc-600 leading-relaxed">{journeyDescription}</p>

            {/* Progress bar for ongoing journeys */}
            {hasAccess && completionPercentage > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-text-secondary">Progress</span>
                  <span className="font-medium text-brand-taupe">{Math.round(completionPercentage)}%</span>
                </div>
                <div className="relative h-2 bg-brand-primary/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-brand-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.8, type: "spring" }}
                  />
                </div>
              </div>
            )}

            {/* Motivational message for ongoing journeys */}
            {hasAccess && completionPercentage > 0 && (
              <motion.div
                key={motivationalIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="bg-brand-linen p-3 rounded-2xl"
              >
                <p className="text-sm text-zinc-700 font-serif italic leading-relaxed">
                  {reflectionPrompts[motivationalIndex]}
                </p>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end">
              {hasAccess ? (
                <Button
                  onClick={onContinue}
                  className="rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-bold"
                >
                  {completionPercentage > 0 ? "Continue Journey" : "Start Journey"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowUpgradePrompt(true)}
                  className="rounded-xl bg-brand-sand hover:opacity-90 text-white font-bold"
                >
                  Explore this Premium journey
                  <Lock className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade modal */}
      {showUpgradePrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={() => setShowUpgradePrompt(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 m-4 max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-3">
                <Heart className="h-7 w-7 text-brand-primary" />
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-taupe mb-2">This journey is part of Premium</h3>
              <p className="text-brand-text-secondary text-sm leading-relaxed">
                Here&apos;s what {journeyTitle} explores. Take it if it fits you — there&apos;s plenty to do on the free plan too.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <p className="font-medium text-brand-taupe">In this journey you&apos;ll:</p>
                <ul className="space-y-1">
                  {getJourneyBenefits().map((benefit, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start text-sm text-zinc-700"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Sparkles className="h-4 w-4 text-brand-sand mr-2 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

{/* Made-up testimonial removed (no real users yet; constitution §5A). */}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-brand-primary/15 text-brand-taupe hover:bg-brand-primary/5"
                onClick={() => setShowUpgradePrompt(false)}
              >
                Not Now
              </Button>
              <Button
                className="flex-1 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-bold"
                onClick={() => router.push("/subscription")}
              >
                See Premium
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

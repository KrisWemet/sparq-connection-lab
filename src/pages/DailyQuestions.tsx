import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DailySessionService } from "@/services/dailySessionService";
import { PersonalityInferenceService } from "@/services/personalityInferenceService";
import { PersonalityProfileService } from "@/services/personalityProfileService";
import { PHASE_FORMAT_PREFERENCES } from "@/types/session";
import { useSessionPsychology } from "@/hooks/useSessionPsychology";
import { SessionGreeting } from "@/components/session/SessionGreeting";
import { StepIndicator } from "@/components/session/StepIndicator";
import type { SessionStep } from "@/components/session/StepIndicator";
import { YesterdayCheckIn as YesterdayCheckInComponent } from "@/components/session/YesterdayCheckIn";
import { LearnStep as LearnStepComponent } from "@/components/session/LearnStep";
import { MicroInsight } from "@/components/session/MicroInsight";
import { ImplementStep as ImplementStepComponent } from "@/components/session/ImplementStep";
import { SessionComplete } from "@/components/session/SessionComplete";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type {
  DailySession,
  CheckInResponseId,
  MCOption,
  SessionGenerationInput,
} from "@/types/session";
import type { DiscoveryPhase } from "@/types/personality";

// ─── Types ──────────────────────────────────────────────────────────────────

type SessionState =
  | "loading"
  | "greeting"
  | "check-in"
  | "learn"
  | "micro-insight"
  | "implement"
  | "complete";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPhaseForDay(day: number): DiscoveryPhase {
  if (day <= 3) return "rhythm";
  if (day <= 6) return "deepening";
  if (day <= 9) return "navigating";
  if (day <= 12) return "layers";
  return "mirror";
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DailyQuestions() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Session state machine
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [session, setSession] = useState<DailySession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAlternativeAction, setShowAlternativeAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive from profile
  const discoveryDay = (profile as any)?.discovery_day || 1;
  const identityArchetype = (profile as any)?.identity_archetype || "growth-seeker";
  const relationshipMode = (profile as any)?.relationship_mode || "solo";
  const userName = profile?.full_name || "there";
  const partnerName = profile?.partner_name || undefined;

  // Phase-aware psychology (color schemes, priming)
  const phase = getPhaseForDay(discoveryDay);
  const { phaseColors, cssVars } = useSessionPsychology(phase, identityArchetype);

  // ─── Generate Session ─────────────────────────────────────────────

  const generateSession = useCallback(async () => {
    if (!user?.id) return;

    setSessionState("loading");
    setError(null);

    try {
      const sessionService = DailySessionService.getInstance();
      const phase = getPhaseForDay(discoveryDay);
      const formatPrefs =
        PHASE_FORMAT_PREFERENCES[phase] || PHASE_FORMAT_PREFERENCES.rhythm;

      // Build lightweight profile context summary
      let profileContextSummary = "";
      try {
        const profileService = PersonalityProfileService.getInstance();
        await profileService.initialize(user.id);
        const ctx = await profileService.buildProfileContext(
          userName,
          partnerName,
          relationshipMode
        );
        if (ctx) {
          profileContextSummary = ctx.knownTraits;
        }
      } catch {
        // Profile not initialized yet — that's fine for Day 1
      }

      const input: SessionGenerationInput = {
        userId: user.id,
        userName,
        partnerName,
        identityArchetype,
        relationshipMode,
        discoveryDay,
        discoveryPhase: phase,
        onboardingGoals: (profile as any)?.onboarding_goals || [],
        profileContextSummary,
        yesterdayAction: undefined, // TODO: load from last session
        previousQuestionIds: [],
        formatPreferences: formatPrefs,
      };

      const generatedSession = await sessionService.generateSession(input);
      setSession(generatedSession);

      // Start with greeting, auto-advance after 2.5s
      setSessionState("greeting");
      setTimeout(() => {
        if (generatedSession.yesterdayCheckIn) {
          setSessionState("check-in");
        } else {
          setSessionState("learn");
        }
      }, 2500);
    } catch (err) {
      console.error("Session generation failed:", err);
      setError("Couldn't prepare your session. Let's try again.");
    }
  }, [user?.id, discoveryDay, identityArchetype, userName, partnerName, relationshipMode, profile]);

  useEffect(() => {
    if (user?.id && profile) {
      generateSession();
    }
  }, [user?.id, profile?.full_name]);

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleCheckInResponse = (_responseId: CheckInResponseId) => {
    // Brief pause to show acknowledgment, then advance
    setTimeout(() => setSessionState("learn"), 1500);
  };

  const handleLearnAnswer = async (
    value: string,
    selectedOption?: MCOption
  ) => {
    if (!session || !user?.id) return;

    setIsAnalyzing(true);

    try {
      const inferenceService = PersonalityInferenceService.getInstance();

      if (selectedOption?.signalHints && selectedOption.signalHints.length > 0) {
        // MC answer — extract signals from the option's signalHints directly
        const signals = selectedOption.signalHints.map((hint) => ({
          dimension: hint.dimension,
          sourceModality: session.learn.modality,
          observation: `Selected: "${selectedOption.text}"`,
          strength: hint.strength,
          indicator: hint.indicator,
          capturedAt: new Date().toISOString(),
          discoveryDay,
        }));

        // Feed signals into profile
        try {
          const profileService = PersonalityProfileService.getInstance();
          await profileService.initialize(user.id);
          await profileService.ingestSignals(signals, [], []);
        } catch {
          // Non-critical — profile update failed but session continues
        }
      } else {
        // Open-ended answer — AI analysis
        try {
          const result = await inferenceService.analyzeResponse({
            questionText: session.learn.question.text,
            questionModality: session.learn.modality,
            questionCategory: session.learn.question.targetDimensions[0] || "values",
            questionIntimacyLevel: session.learn.question.intimacyLevel,
            userResponse: value,
            discoveryDay,
            existingProfile: {},
          });

          if (result.signals.length > 0) {
            const profileService = PersonalityProfileService.getInstance();
            await profileService.initialize(user.id);
            await profileService.ingestSignals(
              result.signals,
              result.confidenceUpdates,
              result.memoryNotes
            );
          }
        } catch {
          // Non-critical
        }
      }
    } catch (err) {
      console.error("Personality analysis error:", err);
    }

    setIsAnalyzing(false);

    // Show micro-insight if available, otherwise go to implement
    if (session.learn.microInsight) {
      setSessionState("micro-insight");
    } else {
      setSessionState("implement");
    }
  };

  const handleMicroInsightContinue = () => {
    setSessionState("implement");
  };

  const handleAcceptAction = (_actionId: string) => {
    // TODO: Store accepted action for tomorrow's check-in
    setSessionState("complete");
  };

  const handleSwapAction = () => {
    setShowAlternativeAction(true);
  };

  const handleFinish = () => {
    // TODO: Increment discovery_day, update streak, set last_session_date
    toast.success("Session complete!");
    navigate("/dashboard");
  };

  // ─── Step indicator mapping ───────────────────────────────────────

  const getStepForIndicator = (): SessionStep => {
    switch (sessionState) {
      case "check-in":
        return "check-in";
      case "learn":
      case "micro-insight":
        return "learn";
      case "implement":
        return "implement";
      case "complete":
        return "complete";
      default:
        return "learn";
    }
  };

  // ─── Render ───────────────────────────────────────────────────────

  if (!user || !profile) {
    return null;
  }

  return (
    <div
      className="min-h-screen pb-24 transition-colors duration-700"
      style={{
        ...cssVars,
        background: `linear-gradient(135deg, ${phaseColors.gradientFrom} 0%, ${phaseColors.gradientTo} 100%)`,
      }}
    >
      <main className="container max-w-lg mx-auto px-4 pt-6">
        {/* Loading state */}
        {sessionState === "loading" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            {error ? (
              <>
                <p className="text-muted-foreground text-center">{error}</p>
                <Button onClick={generateSession}>Try Again</Button>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-muted-foreground">
                  Preparing your session...
                </p>
              </>
            )}
          </div>
        )}

        {/* Session content */}
        {session && sessionState !== "loading" && (
          <>
            {/* Step indicator — hidden during greeting and completion */}
            {sessionState !== "greeting" && sessionState !== "complete" && (
              <StepIndicator
                currentStep={getStepForIndicator()}
                showCheckIn={!!session.yesterdayCheckIn}
              />
            )}

            <AnimatePresence mode="wait">
              {/* Greeting */}
              {sessionState === "greeting" && (
                <motion.div
                  key="greeting"
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SessionGreeting
                    greeting={session.greeting.text}
                    subtitle={session.greeting.subtitle}
                  />
                </motion.div>
              )}

              {/* Yesterday Check-in */}
              {sessionState === "check-in" && session.yesterdayCheckIn && (
                <motion.div
                  key="check-in"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <YesterdayCheckInComponent
                    checkIn={session.yesterdayCheckIn}
                    onResponse={handleCheckInResponse}
                  />
                </motion.div>
              )}

              {/* Learn Step */}
              {sessionState === "learn" && (
                <motion.div
                  key="learn"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <LearnStepComponent
                    learn={session.learn}
                    onAnswer={handleLearnAnswer}
                    isAnalyzing={isAnalyzing}
                  />
                </motion.div>
              )}

              {/* Micro-Insight */}
              {sessionState === "micro-insight" && session.learn.microInsight && (
                <motion.div
                  key="micro-insight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MicroInsight
                    insight={session.learn.microInsight}
                    onContinue={handleMicroInsightContinue}
                  />
                </motion.div>
              )}

              {/* Implement Step */}
              {sessionState === "implement" && (
                <motion.div
                  key="implement"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <ImplementStepComponent
                    implement={session.implement}
                    onAccept={handleAcceptAction}
                    onSwap={handleSwapAction}
                    showAlternative={showAlternativeAction}
                  />
                </motion.div>
              )}

              {/* Session Complete */}
              {sessionState === "complete" && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <SessionComplete
                    celebration={session.celebration}
                    onFinish={handleFinish}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

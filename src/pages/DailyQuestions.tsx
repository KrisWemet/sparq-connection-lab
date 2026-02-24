import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePeter } from "@/contexts/PeterContext";
import { DailySessionService } from "@/services/dailySessionService";
import { PersonalityInferenceService } from "@/services/personalityInferenceService";
import { PersonalityProfileService } from "@/services/personalityProfileService";
import { MirrorNarrativeService } from "@/services/mirrorNarrativeService";
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
import { Card, CardContent } from "@/components/ui/card";
import { SparqOtter } from "@/components/SparqOtter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  saveCompletedSession,
  saveMirrorNarrative,
  getLastSession,
  hasCompletedToday,
} from "@/services/sessionPersistenceService";
import type {
  DailySession,
  CheckInResponseId,
  MCOption,
  SessionGenerationInput,
} from "@/types/session";
import type { DiscoveryPhase, MirrorNarrative } from "@/types/personality";

// ─── Types ──────────────────────────────────────────────────────────────────

type SessionState =
  | "loading"
  | "greeting"
  | "check-in"
  | "learn"
  | "micro-insight"
  | "implement"
  | "mood-rating"
  | "mirror"
  | "complete";

// ─── Mood Rating ────────────────────────────────────────────────────────────

const MOOD_OPTIONS = [
  { emoji: "😔", label: "Struggling", value: 1 },
  { emoji: "😐", label: "Okay", value: 2 },
  { emoji: "🙂", label: "Good", value: 3 },
  { emoji: "😊", label: "Great", value: 4 },
  { emoji: "🤩", label: "Amazing", value: 5 },
] as const;

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
  const { user, profile, handleRefreshProfile } = useAuth();

  // Session state machine
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [session, setSession] = useState<DailySession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAlternativeAction, setShowAlternativeAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store user's answer for sharing
  const [lastAnswer, setLastAnswer] = useState<{
    value: string;
    selectedOption?: MCOption;
  } | null>(null);

  // Store actual streak after save
  const [savedStreak, setSavedStreak] = useState<number | null>(null);

  // Mood rating (shown after implement, before completion)
  const [moodRating, setMoodRating] = useState<number | null>(null);

  // Mirror narrative (Day 13-14)
  const [mirrorNarrative, setMirrorNarrative] = useState<MirrorNarrative | null>(null);
  const [isGeneratingMirror, setIsGeneratingMirror] = useState(false);

  // Derive from profile
  const discoveryDay = (profile as any)?.discovery_day || 1;
  const identityArchetype = (profile as any)?.identity_archetype || "growth-seeker";
  const relationshipMode = (profile as any)?.relationship_mode || "solo";
  const userName = profile?.full_name || "there";
  const partnerName = profile?.partner_name || undefined;

  // Phase-aware psychology (color schemes, priming)
  const phase = getPhaseForDay(discoveryDay);
  const { phaseColors, cssVars } = useSessionPsychology(phase, identityArchetype);

  // ── Peter reactions ───────────────────────────────────────────────
  const { celebrate: peterCelebrate } = usePeter();

  useEffect(() => {
    if (sessionState === "complete") {
      const streak = savedStreak ?? ((profile as any)?.streak_count ?? 0);
      if (streak >= 7) {
        peterCelebrate(`${streak} days in a row! You're unstoppable! 🔥🎉`);
      } else if (streak >= 3) {
        peterCelebrate(`${streak}-day streak! Look at you go! 🎉`);
      } else {
        peterCelebrate("Session complete! Amazing work today! 🦦✨");
      }
    }
  }, [sessionState]);

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

      // Build lightweight profile context summary + extract attachment signals
      let profileContextSummary = "";
      let attachmentStyle: string | undefined;
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
          // Extract attachment style from profile if available
          attachmentStyle = (ctx as any)?.attachmentStyle;
        }
      } catch {
        // Profile not initialized yet — that's fine for Day 1
      }

      // Load yesterday's action for the check-in prompt
      let yesterdayAction: string | undefined;
      if (discoveryDay > 1) {
        try {
          const lastSession = await getLastSession(user.id);
          if (lastSession?.microAction) {
            yesterdayAction = lastSession.microAction;
          }
        } catch {
          // Non-critical
        }
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
        attachmentStyle,
        yesterdayAction,
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
  }, [user?.id, (profile as any)?.discovery_day]);

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

    // Store answer for sharing
    setLastAnswer({ value, selectedOption });

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

  const handleAcceptAction = async (_actionId: string) => {
    if (!session || !user?.id) {
      setSessionState("complete");
      return;
    }

    // Save the completed session to Supabase
    const result = await saveCompletedSession({
      userId: user.id,
      discoveryDay,
      phase,
      learnQuestionText: session.learn.question.text,
      learnQuestionId: session.learn.question.id,
      modality: session.learn.modality,
      learnResponse: lastAnswer?.value || lastAnswer?.selectedOption?.text || "",
      microAction: session.implement.microAction.personalizedText,
      microActionAccepted: !showAlternativeAction,
      implementActionId: _actionId,
      checkInResponse: undefined,
      moodRating: undefined, // Will be updated after mood step
    });

    if (!result.success) {
      toast.error("Could not save your session. Your progress may not be recorded.");
    } else {
      setSavedStreak(result.newStreak);
      // Refresh profile so auth context has the updated discovery_day for next session
      handleRefreshProfile().catch(() => {});
    }

    // Transition to mood rating
    setSessionState("mood-rating");
  };

  const handleMoodSelect = async (value: number) => {
    setMoodRating(value);

    // On Day 13-14 with enough data, trigger mirror narrative
    if (discoveryDay >= 13 && user?.id) {
      setIsGeneratingMirror(true);
      try {
        const profileService = PersonalityProfileService.getInstance();
        await profileService.initialize(user.id);
        const personalityProfile = await profileService.getProfile();

        if (personalityProfile) {
          const mirrorService = MirrorNarrativeService.getInstance();
          const narrative = await mirrorService.generateNarrative(
            personalityProfile,
            userName,
            partnerName
          );
          setMirrorNarrative(narrative);

          // Save mirror to database
          await saveMirrorNarrative({
            userId: user.id,
            narrative: narrative.narrative,
            coreInsight: narrative.coreInsight,
            dimensionSummaries: narrative.dimensionSummaries,
            recommendations: narrative.recommendations,
          });

          setIsGeneratingMirror(false);
          setSessionState("mirror");
          return;
        }
      } catch (err) {
        console.error("Mirror narrative generation failed:", err);
        toast("Your reflection will be ready soon", {
          description: "We'll have your 14-day mirror ready for your next session.",
        });
      }
      setIsGeneratingMirror(false);
    }

    setSessionState("complete");
  };

  const handleMirrorContinue = () => {
    setSessionState("complete");
  };

  const handleSwapAction = () => {
    setShowAlternativeAction(true);
  };

  const handleFinish = () => {
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
        boxShadow: `inset 0 0 100px ${phaseColors.surface}`,
      }}
    >
      <main className="container max-w-lg mx-auto px-4 pt-6">
        {/* Loading state */}
        {sessionState === "loading" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            {error ? (
              <>
                <SparqOtter mood="idle" size="lg" message="Let's try that again." />
                <Button onClick={generateSession} className="mt-4">Let's try again</Button>
              </>
            ) : (
              <SparqOtter
                mood="thinking"
                size="xl"
                message="Preparing your session..."
              />
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
                    archetype={identityArchetype}
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
                    questionText={session.learn.question.text}
                    answerText={lastAnswer?.selectedOption?.text || lastAnswer?.value || ""}
                    sessionId={session.id}
                    category={session.learn.question.targetDimensions[0]}
                    discoveryDay={discoveryDay}
                    allowSharing={relationshipMode === "partner"}
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

              {/* Mood Rating */}
              {sessionState === "mood-rating" && (
                <motion.div
                  key="mood-rating"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="min-h-[40vh] flex items-center justify-center">
                    <Card className="bg-white/90 dark:bg-card/90 backdrop-blur max-w-sm w-full">
                      <CardContent className="pt-6 space-y-6 text-center">
                        <p
                          className="text-lg font-medium"
                          style={{ color: "var(--session-primary, hsl(var(--foreground)))" }}
                        >
                          How are you feeling right now?
                        </p>
                        <div className="flex justify-center gap-3">
                          {MOOD_OPTIONS.map((mood) => (
                            <button
                              key={mood.value}
                              onClick={() => handleMoodSelect(mood.value)}
                              disabled={isGeneratingMirror}
                              className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                            >
                              <span className="text-3xl">{mood.emoji}</span>
                              <span className="text-xs text-muted-foreground">{mood.label}</span>
                            </button>
                          ))}
                        </div>
                        {isGeneratingMirror && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <SparqOtter
                              mood="guiding"
                              size="md"
                              message="Preparing something special..."
                            />
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* Mirror Narrative (Day 13-14) */}
              {sessionState === "mirror" && mirrorNarrative && (
                <motion.div
                  key="mirror"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="space-y-6 pb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center"
                    >
                      <SparqOtter mood="guiding" size="lg" className="mb-3" />
                      <h2
                        className="text-2xl font-semibold"
                        style={{ color: "var(--session-primary, hsl(var(--foreground)))" }}
                      >
                        We see you.
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        A reflection of who you are
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Card className="bg-white/90 dark:bg-card/90 backdrop-blur">
                        <CardContent className="pt-6 space-y-4">
                          {mirrorNarrative.narrative.split("\n\n").map((para, i) => (
                            <motion.p
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1.0 + i * 0.4 }}
                              className="text-sm leading-relaxed text-foreground"
                            >
                              {para}
                            </motion.p>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {mirrorNarrative.coreInsight && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.5 }}
                        className="text-center px-6"
                      >
                        <p
                          className="text-sm italic font-medium"
                          style={{ color: "var(--session-accent, hsl(var(--primary)))" }}
                        >
                          "{mirrorNarrative.coreInsight}"
                        </p>
                      </motion.div>
                    )}

                    {mirrorNarrative.dimensionSummaries.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.0 }}
                        className="space-y-3"
                      >
                        {mirrorNarrative.dimensionSummaries.map((dim, i) => (
                          <Card key={dim.dimension} className="bg-white/70 dark:bg-card/70">
                            <CardContent className="pt-4 pb-4">
                              <h4 className="text-sm font-semibold">{dim.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{dim.description}</p>
                              <p
                                className="text-xs mt-1 italic"
                                style={{ color: "var(--session-primary, hsl(var(--primary)))" }}
                              >
                                {dim.strengthFrame}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 3.5 }}
                      className="pt-4"
                    >
                      <Button
                        onClick={handleMirrorContinue}
                        className="w-full"
                        style={{ background: "var(--session-primary, hsl(var(--primary)))" }}
                      >
                        Continue
                      </Button>
                    </motion.div>
                  </div>
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
                    celebration={{
                      ...session.celebration,
                      showStreak: true,
                      streakCount: savedStreak ?? session.celebration.streakCount,
                    }}
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

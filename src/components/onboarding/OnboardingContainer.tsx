
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { OnboardingHeader } from "./OnboardingHeader";
import { OnboardingControls } from "./OnboardingControls";
import { SparqOtter } from "@/components/SparqOtter";
import type { OtterMood } from "@/components/SparqOtter";

interface OnboardingContainerProps {
  step: number;
  totalSteps: number;
  loading: boolean;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingContainer({
  step,
  totalSteps,
  loading,
  children,
  onBack,
  onNext,
  onComplete,
  onSkip
}: OnboardingContainerProps) {
  const otterMessages: Record<number, string> = {
    1: "Let's get to know each other!",
    2: "What matters most to you?",
    3: "Almost there — pick your style!",
  };

  const otterMoods: Record<number, OtterMood> = {
    1: "waving",
    2: "idle",
    3: "celebrate",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <OnboardingHeader step={step} totalSteps={totalSteps} />

        <div className="flex justify-center mb-4">
          <SparqOtter
            mood={otterMoods[step] || "idle"}
            size="md"
            message={otterMessages[step]}
          />
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            {children}
          </CardContent>
          <CardFooter className="p-0">
            <OnboardingControls
              step={step}
              totalSteps={totalSteps}
              loading={loading}
              onBack={onBack}
              onNext={onNext}
              onComplete={onComplete}
              onSkip={onSkip}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

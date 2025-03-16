
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { OnboardingHeader } from "./OnboardingHeader";
import { OnboardingControls } from "./OnboardingControls";

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
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <OnboardingHeader step={step} totalSteps={totalSteps} />
        
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


import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface OnboardingControlsProps {
  step: number;
  totalSteps: number;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingControls({ 
  step, 
  totalSteps, 
  loading, 
  onBack, 
  onNext, 
  onComplete,
  onSkip 
}: OnboardingControlsProps) {
  return (
    <>
      <div className="flex justify-between border-t p-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={step === 1 || loading}
        >
          Back
        </Button>
        
        {step < totalSteps ? (
          <Button 
            onClick={onNext}
            disabled={loading}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={onComplete} 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </Button>
        )}
      </div>
      
      {step < totalSteps && onSkip && (
        <Button 
          variant="link" 
          className="w-full"
          onClick={onSkip}
          disabled={loading}
        >
          Skip for now
        </Button>
      )}
    </>
  );
}

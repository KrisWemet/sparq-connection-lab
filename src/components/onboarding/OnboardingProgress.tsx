
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

interface OnboardingProgressProps {
  step: number;
  totalSteps: number;
  handleBack: () => void;
  handleNext: () => void;
  handleComplete: () => void;
  loading: boolean;
}

export function OnboardingProgress({
  step,
  totalSteps,
  handleBack,
  handleNext,
  handleComplete,
  loading
}: OnboardingProgressProps) {
  const progress = (step / totalSteps) * 100;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Onboarding</h1>
        <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
      </div>
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-between border-t p-6 mt-6">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={step === 1}
        >
          Back
        </Button>
        
        {step < totalSteps ? (
          <Button onClick={handleNext}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleComplete} 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </Button>
        )}
      </div>
    </div>
  );
}

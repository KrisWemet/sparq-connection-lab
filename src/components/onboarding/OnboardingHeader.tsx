
import React from 'react';

interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
}

export function OnboardingHeader({ step, totalSteps }: OnboardingHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Onboarding</h1>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all" 
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

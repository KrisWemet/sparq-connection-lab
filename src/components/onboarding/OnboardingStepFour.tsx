
import { Brain, Check, ThumbsUp } from "lucide-react";

export function OnboardingStepFour() {
  return (
    <div className="space-y-6">
      <div className="text-center p-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Brain className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
        <p className="text-muted-foreground">
          Thanks for sharing your information. We've personalized your experience based on your answers.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <ThumbsUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Your profile is ready</p>
              <p className="text-sm text-green-700">
                You can now start exploring all features of Sparq Connect and strengthen your relationship!
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-sm">Daily questions to strengthen your bond</p>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-sm">Relationship journeys tailored to your goals</p>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-sm">Date ideas to keep things fun and exciting</p>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-sm">Take the relationship health quiz to establish a baseline</p>
          </div>
        </div>
      </div>
    </div>
  );
}

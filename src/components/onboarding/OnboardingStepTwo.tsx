
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

interface OnboardingStepTwoProps {
  relationshipStatus: string;
  setRelationshipStatus: (value: string) => void;
  relationshipDuration: string;
  setRelationshipDuration: (value: string) => void;
}

export function OnboardingStepTwo({
  relationshipStatus,
  setRelationshipStatus,
  relationshipDuration,
  setRelationshipDuration
}: OnboardingStepTwoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center p-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Users className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Relationship</h2>
        <p className="text-muted-foreground">
          Tell us a bit about your current relationship status.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="relationship-status">Current Status</Label>
          <RadioGroup
            value={relationshipStatus}
            onValueChange={setRelationshipStatus}
            className="mt-2 grid grid-cols-1 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dating" id="status-dating" />
              <Label htmlFor="status-dating">Dating</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="engaged" id="status-engaged" />
              <Label htmlFor="status-engaged">Engaged</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="married" id="status-married" />
              <Label htmlFor="status-married">Married</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="complicated" id="status-complicated" />
              <Label htmlFor="status-complicated">It's Complicated</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="mt-4">
          <Label htmlFor="relationship-duration">How Long Together</Label>
          <RadioGroup
            value={relationshipDuration}
            onValueChange={setRelationshipDuration}
            className="mt-2 grid grid-cols-1 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="< 1 year" id="duration-1" />
              <Label htmlFor="duration-1">Less than 1 year</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1-3 years" id="duration-2" />
              <Label htmlFor="duration-2">1-3 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3-7 years" id="duration-3" />
              <Label htmlFor="duration-3">3-7 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="7+ years" id="duration-4" />
              <Label htmlFor="duration-4">7+ years</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

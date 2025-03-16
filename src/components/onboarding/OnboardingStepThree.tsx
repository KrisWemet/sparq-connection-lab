
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OnboardingStepThreeProps {
  sexualOrientation: string;
  setSexualOrientation: (value: string) => void;
  relationshipStructure: string;
  setRelationshipStructure: (value: string) => void;
  relationshipGoals: string[];
  setRelationshipGoals: (goals: string[]) => void;
}

export function OnboardingStepThree({
  sexualOrientation,
  setSexualOrientation,
  relationshipStructure,
  setRelationshipStructure,
  relationshipGoals,
  setRelationshipGoals
}: OnboardingStepThreeProps) {
  const handleGoalToggle = (goal: string) => {
    if (relationshipGoals.includes(goal)) {
      setRelationshipGoals(relationshipGoals.filter(g => g !== goal));
    } else {
      setRelationshipGoals([...relationshipGoals, goal]);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center p-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">More About You</h2>
        <p className="text-muted-foreground">
          These details will help personalize your experience.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="sexual-orientation">Sexual Orientation</Label>
          <Select 
            value={sexualOrientation}
            onValueChange={setSexualOrientation}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select orientation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="straight">Straight/Heterosexual</SelectItem>
              <SelectItem value="gay">Gay/Homosexual</SelectItem>
              <SelectItem value="bisexual">Bisexual</SelectItem>
              <SelectItem value="pansexual">Pansexual</SelectItem>
              <SelectItem value="asexual">Asexual</SelectItem>
              <SelectItem value="queer">Queer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="relationship-structure">Relationship Structure</Label>
          <Select 
            value={relationshipStructure}
            onValueChange={setRelationshipStructure}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select structure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monogamous">Monogamous</SelectItem>
              <SelectItem value="polyamorous">Polyamorous</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="long-distance">Long Distance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Relationship Goals</Label>
          <p className="text-sm text-muted-foreground mb-2">
            What are you hoping to achieve with Sparq Connect? (Select all that apply)
          </p>
          <div className="space-y-3 mt-1.5">
            {[
              { id: "communication", label: "Improve Communication" },
              { id: "intimacy", label: "Enhance Intimacy" },
              { id: "fun", label: "Have More Fun Together" },
              { id: "growth", label: "Personal & Relationship Growth" },
              { id: "conflict", label: "Better Conflict Resolution" },
              { id: "connection", label: "Deepen Emotional Connection" }
            ].map((goal) => (
              <div
                key={goal.id}
                className={`
                  p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-colors
                  ${relationshipGoals.includes(goal.id) ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}
                `}
                onClick={() => handleGoalToggle(goal.id)}
              >
                <span>{goal.label}</span>
                {relationshipGoals.includes(goal.id) && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

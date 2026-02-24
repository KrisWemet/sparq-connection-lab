import { Check, Compass } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface OnboardingStepTwoProps {
  onboardingGoals: string[];
  setOnboardingGoals: (goals: string[]) => void;
  preferredSessionTime: string;
  setPreferredSessionTime: (time: string) => void;
}

const GOAL_OPTIONS = [
  { id: "conflict", label: "We argue about the same things" },
  { id: "closeness", label: "I want to feel closer to my partner" },
  { id: "communication", label: "I want to be a better communicator" },
  { id: "maintain", label: "Our relationship is great \u2014 keep it that way" },
  { id: "rough-patch", label: "I'm going through a rough patch" },
  { id: "self-understanding", label: "I want to understand myself better as a partner" },
];

const TIME_OPTIONS = [
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "12:00 PM",
  "6:00 PM",
  "8:00 PM",
  "9:00 PM",
];

export function OnboardingStepTwo({
  onboardingGoals,
  setOnboardingGoals,
  preferredSessionTime,
  setPreferredSessionTime,
}: OnboardingStepTwoProps) {
  const handleGoalToggle = (goalId: string) => {
    if (onboardingGoals.includes(goalId)) {
      setOnboardingGoals(onboardingGoals.filter((g) => g !== goalId));
    } else if (onboardingGoals.length >= 3) {
      toast("Pick up to 3", { description: "Deselect one to choose a different one." });
    } else {
      setOnboardingGoals([...onboardingGoals, goalId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center p-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">What's on your mind?</h2>
        <p className="text-muted-foreground">
          Select what resonates most (pick up to 3)
        </p>
      </div>

      <div className="space-y-3">
        {GOAL_OPTIONS.map((goal) => {
          const selected = onboardingGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => handleGoalToggle(goal.id)}
              className={`w-full text-left p-3 border rounded-lg flex items-center justify-between transition-colors ${
                selected
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <span className="text-sm">{goal.label}</span>
              {selected && <Check className="h-5 w-5 text-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <Label>When would you like your daily session?</Label>
        <Select
          value={preferredSessionTime}
          onValueChange={setPreferredSessionTime}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Choose a time" />
          </SelectTrigger>
          <SelectContent>
            {TIME_OPTIONS.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

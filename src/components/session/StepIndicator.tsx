import { motion } from "framer-motion";

type SessionStep = "check-in" | "learn" | "implement" | "reflect" | "complete";

interface StepIndicatorProps {
  currentStep: SessionStep;
  showCheckIn: boolean;  // false on Day 1
}

const ALL_STEPS: { id: SessionStep; label: string }[] = [
  { id: "check-in", label: "Check-in" },
  { id: "learn", label: "Learn" },
  { id: "implement", label: "Implement" },
  { id: "reflect", label: "Reflect" },
];

export function StepIndicator({ currentStep, showCheckIn }: StepIndicatorProps) {
  const steps = showCheckIn ? ALL_STEPS : ALL_STEPS.filter(s => s.id !== "check-in");
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  // If currentStep is "complete", all steps are completed
  const isComplete = currentStep === "complete";

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = isComplete || index < currentIndex;
        const isFuture = !isActive && !isCompleted;

        return (
          <div key={step.id} className="flex flex-col items-center gap-1">
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.2 : 1,
                backgroundColor: isActive || isCompleted
                  ? "hsl(var(--primary))"
                  : isCompleted
                    ? "hsl(var(--primary) / 0.6)"
                    : "hsl(var(--muted))",
              }}
              transition={{ duration: 0.3 }}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: isActive || isCompleted
                  ? "hsl(var(--primary))"
                  : isFuture
                    ? "hsl(var(--muted))"
                    : "hsl(var(--primary) / 0.6)",
              }}
            />
            <span className="text-xs text-muted-foreground">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export type { SessionStep };

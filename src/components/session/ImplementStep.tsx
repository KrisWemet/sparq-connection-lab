import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ImplementStep as ImplementStepType } from "@/types/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ImplementStepProps {
  implement: ImplementStepType;
  onAccept: (actionId: string) => void;
  onSwap: () => void;
  showAlternative: boolean;
}

// Helper to get difficulty color based on phase
function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: i <= level 
              ? "var(--session-primary, hsl(var(--primary)))" 
              : "hsl(var(--muted))"
          }}
        />
      ))}
    </div>
  );
}

export function ImplementStep({ implement, onAccept, onSwap, showAlternative }: ImplementStepProps) {
  const [showingAlternative, setShowingAlternative] = useState(false);

  const currentAction = showingAlternative && implement.alternative
    ? implement.alternative
    : implement.microAction;

  const handleSwap = () => {
    setShowingAlternative(true);
    onSwap();
  };

  const handleAccept = () => {
    onAccept(currentAction.templateId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: "var(--archetype-glow, transparent)",
        borderRadius: "0.75rem",
        padding: "0.5rem",
      }}
    >
      <Card 
        className="bg-white dark:bg-card"
        style={{
          borderColor: "var(--session-primary, hsl(var(--border)))",
        }}
      >
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-3">
            <p 
              className="text-sm font-medium"
              style={{ color: "var(--session-accent, hsl(var(--muted-foreground)))" }}
            >
              Today's micro-action
            </p>

            <div className="flex justify-center">
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--session-surface, hsl(var(--primary) / 0.1))",
                  color: "var(--session-primary, hsl(var(--primary)))",
                }}
              >
                {currentAction.category}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentAction.templateId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-medium text-foreground text-center px-4"
              >
                {currentAction.personalizedText}
              </motion.p>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5">
                <DifficultyDots level={currentAction.difficulty} />
              </div>
              <span className="text-xs text-muted-foreground">
                ~{currentAction.estimatedMinutes} min
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Button
              variant="default"
              className="w-full"
              onClick={handleAccept}
            >
              I'm ready to try this
            </Button>

            {implement.alternative && !showAlternative && !showingAlternative && (
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={handleSwap}
              >
                What else feels right?
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * SessionComplete — The END moment of the session.
 *
 * Psychology: Peak-End Rule (Kahneman). This is the last impression —
 * it determines whether the user comes back tomorrow.
 *
 * Design principles:
 * 1. WARMTH — The celebration is genuine, not gamified hype
 * 2. IDENTITY REINFORCEMENT — Message echoes their chosen archetype
 * 3. SUBTLE PROGRESS — Streak shown as quiet confidence, not pressure
 * 4. CLOSURE — Clear "done" action with a sense of completion
 *
 * The animations are designed to feel like a warm exhale — the session
 * is complete, you've done good work, and you can feel good about it.
 */

import { motion } from "framer-motion";
import type { CelebrationMessage } from "@/types/session";
import { Button } from "@/components/ui/button";
import { SparqOtter } from "@/components/SparqOtter";

interface SessionCompleteProps {
  celebration: CelebrationMessage;
  onFinish: () => void;
  onSetReminder?: () => void;
}

export function SessionComplete({ celebration, onFinish, onSetReminder }: SessionCompleteProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div className="text-center space-y-6 px-4 max-w-sm">
        {/* Otter celebrates the completion */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
        >
          <SparqOtter mood="celebrate" size="lg" />
        </motion.div>

        {/* Main celebration text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold">{celebration.text}</h2>
          <p className="text-sm text-muted-foreground italic mt-2">
            {celebration.encouragement}
          </p>
        </motion.div>

        {/* Streak indicator — subtle, not pressuring */}
        {celebration.showStreak && celebration.streakCount && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm"
            style={{
              background: "var(--session-surface, hsl(var(--primary) / 0.1))",
              color: "var(--session-accent, hsl(var(--primary)))",
            }}
          >
            <span className="text-base">🔥</span>
            <span className="font-medium">{celebration.streakCount} day streak</span>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-3 pt-4"
        >
          <Button
            onClick={onFinish}
            className="w-full"
            style={{
              background: "var(--session-primary, hsl(var(--primary)))",
            }}
          >
            Done
          </Button>
          {onSetReminder && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSetReminder}
              className="w-full"
            >
              Set evening reminder
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

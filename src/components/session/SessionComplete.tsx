import { motion } from "framer-motion";
import type { CelebrationMessage } from "@/types/session";
import { Button } from "@/components/ui/button";

interface SessionCompleteProps {
  celebration: CelebrationMessage;
  onFinish: () => void;
  onSetReminder?: () => void;
}

export function SessionComplete({ celebration, onFinish, onSetReminder }: SessionCompleteProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div className="text-center space-y-6 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
        >
          <span className="text-primary text-2xl font-bold">✓</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold">{celebration.text}</h2>
          <p className="text-sm text-muted-foreground italic mt-2">{celebration.encouragement}</p>
        </motion.div>

        {celebration.showStreak && celebration.streakCount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm"
          >
            🔥 {celebration.streakCount} day streak
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3 pt-4"
        >
          <Button onClick={onFinish} className="w-full">Done</Button>
          {onSetReminder && (
            <Button variant="outline" size="sm" onClick={onSetReminder} className="w-full">
              Set evening reminder
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

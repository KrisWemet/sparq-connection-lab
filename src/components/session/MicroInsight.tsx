/**
 * MicroInsight — The PEAK moment of the session.
 *
 * Psychology: Peak-End Rule (Kahneman). People judge experiences based on the
 * emotional peak and the ending. This component IS the peak — it delivers the
 * strongest emotional moment by combining:
 *
 * 1. SURPRISE — Unexpected insight ("Here's what we noticed...")
 * 2. VALIDATION — Reflecting back what they shared as a strength
 * 3. GROWTH — Connecting it to their ongoing journey
 *
 * The animation is deliberately slow and warm — giving the insight time to land
 * emotionally before the user moves on. This pacing is itself a psychology tool:
 * it signals "this matters" and creates a moment of genuine reflection.
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MicroInsightProps {
  insight: string;
  onContinue: () => void;
}

export function MicroInsight({ insight, onContinue }: MicroInsightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-4"
    >
      <Card
        className="border-0 shadow-lg overflow-hidden"
        style={{
          background: "var(--session-surface, hsl(var(--card)))",
          borderLeft: "3px solid var(--session-primary, hsl(var(--primary)))",
        }}
      >
        <CardContent className="pt-6 pb-6 space-y-5">
          {/* Sparkle icon with gentle pulse */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <span className="text-3xl">✨</span>
          </motion.div>

          {/* Header — appears after the icon */}
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm font-medium text-center"
            style={{ color: "var(--session-primary, hsl(var(--primary)))" }}
          >
            Here's what we noticed...
          </motion.p>

          {/* The insight itself — the emotional peak.
              Delayed to build anticipation. */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-base text-foreground leading-relaxed text-center px-2"
          >
            {insight}
          </motion.p>

          {/* Continue button — delayed further to give the insight time to land.
              Psychology: Forcing a brief pause before the CTA ensures the user
              actually reads and absorbs the insight rather than clicking through. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0 }}
          >
            <Button
              onClick={onContinue}
              className="w-full"
              style={{
                background: "var(--session-primary, hsl(var(--primary)))",
              }}
            >
              Continue
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

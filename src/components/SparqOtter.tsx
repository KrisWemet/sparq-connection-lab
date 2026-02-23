import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * SparqOtter — The app mascot.
 *
 * A friendly otter with a lantern that appears throughout the app
 * to guide, celebrate, and encourage users on their journey.
 *
 * Moods control which animation variant plays:
 * - "idle"      — gentle float (default resting state)
 * - "waving"    — side-to-side tilt (greetings, onboarding)
 * - "thinking"  — slow pulse (loading/generating states)
 * - "celebrate" — bounce (session complete, achievements)
 * - "guiding"   — lantern glow pulse (mirror narrative, insights)
 */

export type OtterMood =
  | "idle"
  | "waving"
  | "thinking"
  | "celebrate"
  | "guiding";

export type OtterSize = "xs" | "sm" | "md" | "lg" | "xl";

interface SparqOtterProps {
  mood?: OtterMood;
  size?: OtterSize;
  className?: string;
  /** Optional speech bubble text */
  message?: string;
}

const SIZE_MAP: Record<OtterSize, string> = {
  xs: "w-10 h-10",
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

const ANIMATION_VARIANTS: Record<OtterMood, object> = {
  idle: {
    y: [0, -4, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  waving: {
    rotate: [0, -5, 5, -5, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  thinking: {
    scale: [1, 1.03, 1],
    opacity: [1, 0.85, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  celebrate: {
    y: [0, -12, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 0.6, repeat: 2, ease: "easeOut" },
  },
  guiding: {
    y: [0, -3, 0],
    filter: [
      "drop-shadow(0 0 8px rgba(255,200,50,0.3))",
      "drop-shadow(0 0 16px rgba(255,200,50,0.6))",
      "drop-shadow(0 0 8px rgba(255,200,50,0.3))",
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
};

export function SparqOtter({
  mood = "idle",
  size = "md",
  className,
  message,
}: SparqOtterProps) {
  const [imgSrc, setImgSrc] = useState("/images/sparq-otter.png");

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <motion.img
        src={imgSrc}
        alt="Sparq otter mascot"
        className={cn(SIZE_MAP[size], "object-contain")}
        animate={ANIMATION_VARIANTS[mood]}
        draggable={false}
        onError={() => setImgSrc("/images/sparq-otter.svg")}
      />
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-[200px] rounded-xl bg-white/90 dark:bg-card/90 backdrop-blur px-3 py-2 text-center shadow-sm"
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/90 dark:bg-card/90 rotate-45" />
          <p className="text-xs text-foreground relative z-10">{message}</p>
        </motion.div>
      )}
    </div>
  );
}

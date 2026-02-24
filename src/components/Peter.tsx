/**
 * Peter — Sparq's interactive floating otter mascot.
 *
 * Renders as a fixed-position overlay above all other UI.
 * Visual state is driven entirely by PeterContext (usePeter).
 *
 * Swapping in a Lottie animation later:
 *   Replace the <SparqOtter> inside the motion.div with a <Lottie> component,
 *   mapping OtterMood → Lottie animation segment names.
 */

import { AnimatePresence, motion } from "framer-motion";
import { usePeter } from "@/contexts/PeterContext";
import { SparqOtter } from "@/components/SparqOtter";

export function Peter() {
  const { state } = usePeter();
  const { mood, message, isVisible, position } = state;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="peter-overlay"
          className="fixed z-50 flex flex-col items-center pointer-events-none select-none"
          style={{
            right: position.right,
            bottom: position.bottom,
            // Smooth glide when moveTo() is called
            transition:
              "right 0.65s cubic-bezier(0.34,1.56,0.64,1), bottom 0.65s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
        >
          {/* ── Speech bubble (above the otter) ── */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 10, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.92 }}
                transition={{ type: "spring", damping: 22, stiffness: 320 }}
                className="relative mb-3 max-w-[210px] rounded-2xl bg-white dark:bg-card shadow-xl px-4 py-3 text-center"
                style={{
                  filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.13))",
                }}
              >
                <p className="text-sm leading-snug text-gray-800 dark:text-foreground">
                  {message}
                </p>
                {/* Triangle tail pointing down toward the otter */}
                <span
                  aria-hidden
                  className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 block w-[18px] h-[18px] bg-white dark:bg-card rotate-45 rounded-sm"
                  style={{ boxShadow: "3px 3px 6px rgba(0,0,0,0.07)" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Otter visual (swap-point for Lottie) ── */}
          <div className="pointer-events-auto">
            {/* LOTTIE SWAP POINT: replace <SparqOtter> with <Lottie> here */}
            <SparqOtter mood={mood} size="md" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

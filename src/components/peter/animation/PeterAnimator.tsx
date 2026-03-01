// ─── Peter Animation Adapter ───────────────────────────────────────
// Renders Peter's visual representation based on the current animation state.
//
// Priority: Rive (.riv) → Lottie (.json) → Static image → Inline SVG fallback.
// Respects prefers-reduced-motion.

import React, { memo, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PeterState } from "../peterMachine";

// ─── Props ─────────────────────────────────────────────────────────

interface PeterAnimatorProps {
  currentAnimation: string;
  state: PeterState;
  size?: number;
}

// ─── Animation Variants Per State ──────────────────────────────────
// When no Rive/Lottie asset exists, we animate the static image
// with framer-motion variants to convey each state.

const stateVariants: Record<
  string,
  { animate: Record<string, unknown>; transition: Record<string, unknown> }
> = {
  idle: {
    animate: { scale: [1, 1.03, 1], rotate: 0 },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  curious: {
    animate: { scale: 1.08, rotate: -6, y: -4 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  happy: {
    animate: { scale: [1, 1.06, 1], y: [0, -3, 0] },
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  },
  celebrate: {
    animate: { scale: [1, 1.12, 1], rotate: [0, 6, -6, 0], y: [0, -8, 0] },
    transition: { duration: 0.5, repeat: 2, ease: "easeInOut" },
  },
  thinking: {
    animate: { rotate: [0, 3, -3, 0] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  error: {
    animate: { x: [0, -3, 3, -3, 3, 0] },
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  sleep: {
    animate: { scale: [1, 0.97, 1], opacity: 0.7 },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── Inline SVG Fallback (cute otter face) ─────────────────────────

function OtterFallbackSVG({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Body */}
      <circle cx="40" cy="44" r="30" fill="#8B6914" />
      {/* Face light area */}
      <ellipse cx="40" cy="50" rx="21" ry="17" fill="#C4A44A" />
      {/* Left ear */}
      <circle cx="16" cy="20" r="8" fill="#8B6914" />
      <circle cx="16" cy="20" r="5" fill="#C4A44A" />
      {/* Right ear */}
      <circle cx="64" cy="20" r="8" fill="#8B6914" />
      <circle cx="64" cy="20" r="5" fill="#C4A44A" />
      {/* Left eye */}
      <circle cx="30" cy="38" r="5" fill="#1a1a1a" />
      <circle cx="31.5" cy="36.5" r="1.5" fill="#fff" />
      {/* Right eye */}
      <circle cx="50" cy="38" r="5" fill="#1a1a1a" />
      <circle cx="51.5" cy="36.5" r="1.5" fill="#fff" />
      {/* Nose */}
      <ellipse cx="40" cy="46" rx="4" ry="2.5" fill="#1a1a1a" />
      {/* Mouth */}
      <path
        d="M35 50 Q40 54 45 50"
        stroke="#6B4C10"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Whiskers left */}
      <line x1="10" y1="44" x2="24" y2="46" stroke="#6B4C10" strokeWidth="0.8" />
      <line x1="12" y1="48" x2="24" y2="48" stroke="#6B4C10" strokeWidth="0.8" />
      {/* Whiskers right */}
      <line x1="56" y1="46" x2="70" y2="44" stroke="#6B4C10" strokeWidth="0.8" />
      <line x1="56" y1="48" x2="68" y2="48" stroke="#6B4C10" strokeWidth="0.8" />
    </svg>
  );
}

// ─── Asset Detection ───────────────────────────────────────────────

type AssetType = "rive" | "lottie" | "image" | "svg-fallback";

function useDetectedAsset(): AssetType {
  const [assetType, setAssetType] = useState<AssetType>("svg-fallback");

  useEffect(() => {
    // Check for assets in priority order
    async function detect() {
      try {
        const riveRes = await fetch("/peter/peter.riv", { method: "HEAD" });
        if (riveRes.ok) {
          setAssetType("rive");
          return;
        }
      } catch {
        /* not found */
      }

      try {
        const lottieRes = await fetch("/peter/peter.json", { method: "HEAD" });
        if (lottieRes.ok) {
          setAssetType("lottie");
          return;
        }
      } catch {
        /* not found */
      }

      try {
        const pngRes = await fetch("/peter/peter.png", { method: "HEAD" });
        if (pngRes.ok) {
          setAssetType("image");
          return;
        }
      } catch {
        /* not found */
      }

      setAssetType("svg-fallback");
    }

    detect();
  }, []);

  return assetType;
}

// ─── Component ─────────────────────────────────────────────────────

export const PeterAnimator = memo(function PeterAnimator({
  currentAnimation,
  state,
  size = 72,
}: PeterAnimatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const assetType = useDetectedAsset();

  const variant = stateVariants[currentAnimation] ?? stateVariants.idle;

  // Reduced motion: no animation, just static render
  if (prefersReducedMotion) {
    return (
      <div style={{ width: size, height: size }} className="relative">
        {assetType === "image" ? (
          <img
            src="/peter/peter.png"
            alt="Peter the Otter"
            width={size}
            height={size}
            className="object-contain"
          />
        ) : (
          <OtterFallbackSVG size={size} />
        )}
        <StateIndicator state={state} />
      </div>
    );
  }

  // Rive and Lottie are loaded dynamically when assets exist.
  // For now, both fall through to the motion-animated static path.
  // When you add real .riv or .json assets, import RivePeter/LottiePeter here.

  return (
    <motion.div
      style={{ width: size, height: size }}
      className="relative"
      animate={variant.animate}
      transition={variant.transition}
    >
      {assetType === "image" ? (
        <img
          src="/peter/peter.png"
          alt="Peter the Otter"
          width={size}
          height={size}
          className="w-full h-full object-contain"
        />
      ) : (
        <OtterFallbackSVG size={size} />
      )}
      <StateIndicator state={state} />
    </motion.div>
  );
});

// ─── State Indicator Dot ───────────────────────────────────────────

function StateIndicator({ state }: { state: PeterState }) {
  const colors: Partial<Record<PeterState, string>> = {
    thinking: "bg-blue-400",
    error: "bg-red-400",
    celebrate: "bg-yellow-400",
    sleep: "bg-gray-400",
  };

  const color = colors[state];
  if (!color) return null;

  return (
    <span
      className={`absolute -top-0.5 -right-0.5 w-3 h-3 ${color} rounded-full border-2 border-white animate-pulse`}
      aria-hidden="true"
    />
  );
}

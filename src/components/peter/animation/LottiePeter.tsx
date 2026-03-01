// ─── Lottie Adapter for Peter ──────────────────────────────────────
// Stub: Swap this in when you have a real peter.json Lottie asset.
//
// To use:
// 1. npm install lottie-react
// 2. Place peter.json (Lottie animation) in public/peter/
// 3. Import this component in PeterAnimator.tsx
//
// Example implementation:
//
// import Lottie from "lottie-react";
// import { useEffect, useState } from "react";
//
// const SEGMENT_MAP: Record<string, [number, number]> = {
//   idle: [0, 60],
//   curious: [60, 90],
//   happy: [90, 120],
//   celebrate: [120, 180],
//   thinking: [180, 240],
//   error: [240, 270],
//   sleep: [270, 330],
// };
//
// export function LottiePeter({ animation, size }: { animation: string; size: number }) {
//   const [animData, setAnimData] = useState(null);
//
//   useEffect(() => {
//     fetch("/peter/peter.json").then(r => r.json()).then(setAnimData);
//   }, []);
//
//   const segment = SEGMENT_MAP[animation] ?? SEGMENT_MAP.idle;
//
//   if (!animData) return null;
//
//   return (
//     <Lottie
//       animationData={animData}
//       loop
//       initialSegment={segment}
//       style={{ width: size, height: size }}
//     />
//   );
// }

import React from "react";

interface LottiePeterProps {
  animation: string;
  size: number;
}

export function LottiePeter({ size }: LottiePeterProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center bg-gray-100 rounded-full text-xs text-gray-400"
    >
      .json
    </div>
  );
}

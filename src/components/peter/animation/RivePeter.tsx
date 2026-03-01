// ─── Rive Adapter for Peter ────────────────────────────────────────
// Stub: Swap this in when you have a real peter.riv asset.
//
// To use:
// 1. npm install @rive-app/react-canvas
// 2. Place peter.riv in public/peter/
// 3. Import this component in PeterAnimator.tsx
//
// Example implementation:
//
// import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
//
// export function RivePeter({ animation, size }: { animation: string; size: number }) {
//   const { RiveComponent, rive } = useRive({
//     src: "/peter/peter.riv",
//     stateMachines: "PeterStates",
//     autoplay: true,
//   });
//
//   const stateInput = useStateMachineInput(rive, "PeterStates", "state");
//
//   useEffect(() => {
//     if (stateInput) stateInput.value = animationToStateValue(animation);
//   }, [animation, stateInput]);
//
//   return <RiveComponent style={{ width: size, height: size }} />;
// }

import React from "react";

interface RivePeterProps {
  animation: string;
  size: number;
}

export function RivePeter({ size }: RivePeterProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center bg-gray-100 rounded-full text-xs text-gray-400"
    >
      .riv
    </div>
  );
}

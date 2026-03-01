// ─── Peter the Otter — Public API ──────────────────────────────────

// Hook for components to interact with Peter
export { usePeter } from "./usePeter";

// Event bus for direct event emission
export { emitPeter, subscribeToPeter, setPeterEnabled } from "./peterEvents";
export type { PeterEvent, PeterMessage, PeterMessageKind } from "./peterEvents";

// Message router for the coaching voice layer
export { routeToPeter } from "./messageRouter";

// State machine types
export type { PeterState, TransitionResult } from "./peterMachine";

// UI component (usually mounted once in _app.tsx)
export { PeterAssistant } from "./PeterAssistant";

// Demo panel for development
export { PeterDemoPanel } from "./PeterDemoPanel";

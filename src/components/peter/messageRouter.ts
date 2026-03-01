// ─── Peter Message Router ──────────────────────────────────────────
// Routes guidance/coaching messages through Peter.
// Applies defaults and emits SHOW_MESSAGE events.

import type { PeterMessage } from "./peterEvents";
import { emitPeter } from "./peterEvents";

// ─── Default Auto-Hide Durations ───────────────────────────────────

const DEFAULT_AUTO_HIDE_MS: Record<string, number> = {
  low: 4000,
  normal: 6000,
  high: 0, // high-priority messages stay until dismissed
};

// ─── Router ────────────────────────────────────────────────────────

export function routeToPeter(message: PeterMessage): void {
  const priority = message.priority ?? "normal";

  const withDefaults: PeterMessage = {
    autoHideMs: DEFAULT_AUTO_HIDE_MS[priority],
    priority,
    ...message,
  };

  emitPeter({ type: "SHOW_MESSAGE", payload: withDefaults });
}

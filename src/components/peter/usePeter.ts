// ─── usePeter() Hook ───────────────────────────────────────────────
// Convenience API for triggering Peter from any component.
// Does not hold state — PeterAssistant is the single state owner.

import { useCallback } from "react";
import { emitPeter, setPeterEnabled } from "./peterEvents";
import type { PeterEvent, PeterMessage, PeterMessageKind } from "./peterEvents";
import { routeToPeter } from "./messageRouter";

interface PeterOptions {
  priority?: PeterMessage["priority"];
  autoHideMs?: number;
  actions?: PeterMessage["actions"];
}

export function usePeter() {
  const say = useCallback(
    (kind: PeterMessageKind, text: string, options?: PeterOptions) => {
      routeToPeter({ kind, text, ...options });
    },
    []
  );

  const tip = useCallback((text: string, options?: PeterOptions) => {
    routeToPeter({ kind: "tip", text, priority: "low", autoHideMs: 5000, ...options });
  }, []);

  const next = useCallback(
    (text: string, actions?: PeterMessage["actions"]) => {
      routeToPeter({ kind: "next_step", text, actions, priority: "normal" });
    },
    []
  );

  const success = useCallback((text?: string) => {
    routeToPeter({
      kind: "success",
      text: text ?? "Done.",
      autoHideMs: 3000,
      priority: "normal",
    });
  }, []);

  const errorHelp = useCallback(
    (text: string, actions?: PeterMessage["actions"]) => {
      routeToPeter({ kind: "error_help", text, actions, priority: "high" });
    },
    []
  );

  const emit = useCallback((event: PeterEvent) => {
    emitPeter(event);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setPeterEnabled(enabled);
  }, []);

  return { say, tip, next, success, errorHelp, emit, setEnabled };
}

// ─── Peter Event Bus ───────────────────────────────────────────────
// Singleton typed event emitter, SSR-safe, zero dependencies.

// ─── Types ─────────────────────────────────────────────────────────

export type PeterMessageKind =
  | "onboarding"
  | "tip"
  | "next_step"
  | "success"
  | "error_help"
  | "warning"
  | "info";

export interface PeterMessage {
  kind: PeterMessageKind;
  text: string;
  priority?: "low" | "normal" | "high";
  autoHideMs?: number;
  actions?: Array<{ label: string; event: PeterEvent }>;
}

export type PeterEvent =
  | { type: "APP_READY" }
  | { type: "NAVIGATED"; path: string }
  | { type: "HOVER_CTA" }
  | { type: "CLICK_CTA" }
  | { type: "FORM_SUBMIT_START" }
  | { type: "FORM_SUBMIT_SUCCESS" }
  | { type: "FORM_SUBMIT_ERROR"; message?: string }
  | { type: "USER_INACTIVE" }
  | { type: "USER_ACTIVE" }
  | { type: "DISMISS_BUBBLE" }
  | { type: "TOGGLE_MINIMIZE" }
  | { type: "SHOW_MESSAGE"; payload: PeterMessage };

// ─── Event Bus ─────────────────────────────────────────────────────

type PeterListener = (event: PeterEvent) => void;

const listeners = new Set<PeterListener>();

let _enabled = true;

export function emitPeter(event: PeterEvent): void {
  if (!_enabled && event.type !== "TOGGLE_MINIMIZE") return;
  listeners.forEach((fn) => {
    try {
      fn(event);
    } catch (e) {
      console.error("[Peter] Listener error:", e);
    }
  });
}

export function subscribeToPeter(listener: PeterListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setPeterEnabled(enabled: boolean): void {
  _enabled = enabled;
  if (!enabled) {
    emitPeter({ type: "TOGGLE_MINIMIZE" });
  }
}

export function isPeterEnabled(): boolean {
  return _enabled;
}

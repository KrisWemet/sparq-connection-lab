// ─── Peter State Machine ───────────────────────────────────────────
// Pure logic. No DOM, no side effects.
// Maps (currentState, event) → next state + animation + speech.

import type { PeterEvent, PeterMessage } from "./peterEvents";

// ─── Types ─────────────────────────────────────────────────────────

export type PeterState =
  | "hidden"
  | "idle"
  | "curious"
  | "happy"
  | "celebrate"
  | "thinking"
  | "error"
  | "sleep";

export interface TransitionResult {
  state: PeterState;
  animation: string;
  /** Set to a string to show speech, null to dismiss, undefined to keep current. */
  speech?: string | null;
  /** Full message object when triggered via SHOW_MESSAGE. */
  message?: PeterMessage | null;
  /** Schedule a follow-up event after a delay. */
  scheduledTransition?: { event: PeterEvent; delayMs: number };
}

// ─── Animation Map ─────────────────────────────────────────────────

const ANIMATION_MAP: Record<PeterState, string> = {
  hidden: "idle",
  idle: "idle",
  curious: "curious",
  happy: "happy",
  celebrate: "celebrate",
  thinking: "thinking",
  error: "error",
  sleep: "sleep",
};

// ─── Helpers ───────────────────────────────────────────────────────

function messageKindToState(kind: PeterMessage["kind"]): PeterState | null {
  switch (kind) {
    case "success":
      return "celebrate";
    case "error_help":
    case "warning":
      return "error";
    case "tip":
    case "info":
      return "curious";
    case "onboarding":
    case "next_step":
      return "happy";
    default:
      return null;
  }
}

function base(state: PeterState, extra?: Partial<TransitionResult>): TransitionResult {
  return {
    state,
    animation: ANIMATION_MAP[state],
    ...extra,
  };
}

// ─── Transition Function ───────────────────────────────────────────

export function transition(current: PeterState, event: PeterEvent): TransitionResult {
  switch (event.type) {
    case "APP_READY":
      return base("idle");

    case "NAVIGATED":
      if (current === "hidden") return base("hidden");
      return base("idle", { speech: null });

    case "HOVER_CTA":
      if (current === "idle" || current === "sleep") return base("curious");
      return base(current);

    case "CLICK_CTA":
      return base("happy");

    case "FORM_SUBMIT_START":
      return base("thinking", { speech: "On it..." });

    case "FORM_SUBMIT_SUCCESS":
      return base("celebrate", {
        speech: "Nice. That worked.",
        scheduledTransition: {
          event: { type: "USER_ACTIVE" },
          delayMs: 2500,
        },
      });

    case "FORM_SUBMIT_ERROR":
      return base("error", {
        speech: event.message || "Something went sideways. Let's fix it.",
        scheduledTransition: {
          event: { type: "USER_ACTIVE" },
          delayMs: 5000,
        },
      });

    case "USER_INACTIVE":
      if (current === "idle" || current === "happy") {
        return base("sleep", { speech: null });
      }
      return base(current);

    case "USER_ACTIVE":
      if (current === "sleep" || current === "error") {
        return base("idle", { speech: null });
      }
      if (current === "celebrate") return base("happy", { speech: null });
      return base("idle");

    case "DISMISS_BUBBLE":
      return base(current, { speech: null, message: null });

    case "TOGGLE_MINIMIZE":
      return current === "hidden" ? base("idle") : base("hidden", { speech: null });

    case "SHOW_MESSAGE": {
      const msg = event.payload;
      const nextState = messageKindToState(msg.kind) ?? current;
      return base(nextState === "hidden" ? "idle" : nextState, {
        speech: msg.text,
        message: msg,
      });
    }

    default:
      return base(current);
  }
}

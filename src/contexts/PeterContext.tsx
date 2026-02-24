import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { OtterMood } from "@/components/SparqOtter";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PeterPosition {
  right: number;
  bottom: number;
}

export interface PeterState {
  mood: OtterMood;
  message: string | null;
  isVisible: boolean;
  position: PeterPosition;
}

export interface PeterContextType {
  state: PeterState;
  /** Show a speech bubble message with optional mood and auto-dismiss duration (ms, 0 = no dismiss) */
  say: (message: string, mood?: OtterMood, duration?: number) => void;
  /** Smoothly slide Peter to a new screen position (right/bottom in px) */
  moveTo: (right: number, bottom: number) => void;
  /** Celebration burst — jumpy otter + enthusiastic message */
  celebrate: (message?: string) => void;
  /** Return to quiet idle float — clears any message */
  idle: () => void;
  /** Wave greeting with optional message */
  wave: (message?: string) => void;
  /** Hide Peter entirely */
  hide: () => void;
  /** Show Peter again */
  show: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const IDLE_TIMEOUT_MS = 30_000;

const IDLE_PROMPTS = [
  "Hey! Ready to connect with your best self? 🌟",
  "Still here! Your daily session is waiting 💪",
  "A quick question can change your whole day ✨",
  "I believe in you! Let's do today's session 🦦",
  "Five minutes could deepen everything 💕",
];

const DEFAULT_POSITION: PeterPosition = { right: 24, bottom: 24 };

// ─── Context ─────────────────────────────────────────────────────────────────

const PeterContext = createContext<PeterContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function PeterProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PeterState>({
    mood: "idle",
    message: null,
    isVisible: true,
    position: DEFAULT_POSITION,
  });

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleShownRef = useRef(false);

  const clearDismiss = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const say = useCallback(
    (message: string, mood: OtterMood = "idle", duration = 5000) => {
      clearDismiss();
      setState((prev) => ({ ...prev, mood, message, isVisible: true }));
      if (duration > 0) {
        dismissTimerRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, message: null, mood: "idle" }));
        }, duration);
      }
    },
    [clearDismiss]
  );

  const moveTo = useCallback((right: number, bottom: number) => {
    setState((prev) => ({ ...prev, position: { right, bottom } }));
  }, []);

  const celebrate = useCallback(
    (message?: string) => {
      say(message ?? "You did it! Amazing work! 🎉", "celebrate", 5000);
    },
    [say]
  );

  const idle = useCallback(() => {
    clearDismiss();
    setState((prev) => ({ ...prev, mood: "idle", message: null }));
  }, [clearDismiss]);

  const wave = useCallback(
    (message?: string) => {
      say(message ?? "Hey there! 👋", "waving", 4000);
    },
    [say]
  );

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const show = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: true }));
  }, []);

  // ── 30-second idle detection ──────────────────────────────────────────────
  useEffect(() => {
    const resetIdleTimer = () => {
      idleShownRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (!idleShownRef.current) {
          idleShownRef.current = true;
          const prompt =
            IDLE_PROMPTS[Math.floor(Math.random() * IDLE_PROMPTS.length)];
          say(prompt, "waving", 8000);
        }
      }, IDLE_TIMEOUT_MS);
    };

    const events: string[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];
    events.forEach((e) =>
      window.addEventListener(e, resetIdleTimer, { passive: true })
    );
    resetIdleTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [say]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearDismiss();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [clearDismiss]);

  return (
    <PeterContext.Provider
      value={{ state, say, moveTo, celebrate, idle, wave, hide, show }}
    >
      {children}
    </PeterContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePeter(): PeterContextType {
  const ctx = useContext(PeterContext);
  if (!ctx) throw new Error("usePeter must be used inside <PeterProvider>");
  return ctx;
}

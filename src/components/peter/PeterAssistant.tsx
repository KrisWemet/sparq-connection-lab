// ─── PeterAssistant ────────────────────────────────────────────────
// Global overlay component. Mount once at the app root.
// Owns Peter's state, subscribes to the event bus, renders animation + bubble.

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Minus, Bug } from "lucide-react";
import { subscribeToPeter, emitPeter } from "./peterEvents";
import type { PeterEvent, PeterMessage } from "./peterEvents";
import { transition } from "./peterMachine";
import type { PeterState, TransitionResult } from "./peterMachine";
import { PeterAnimator } from "./animation/PeterAnimator";

// ─── Constants ─────────────────────────────────────────────────────

const PETER_SIZE = 64;
const PETER_SIZE_MINIMIZED = 36;
const BUBBLE_MAX_WIDTH = 280;
const INITIAL_GREETING_DELAY = 1200;

// ─── Component ─────────────────────────────────────────────────────

export const PeterAssistant = memo(function PeterAssistant() {
  // ─── State ───────────────────────────────────────────────────────
  const [state, setState] = useState<PeterState>("hidden");
  const [speech, setSpeech] = useState<string | null>(null);
  const [message, setMessage] = useState<PeterMessage | null>(null);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [debug, setDebug] = useState(false);
  const [lastEvent, setLastEvent] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Refs for stable access inside event listener
  const stateRef = useRef<PeterState>("hidden");
  const scheduledRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion = useReducedMotion();

  // Keep ref in sync
  stateRef.current = state;

  // ─── Drag state ──────────────────────────────────────────────────
  const constraintsRef = useRef<HTMLDivElement>(null);

  // ─── SSR guard ───────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Event subscription ──────────────────────────────────────────
  const processEvent = useCallback((event: PeterEvent) => {
    setLastEvent(event.type);

    const result: TransitionResult = transition(stateRef.current, event);

    setState(result.state);
    stateRef.current = result.state;

    // Speech management
    if (result.speech !== undefined) {
      setSpeech(result.speech);
      if (result.speech) {
        setBubbleOpen(true);
      }
    }

    // Message management
    if (result.message !== undefined) {
      setMessage(result.message ?? null);
    }

    // Scheduled auto-transition
    if (scheduledRef.current) {
      clearTimeout(scheduledRef.current);
      scheduledRef.current = null;
    }
    if (result.scheduledTransition) {
      const { event: followUp, delayMs } = result.scheduledTransition;
      scheduledRef.current = setTimeout(() => {
        emitPeter(followUp);
      }, delayMs);
    }

    // Auto-hide bubble
    if (autoHideRef.current) {
      clearTimeout(autoHideRef.current);
      autoHideRef.current = null;
    }
    if (result.message?.autoHideMs && result.message.autoHideMs > 0) {
      autoHideRef.current = setTimeout(() => {
        setSpeech(null);
        setMessage(null);
        setBubbleOpen(false);
      }, result.message.autoHideMs);
    }
  }, []);

  useEffect(() => {
    const unsub = subscribeToPeter(processEvent);

    // Fire APP_READY after a short delay so the app has time to render
    const readyTimer = setTimeout(() => {
      emitPeter({ type: "APP_READY" });
    }, INITIAL_GREETING_DELAY);

    return () => {
      unsub();
      clearTimeout(readyTimer);
      if (scheduledRef.current) clearTimeout(scheduledRef.current);
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
    };
  }, [processEvent]);

  // ─── Inactivity detection ────────────────────────────────────────
  useEffect(() => {
    let inactiveTimer: ReturnType<typeof setTimeout>;

    function resetInactiveTimer() {
      clearTimeout(inactiveTimer);
      if (stateRef.current === "sleep") {
        emitPeter({ type: "USER_ACTIVE" });
      }
      inactiveTimer = setTimeout(() => {
        emitPeter({ type: "USER_INACTIVE" });
      }, 60_000); // 60s inactivity → sleep
    }

    const events = ["mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetInactiveTimer, { passive: true }));
    resetInactiveTimer();

    return () => {
      clearTimeout(inactiveTimer);
      events.forEach((e) => window.removeEventListener(e, resetInactiveTimer));
    };
  }, []);

  // ─── Debug toggle: Ctrl+Shift+P ─────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setDebug((d) => !d);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleOtterClick = useCallback(() => {
    if (state === "hidden") {
      emitPeter({ type: "TOGGLE_MINIMIZE" });
    } else {
      setBubbleOpen((prev) => !prev);
    }
  }, [state]);

  const handleDismissBubble = useCallback(() => {
    emitPeter({ type: "DISMISS_BUBBLE" });
    setBubbleOpen(false);
  }, []);

  const handleMinimize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emitPeter({ type: "TOGGLE_MINIMIZE" });
  }, []);

  const handleActionClick = useCallback((event: PeterEvent) => {
    emitPeter(event);
    setBubbleOpen(false);
  }, []);

  // ─── Don't render on server ──────────────────────────────────────
  if (!mounted) return null;

  const isMinimized = state === "hidden";
  const currentSize = isMinimized ? PETER_SIZE_MINIMIZED : PETER_SIZE;
  const actions = message?.actions;

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden={isMinimized}
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.1}
        className="absolute bottom-5 right-5 pointer-events-auto flex flex-col items-end"
        style={{ touchAction: "none" }}
      >
        {/* ─── Speech Bubble ──────────────────────────────── */}
        <AnimatePresence>
          {bubbleOpen && speech && !isMinimized && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mb-2 mr-1 p-3 bg-white text-gray-800 rounded-xl shadow-lg border border-gray-100 relative"
              style={{ maxWidth: BUBBLE_MAX_WIDTH }}
            >
              {/* Close button */}
              <button
                onClick={handleDismissBubble}
                className="absolute top-1.5 right-1.5 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Dismiss"
              >
                <X size={12} />
              </button>

              {/* Speech text */}
              <p className="text-sm leading-relaxed pr-4">{speech}</p>

              {/* Action buttons */}
              {actions && actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {actions.slice(0, 3).map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleActionClick(action.event)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Bubble tail */}
              <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Peter Character ────────────────────────────── */}
        <div className="relative group">
          <button
            onClick={handleOtterClick}
            className="relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
            aria-label={
              isMinimized
                ? "Show Peter the Otter assistant"
                : "Toggle Peter's speech bubble"
            }
          >
            <PeterAnimator
              currentAnimation={isMinimized ? "idle" : state}
              state={state}
              size={currentSize}
            />
          </button>

          {/* Minimize button (visible on hover, not when already minimized) */}
          {!isMinimized && (
            <button
              onClick={handleMinimize}
              className="absolute -top-1 -left-1 p-0.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Minimize Peter"
            >
              <Minus size={10} />
            </button>
          )}
        </div>

        {/* ─── Debug Panel ────────────────────────────────── */}
        <AnimatePresence>
          {debug && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 p-2 bg-gray-900 text-gray-100 rounded-lg text-[10px] font-mono leading-tight shadow-lg overflow-hidden"
              style={{ maxWidth: BUBBLE_MAX_WIDTH }}
            >
              <div className="flex items-center gap-1 mb-1 text-yellow-400">
                <Bug size={10} />
                <span className="font-bold">PETER DEBUG</span>
              </div>
              <div>state: <span className="text-green-400">{state}</span></div>
              <div>lastEvent: <span className="text-blue-400">{lastEvent || "—"}</span></div>
              <div>speech: <span className="text-purple-400">{speech ? `"${speech.slice(0, 40)}..."` : "null"}</span></div>
              <div>bubble: <span className="text-cyan-400">{bubbleOpen ? "open" : "closed"}</span></div>
              <div className="mt-1 text-gray-500">Ctrl+Shift+P to toggle</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

export default PeterAssistant;

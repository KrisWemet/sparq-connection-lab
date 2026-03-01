// ─── Peter Demo Panel ──────────────────────────────────────────────
// Debug/demo panel for testing Peter events and messages.
// Use this during development to trigger all Peter states.
//
// Usage: <PeterDemoPanel /> in any page, or visit /peter-demo

import React, { useState, useCallback } from "react";
import { usePeter } from "./usePeter";
import { emitPeter } from "./peterEvents";
import type { PeterEvent } from "./peterEvents";

interface DemoButton {
  label: string;
  color: string;
  action: () => void;
}

export function PeterDemoPanel() {
  const peter = usePeter();
  const [formState, setFormState] = useState<"idle" | "submitting" | "done">("idle");

  // ─── Simulated form ──────────────────────────────────────────────
  const handleFormSubmit = useCallback(
    async (shouldFail: boolean) => {
      setFormState("submitting");
      emitPeter({ type: "FORM_SUBMIT_START" });

      // Simulate async operation
      await new Promise((r) => setTimeout(r, 1500));

      if (shouldFail) {
        emitPeter({
          type: "FORM_SUBMIT_ERROR",
          message: "Quick fix — check that email format.",
        });
      } else {
        emitPeter({ type: "FORM_SUBMIT_SUCCESS" });
      }
      setFormState("done");
      setTimeout(() => setFormState("idle"), 2000);
    },
    []
  );

  // ─── Event buttons ───────────────────────────────────────────────
  const eventButtons: DemoButton[] = [
    {
      label: "HOVER_CTA",
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      action: () => emitPeter({ type: "HOVER_CTA" }),
    },
    {
      label: "CLICK_CTA",
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      action: () => emitPeter({ type: "CLICK_CTA" }),
    },
    {
      label: "USER_INACTIVE",
      color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      action: () => emitPeter({ type: "USER_INACTIVE" }),
    },
    {
      label: "USER_ACTIVE",
      color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      action: () => emitPeter({ type: "USER_ACTIVE" }),
    },
    {
      label: "TOGGLE_MINIMIZE",
      color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
      action: () => emitPeter({ type: "TOGGLE_MINIMIZE" }),
    },
    {
      label: "DISMISS_BUBBLE",
      color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      action: () => emitPeter({ type: "DISMISS_BUBBLE" }),
    },
  ];

  // ─── Message buttons ─────────────────────────────────────────────
  const messageButtons: DemoButton[] = [
    {
      label: "Tip",
      color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
      action: () => peter.tip("Want the fast way? Start with your daily question."),
    },
    {
      label: "Success",
      color: "bg-green-100 text-green-700 hover:bg-green-200",
      action: () => peter.success("Profile updated. Looking good."),
    },
    {
      label: "Error Help",
      color: "bg-red-100 text-red-700 hover:bg-red-200",
      action: () =>
        peter.errorHelp("That didn't save. Want to try again?", [
          { label: "Retry", event: { type: "FORM_SUBMIT_START" } },
          { label: "Dismiss", event: { type: "DISMISS_BUBBLE" } },
        ]),
    },
    {
      label: "Next Step",
      color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
      action: () =>
        peter.next("Your profile's set. Ready to explore journeys?", [
          { label: "Show Journeys", event: { type: "NAVIGATED", path: "/journeys" } },
          { label: "Maybe Later", event: { type: "DISMISS_BUBBLE" } },
        ]),
    },
    {
      label: "Onboarding",
      color: "bg-teal-100 text-teal-700 hover:bg-teal-200",
      action: () =>
        peter.say("onboarding", "This is your control center. Want the quick tour?", {
          actions: [
            { label: "Yes, show me", event: { type: "CLICK_CTA" } },
            { label: "I'll explore", event: { type: "DISMISS_BUBBLE" } },
          ],
        }),
    },
    {
      label: "Warning",
      color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
      action: () =>
        peter.say("warning", "Heads up — your streak resets at midnight."),
    },
  ];

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Peter the Otter — Demo Panel
        </h2>
        <p className="text-sm text-gray-500">
          Test all Peter events and message types. Press{" "}
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
            Ctrl+Shift+P
          </kbd>{" "}
          to toggle debug overlay.
        </p>
      </div>

      {/* Raw Events */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Raw Events</h3>
        <div className="flex flex-wrap gap-2">
          {eventButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${btn.color}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      {/* Message Router */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Message Router (usePeter)
        </h3>
        <div className="flex flex-wrap gap-2">
          {messageButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${btn.color}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      {/* Simulated Form */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Form Simulation
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          Simulates a form submit with Peter reacting to start/success/error.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleFormSubmit(false)}
            disabled={formState === "submitting"}
            onMouseEnter={() => emitPeter({ type: "HOVER_CTA" })}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {formState === "submitting" ? "Submitting..." : "Submit (Success)"}
          </button>
          <button
            onClick={() => handleFormSubmit(true)}
            disabled={formState === "submitting"}
            onMouseEnter={() => emitPeter({ type: "HOVER_CTA" })}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {formState === "submitting" ? "Submitting..." : "Submit (Error)"}
          </button>
        </div>
      </section>

      {/* Enable/Disable */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Controls</h3>
        <div className="flex gap-2">
          <button
            onClick={() => peter.setEnabled(false)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Disable Peter
          </button>
          <button
            onClick={() => peter.setEnabled(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
          >
            Enable Peter
          </button>
        </div>
      </section>
    </div>
  );
}

export default PeterDemoPanel;

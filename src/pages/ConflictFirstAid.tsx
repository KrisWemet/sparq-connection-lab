import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, HeartPulse, ShieldCheck } from "lucide-react";

type Emotion = "Anger" | "Sadness" | "Fear" | "Overwhelmed";

type IntensityBand = "low" | "medium" | "high";

const emotionOptions: Array<{ value: Emotion; description: string }> = [
  { value: "Anger", description: "Hot, frustrated, or sharp" },
  { value: "Sadness", description: "Hurt, heavy, or tender" },
  { value: "Fear", description: "Anxious, worried, or unsafe" },
  { value: "Overwhelmed", description: "Flooded, too much at once" },
];

const scripts: Record<Emotion, Record<IntensityBand, string>> = {
  Anger: {
    high: "Say this: \"I need a 10-minute pause before I say something I don't mean. I care about this, and I'll come back.\"",
    medium: "Say this: \"I'm getting heated. Can we slow down so I can stay kind?\"",
    low: "Say this: \"I'm feeling tense. Can we reset and try that again gently?\"",
  },
  Sadness: {
    high: "Say this: \"I'm feeling really heavy. I need a few minutes to breathe before we keep talking.\"",
    medium: "Say this: \"I'm sad and a bit flooded. Can we hold this gently and speak slower?\"",
    low: "Say this: \"I'm a little hurt. Can we soften our tone and stay close?\"",
  },
  Fear: {
    high: "Say this: \"I'm feeling scared and need reassurance. Can we pause and come back when I feel safe?\"",
    medium: "Say this: \"I'm anxious about where this is going. Can we remind each other we're on the same team?\"",
    low: "Say this: \"I'm uneasy. Can we take a breath and keep this gentle?\"",
  },
  Overwhelmed: {
    high: "Say this: \"My nervous system is overloaded. I need a 10-minute reset before I can listen well.\"",
    medium: "Say this: \"I'm getting overwhelmed. Can we take this one point at a time?\"",
    low: "Say this: \"I'm a bit overloaded. Can we slow the pace and simplify?\"",
  },
};

const nextSteps: Record<IntensityBand, string[]> = {
  low: [
    "Drop your shoulders and unclench your jaw.",
    "Inhale for 4, hold for 4, exhale for 6.",
    "Say the script in a calm, low voice.",
  ],
  medium: [
    "Plant both feet on the floor and feel the ground.",
    "Take three slow breaths (4-in, 4-hold, 6-out).",
    "Ask for one clear request or pause.",
  ],
  high: [
    "Step back or sit down to reduce intensity.",
    "Breathe 4-in, hold 4, exhale 8 to lower adrenaline.",
    "Request a 10-minute reset and agree on a return time.",
  ],
};

export default function ConflictFirstAid() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [intensity, setIntensity] = useState(5);
  const [emotion, setEmotion] = useState<Emotion | null>(null);

  const intensityBand: IntensityBand = useMemo(() => {
    if (intensity >= 7) return "high";
    if (intensity >= 4) return "medium";
    return "low";
  }, [intensity]);

  const script = useMemo(() => {
    if (!emotion) return null;
    return scripts[emotion][intensityBand];
  }, [emotion, intensityBand]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Conflict First Aid</p>
            <h1 className="text-xl font-bold text-slate-900">Find calm in under 60 seconds</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">
                <HeartPulse className="h-4 w-4" />
                Immediate Calm
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Hit the Panic Button</h2>
              <p className="text-slate-600 max-w-xl">
                When things feel hot, this page gives you one clear script and a quick body reset. Tap the
                button to begin.
              </p>
            </div>
            <button
              onClick={() => setStarted(true)}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-rose-500 text-white text-lg font-semibold shadow-lg hover:bg-rose-600 transition-colors"
            >
              Panic Button
            </button>
          </div>
        </section>

        {started && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">1. How intense is it right now?</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={intensity}
                  onChange={(event) => setIntensity(Number(event.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="min-w-[72px] text-center">
                  <div className="text-2xl font-bold text-indigo-700">{intensity}</div>
                  <div className="text-xs text-slate-500">/ 10</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-600">
                Intensity: <span className="font-semibold capitalize text-slate-800">{intensityBand}</span>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">2. What is the core emotion?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {emotionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEmotion(option.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      emotion === option.value
                        ? "border-indigo-600 bg-indigo-50 shadow-sm"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-base font-semibold text-slate-900">{option.value}</div>
                    <div className="text-sm text-slate-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </section>

            {script && (
              <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Peter's 60-Second De-escalation Script</h3>
                </div>
                <p className="text-lg font-semibold mb-4">{script}</p>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm uppercase tracking-widest text-indigo-100 mb-2">Next 60 seconds</p>
                  <ul className="space-y-2 text-sm text-indigo-50">
                    {nextSteps[intensityBand].map((step) => (
                      <li key={step} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-200" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

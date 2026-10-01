import React, { useState } from "react";
import { useRouter } from "next/router";
import PeterTheOtter, { MascotStatus } from "../components/PeterTheOtter";

const partnerProfiles = [
  {
    value: "Avoidant",
    label: "Needs space",
    description: "Can go quiet or shut down when things feel intense.",
  },
  {
    value: "Anxious",
    label: "Needs reassurance",
    description: "Wants calm and closeness, and worries about being pushed away.",
  },
  {
    value: "Secure",
    label: "Feels steady",
    description: "Open and steady, and likes things said clearly.",
  },
];

export default function Translator() {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [partnerContext, setPartnerContext] = useState(partnerProfiles[0].value);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [peterStatus, setPeterStatus] = useState<MascotStatus>("idle");
  const [peterMessage, setPeterMessage] = useState<string | null>(
    "Draft your message and pick a partner context. I’ll soften it for you."
  );

  const handleTranslate = async () => {
    if (!draft.trim()) {
      setPeterStatus("speaking");
      setPeterMessage("Could you share a draft first?");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPeterStatus("thinking");
    setPeterMessage("Let me find a kinder way to say that...");

    try {
      const response = await fetch("/api/translator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draft,
          partnerContext,
        }),
      });

      const data = (await response.json()) as {
        suggestion?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      setSuggestion(data.suggestion ?? null);
      setPeterStatus("speaking");
      setPeterMessage(data.suggestion || "Here’s a gentler version for you.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed.";
      setError(message);
      setPeterStatus("speaking");
      setPeterMessage("Uh oh, I got splashed. Want to try again?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-linen to-brand-parchment flex flex-col items-center py-12 px-4 relative">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 z-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/connect')}
            className="text-sm text-brand-hover hover:text-brand-espresso font-semibold"
          >
            ← Back to Connect
          </button>
          <span className="text-xs uppercase tracking-wide text-brand-hover font-semibold">
            Translator
          </span>
        </div>

        <h1 className="text-2xl font-bold text-brand-primary mb-2">
          Peter’s Message Translator
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Turn a tense draft into something softer for your partner.
        </p>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Draft your message
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type what you want to say..."
            className="w-full border border-gray-300 rounded-lg p-4 h-36 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Partner Context
          </label>
          <div className="flex flex-wrap gap-3">
            {partnerProfiles.map((profile) => (
              <button
                key={profile.value}
                onClick={() => setPartnerContext(profile.value)}
                className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                  partnerContext === profile.value
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-gray-700 border-gray-300 hover:border-brand-primary"
                }`}
              >
                <span>{profile.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-brand-text-secondary mt-2">
            Mocked for now — we’ll personalize this later.
          </p>
          <div className="mt-3 text-xs text-gray-600">
            {partnerProfiles.find((profile) => profile.value === partnerContext)?.description}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Peter’s suggested rephrase
            </h2>
            {suggestion && (
              <span className="text-xs text-brand-hover font-medium">Ready</span>
            )}
          </div>
          <div className="min-h-[96px] rounded-xl border border-brand-primary/10 bg-brand-linen p-4 text-gray-700 leading-relaxed">
            {suggestion ||
              "Draft your message and tap ‘Ask Peter’ to see a gentler version."}
          </div>
          {error && (
            <p className="text-sm text-rose-500 mt-2">{error}</p>
          )}
        </div>

        <button
          onClick={handleTranslate}
          disabled={isLoading}
          className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Peter is thinking..." : "Ask Peter to Rephrase"}
        </button>
      </div>

      <PeterTheOtter status={peterStatus} message={peterMessage} />
    </div>
  );
}

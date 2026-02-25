import React, { useState } from "react";
import { useRouter } from "next/router";
import PeterTheOtter, { MascotStatus } from "../components/PeterTheOtter";

const partnerProfiles = [
  {
    value: "Avoidant",
    description: "Needs space, can shut down when things feel intense.",
  },
  {
    value: "Anxious",
    description: "Needs reassurance and calm, fears being rejected.",
  },
  {
    value: "Secure",
    description: "Feels steady and open, responds well to clarity.",
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center py-12 px-4 relative">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 z-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back to Dashboard
          </button>
          <span className="text-xs uppercase tracking-wide text-indigo-500 font-semibold">
            Translator
          </span>
        </div>

        <h1 className="text-2xl font-bold text-indigo-700 mb-2">
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
            className="w-full border border-gray-300 rounded-lg p-4 h-36 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                  partnerContext === profile.value
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                }`}
              >
                <span>{profile.value}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
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
              <span className="text-xs text-indigo-500 font-medium">Ready</span>
            )}
          </div>
          <div className="min-h-[96px] rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-gray-700 leading-relaxed">
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
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Peter is thinking..." : "Ask Peter to Rephrase"}
        </button>
      </div>

      <PeterTheOtter status={peterStatus} message={peterMessage} />
    </div>
  );
}

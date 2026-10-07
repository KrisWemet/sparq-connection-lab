import type { NextApiRequest, NextApiResponse } from "next";
import { peterChat } from "@/lib/openrouter";
import { buildPeterInstruction } from "@/lib/peterService";
import { getAuthedContext } from "@/lib/server/supabase-auth";
import { resolveEntitlements } from "@/lib/server/entitlements";
import { stripMarkdown } from "@/lib/strip-markdown";

type TranslatorResponse =
  | { suggestion: string }
  | { error: string; limit_reached?: boolean };

// The partner-context chips the page offers. Anything else is ignored, so
// the request body can't inject free text into the prompt through it.
const PARTNER_CONTEXTS: Record<string, string> = {
  Avoidant: "They can go quiet or shut down when things feel intense. They may need space.",
  Anxious: "They want calm and closeness, and worry about being pushed away. They may need reassurance.",
  Secure: "They feel fairly steady and like things said clearly.",
};

// Bounds what one request can cost.
const MAX_DRAFT_CHARS = 2000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TranslatorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const authed = await getAuthedContext(req);
  if (!authed) return res.status(401).json({ error: "Unauthorized" });

  const { draft, partnerContext } = (req.body || {}) as {
    draft?: string;
    partnerContext?: string;
  };

  if (!draft || typeof draft !== "string" || !draft.trim()) {
    return res.status(400).json({ error: "Draft message is required." });
  }
  if (draft.length > MAX_DRAFT_CHARS) {
    return res.status(400).json({ error: "That draft is a bit long. Try a shorter one." });
  }

  // Shares Peter chat's free-tier daily cap (coach_usage_daily): a rephrase
  // is a Peter message.
  const today = new Date().toISOString().slice(0, 10);
  const entitlements = await resolveEntitlements(authed.supabase, authed.userId);
  const cap = entitlements.coach_message_limit_per_day;
  if (cap != null) {
    const { data: usageRow } = await authed.supabase
      .from("coach_usage_daily")
      .select("message_count")
      .eq("user_id", authed.userId)
      .eq("usage_date", today)
      .maybeSingle();
    const used = usageRow?.message_count || 0;
    if (used >= cap) {
      return res.status(429).json({
        error: "You've used today's Peter messages on the free plan. Your next one opens tomorrow.",
        limit_reached: true,
      });
    }
  }

  const partnerLine =
    (typeof partnerContext === "string" && PARTNER_CONTEXTS[partnerContext]) ||
    "Unknown. Keep it gentle and clear.";

  const systemPrompt = buildPeterInstruction(
    "Rewrite the user's draft message to their partner in a softer, less triggering way. " +
      "Keep their meaning and their voice. Keep it kind and short. " +
      "Reply with only the rephrased message: no greeting, no explanation, no questions."
  );

  const userPrompt = `What my partner might need right now: ${partnerLine}\nMy draft message: ${draft.trim()}`;

  try {
    const raw = await peterChat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 200,
      temperature: 0.7,
    });
    const suggestion = stripMarkdown(raw).trim();

    if (!suggestion) {
      return res.status(502).json({ error: "Peter couldn't find the words this time. Try again?" });
    }

    // Count the message after success (fire-and-forget, like Peter chat).
    void (async () => {
      try {
        const { data: usageRow } = await authed.supabase
          .from("coach_usage_daily")
          .select("message_count")
          .eq("user_id", authed.userId)
          .eq("usage_date", today)
          .maybeSingle();
        await authed.supabase.from("coach_usage_daily").upsert(
          {
            user_id: authed.userId,
            usage_date: today,
            message_count: (usageRow?.message_count || 0) + 1,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,usage_date" }
        );
      } catch {}
    })();

    return res.status(200).json({ suggestion });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Translator API error:", errMsg);
    return res.status(500).json({ error: "Peter is taking a nap. Try again in a moment." });
  }
}

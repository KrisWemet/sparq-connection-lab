import type { NextApiRequest, NextApiResponse } from "next";

type TranslatorResponse =
  | { suggestion: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TranslatorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { draft, partnerContext } = req.body as {
    draft?: string;
    partnerContext?: string;
  };

  if (!draft || typeof draft !== "string" || !draft.trim()) {
    return res.status(400).json({ error: "Draft message is required." });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing OpenRouter API key." });
  }

  const profile =
    typeof partnerContext === "string" && partnerContext.trim()
      ? partnerContext.trim()
      : "Unknown";

  const systemPrompt =
    "You are Peter the Otter, a warm and friendly relationship coach. " +
    "Speak at a 4th-grade reading level. Offer a gentle, less triggering way " +
    "to say the message. Keep it kind, short, and supportive.";

  const userPrompt = `Partner context: ${profile}\nDraft message: ${draft}\n\nRewrite the draft in a softer, less triggering way. Provide only the rephrased message.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": req.headers.origin || "http://localhost:3000",
        "X-Title": "Sparq Connection Lab",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res
        .status(response.status)
        .json({ error: `OpenRouter error: ${errorText}` });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const suggestion = data?.choices?.[0]?.message?.content?.trim();

    if (!suggestion) {
      return res
        .status(500)
        .json({ error: "No suggestion returned from OpenRouter." });
    }

    return res.status(200).json({ suggestion });
  } catch (error) {
    console.error("Translator API error:", error);
    return res.status(500).json({ error: "Failed to reach OpenRouter." });
  }
}

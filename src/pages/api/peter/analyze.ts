import type { NextApiRequest, NextApiResponse } from 'next';
import { peterChat } from '@/lib/openrouter';
import { getProfileAnalysisPrompt, PeterMessage, UserInsights } from '@/lib/peterService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body as { messages: PeterMessage[] };

  if (!messages || messages.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 messages to analyze' });
  }

  try {
    const prompt = getProfileAnalysisPrompt(messages);

    const raw = await peterChat({
      messages: [
        {
          role: 'system',
          content:
            'You are a relationship psychology expert. Analyze conversation transcripts and return structured JSON insights. Return only valid JSON, no explanation.',
        },
        { role: 'user', content: prompt },
      ],
      maxTokens: 256,
    });

    // Strip markdown code fences if the model wrapped the JSON
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let insights: Partial<UserInsights> & { reasoning?: string };
    try {
      insights = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: 'Failed to parse insights JSON' });
    }

    return res.status(200).json({ insights });
  } catch (error) {
    console.error('Peter analyze error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}

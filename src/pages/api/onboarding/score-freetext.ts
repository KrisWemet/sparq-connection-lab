// src/pages/api/onboarding/score-freetext.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { peterChat } from '@/lib/openrouter';
import type { RawScores } from '@/lib/onboarding/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { freeTextAnswers } = req.body as {
    freeTextAnswers: Record<string, string>; // questionIndex → text
  };

  if (!freeTextAnswers || typeof freeTextAnswers !== 'object') {
    return res.status(400).json({ error: 'freeTextAnswers is required' });
  }

  const entries = Object.entries(freeTextAnswers);
  if (entries.length === 0) {
    return res.status(200).json({ scoreAdjustments: {} });
  }

  const questionsText = entries
    .map(([idx, text]) => `Question ${idx}: "${text}"`)
    .join('\n');

  const systemPrompt = `You are a psychological profiling system. Given free-text answers from a relationship app onboarding questionnaire, return score adjustments for these 8 dimensions:
- anxious (0-10): anxious attachment tendencies
- avoidant (0-10): avoidant attachment tendencies
- secure (0-10): secure attachment tendencies
- disorganized (0-10): disorganized attachment tendencies
- dysregulation (0-10): emotional dysregulation
- abandonment (0-10): fear of abandonment
- selfWorth (0-10): fragile self-worth (higher = more fragile)
- trauma (0-10): trauma indicators

Return ONLY a JSON object with the dimensions that have meaningful signal (non-zero adjustments). Example: {"anxious": 2, "abandonment": 1}
If there is no meaningful clinical signal, return {}
Never return negative values. Return integers only.`;

  try {
    const raw = await peterChat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Free-text answers:\n${questionsText}` },
      ],
      maxTokens: 200,
    });

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[^}]*\}/);
    if (!jsonMatch) {
      return res.status(200).json({ scoreAdjustments: {} });
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<RawScores>;
    // Sanitize: only known keys, only non-negative integers
    const validKeys = new Set(['anxious','avoidant','secure','disorganized','dysregulation','abandonment','selfWorth','trauma']);
    const scoreAdjustments: Partial<RawScores> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (validKeys.has(key) && typeof val === 'number' && val >= 0) {
        (scoreAdjustments as Record<string, number>)[key] = Math.round(val);
      }
    }

    return res.status(200).json({ scoreAdjustments });
  } catch (err) {
    // Graceful fallback — scoring continues with quick-reply scores only
    console.error('score-freetext error:', err);
    return res.status(200).json({ scoreAdjustments: {} });
  }
}

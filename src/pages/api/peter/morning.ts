import type { NextApiRequest, NextApiResponse } from 'next';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT, getMorningStoryPrompt, UserInsights } from '@/lib/peterService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { day, insights } = req.body as { day: number; insights: Partial<UserInsights> };

  if (!day || day < 1 || day > 14) {
    return res.status(400).json({ error: 'day must be between 1 and 14' });
  }

  try {
    const prompt = getMorningStoryPrompt(day, insights ?? {});

    const story = await peterChat({
      messages: [
        { role: 'system', content: PETER_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      maxTokens: 400,
    });

    return res.status(200).json({ story });
  } catch (error) {
    console.error('Peter morning error:', error);
    return res.status(500).json({ error: 'Peter is still waking up — try again in a moment 🦦' });
  }
}

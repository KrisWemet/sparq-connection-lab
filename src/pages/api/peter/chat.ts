import type { NextApiRequest, NextApiResponse } from 'next';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT, PeterMessage } from '@/lib/peterService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemOverride } = req.body as {
    messages: PeterMessage[];
    systemOverride?: string;
  };

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const message = await peterChat({
      messages: [
        { role: 'system', content: systemOverride || PETER_SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      maxTokens: 512,
    });

    return res.status(200).json({ message });
  } catch (error) {
    console.error('Peter chat error:', error);
    return res.status(500).json({ error: 'Peter is taking a nap — try again in a moment 🦦' });
  }
}

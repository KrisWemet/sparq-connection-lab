import type { NextApiRequest, NextApiResponse } from 'next';
import { peterChat } from '@/lib/openrouter';
import {
  getMemoryExtractionPrompt,
  saveMemories,
  getMemories,
  type MemorySource,
  type NewMemory,
  type MemoryCategory,
} from '@/lib/peterMemoryService';
import type { PeterMessage } from '@/lib/peterService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: retrieve memories for a user
  if (req.method === 'GET') {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const category = req.query.category as MemoryCategory | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const memories = await getMemories(userId, { category, limit });
    return res.status(200).json({ memories });
  }

  // POST: extract memories from a conversation and save them
  if (req.method === 'POST') {
    const { userId, messages, sourceType, day } = req.body as {
      userId: string;
      messages: PeterMessage[];
      sourceType: MemorySource;
      day?: number;
    };

    if (!userId || !messages || messages.length < 2) {
      return res.status(400).json({ error: 'userId and at least 2 messages required' });
    }

    try {
      const transcript = messages
        .map((m) => `${m.role === 'user' ? 'User' : 'Peter'}: ${m.content}`)
        .join('\n');

      const prompt = getMemoryExtractionPrompt(transcript, sourceType || 'conversation', day);

      const raw = await peterChat({
        messages: [
          {
            role: 'system',
            content:
              'You extract relationship memories from conversations. Return only valid JSON arrays.',
          },
          { role: 'user', content: prompt },
        ],
        maxTokens: 512,
      });

      // Parse the response
      const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      let extracted: Array<{ memory_text: string; category: MemoryCategory; salience: number }>;
      try {
        extracted = JSON.parse(cleaned);
      } catch {
        return res.status(200).json({ saved: 0, memories: [] });
      }

      if (!Array.isArray(extracted) || extracted.length === 0) {
        return res.status(200).json({ saved: 0, memories: [] });
      }

      // Save extracted memories
      const newMemories: NewMemory[] = extracted.slice(0, 4).map((m) => ({
        memory_text: m.memory_text,
        category: m.category || 'general',
        salience: Math.min(10, Math.max(1, m.salience || 5)),
        source_type: sourceType || 'conversation',
        source_day: day,
      }));

      const saved = await saveMemories(userId, newMemories);
      return res.status(200).json({ saved, memories: newMemories });
    } catch (error) {
      console.error('Memory extraction error:', error);
      return res.status(500).json({ error: 'Memory extraction failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

interface DateIdea {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  cost: string;
  rating: number;
  location?: string;
  address?: string;
  image?: string;
}

const categoryImages: Record<string, string[]> = {
  Outdoor: [
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&h=500',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=500',
  ],
  Indoor: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&h=500',
    'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&h=500',
  ],
  Food: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&h=500',
  ],
  Adventure: [
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&h=500',
  ],
  Romantic: [
    'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=800&h=500',
  ],
};

function getImageForCategory(category: string): string {
  const images = categoryImages[category] || categoryImages['Romantic'] || [];
  return images[Math.floor(Math.random() * images.length)] || '';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { location = 'local area', preferences = [], budget, maxResults = 5 } = req.body as {
    location?: string;
    preferences?: string[];
    budget?: string;
    maxResults?: number;
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const openai = new OpenAI({ apiKey });

    let prompt = `Generate ${maxResults} unique date ideas`;
    if (location) prompt += ` for couples in ${location}`;
    if (preferences.length > 0) prompt += ` who enjoy ${preferences.join(', ')}`;
    if (budget) prompt += ` with a ${budget.toLowerCase()} budget`;
    prompt += `. For each idea, provide a title, detailed description, category, estimated duration, cost level (Free, Low, Medium, High), and a rating out of 5. If applicable, include a specific location name and address. Format the response as a JSON array.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates creative and romantic date ideas for couples.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: 'No content in response' });
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse response' });
    }

    const raw: DateIdea[] = JSON.parse(jsonMatch[0]);

    const ideas = raw.map((idea, index) => {
      let rating = typeof idea.rating === 'number' ? idea.rating : parseFloat(String(idea.rating));
      if (isNaN(rating)) rating = 4 + Math.random();
      return {
        ...idea,
        id: Date.now() + index,
        rating,
        image: idea.image || getImageForCategory(idea.category),
      };
    });

    return res.status(200).json({ ideas });
  } catch (error) {
    console.error('Date ideas generation error:', error);
    return res.status(500).json({ error: 'Failed to generate date ideas' });
  }
}

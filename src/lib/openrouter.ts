// OpenRouter client — server-side only (never import from client components)
// Uses model fallback so the app keeps working if any one provider goes down.

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// Priority order: Claude Haiku first, then fallbacks if Anthropic is unavailable
const PETER_MODELS = [
  'anthropic/claude-haiku-4-5-20251001',
  'google/gemini-flash-1.5-8b',
  'mistralai/mistral-7b-instruct',
];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PeterChatOptions {
  messages: ChatMessage[];
  maxTokens?: number;
}

export async function peterChat({ messages, maxTokens = 512 }: PeterChatOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://sparq.app',
      'X-Title': 'Sparq Connection Lab',
    },
    body: JSON.stringify({
      models: PETER_MODELS,
      route: 'fallback',
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter');
  return content as string;
}

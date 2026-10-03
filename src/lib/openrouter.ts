// OpenRouter client — server-side only (never import from client components)
// Uses model fallback so the app keeps working if any one provider goes down.

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// TEMPORARY (2026-09-30, Chris testing without OpenRouter credits): free
// models only. Free tier = 20 req/min and 50 req/day (1,000/day once $10 of
// credits has ever been bought), and free providers may log prompts — not
// for real users. To go back, restore:
//   ['anthropic/claude-haiku-4.5', 'google/gemma-4-31b-it:free']
export const PETER_MODELS = [
  'google/gemma-4-31b-it:free',
  'qwen/qwen3.8-27b:free',
];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PeterChatOptions {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export async function peterChat({ messages, maxTokens = 512, temperature }: PeterChatOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  // A free model can hang for minutes; give each try 30s, then treat it like
  // a busy model (504) so the next one gets a turn.
  const request = (body: Record<string, unknown>) => fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://sparq.app',
      'X-Title': 'Sparq Connection Lab',
    },
    body: JSON.stringify({
      ...body,
      // Peter needs plain replies; hidden "thinking" would eat max_tokens.
      reasoning: { enabled: false },
      messages,
      max_tokens: maxTokens,
      ...(temperature !== undefined ? { temperature } : {}),
    }),
  }).catch((err: unknown) => {
    if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      return new Response('Timed out waiting for model', { status: 504 });
    }
    throw err;
  });

  const retryable = (r: Response) => r.status === 429 || r.status >= 500;

  // OpenRouter's own fallback doesn't always move on when the first model is
  // rate-limited upstream (429) or its provider errors. Try each remaining
  // model directly, and if every model is busy, wait a moment and try the
  // whole list once more — free models are often rate-limited for seconds.
  let response: Response = await request({ models: PETER_MODELS, route: 'fallback' });
  for (let round = 0; round < 2 && retryable(response); round++) {
    if (round === 1) await new Promise(r => setTimeout(r, 2500));
    for (const model of round === 0 ? PETER_MODELS.slice(1) : PETER_MODELS) {
      response = await request({ model });
      if (!retryable(response)) break;
    }
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter');
  return content as string;
}

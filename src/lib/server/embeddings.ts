// Embedding utility — server-side only
// Uses OpenAI text-embedding-3-small via fetch (no SDK)

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate an embedding vector for the given text.
 * Returns null if OPENAI_API_KEY is not set (graceful degradation).
 */
export async function embed(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const trimmed = text.slice(0, 8000); // keep within token limits

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: trimmed,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    console.error(`Embedding API error ${response.status}: ${await response.text()}`);
    return null;
  }

  const data = await response.json();
  return data.data?.[0]?.embedding ?? null;
}

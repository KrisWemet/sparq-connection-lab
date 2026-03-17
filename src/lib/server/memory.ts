// Memory layer — thin wrapper around mem0ai OSS with Supabase vector store.
// Server-side only. Never import from client components.
// Uses dynamic import to avoid top-level ESM resolution issues with ollama peer dep.

type MemoryInstance = any;
type Message = { role: string; content: string };
type SearchResult = any;
type MemoryItem = any;

let _memory: MemoryInstance | null = null;
let _initFailed = false;

async function getMemory(): Promise<MemoryInstance> {
  if (_memory) return _memory;
  if (_initFailed) throw new Error('Memory layer previously failed to initialize');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE env vars for memory layer');
  }
  if (!openaiKey) {
    throw new Error('Missing OPENAI_API_KEY for memory embeddings');
  }

  try {
    const { Memory } = await import('mem0ai/oss');

    _memory = new Memory({
      version: 'v1.1',
      embedder: {
        provider: 'openai',
        config: {
          apiKey: openaiKey,
          model: 'text-embedding-3-small',
        },
      },
      vectorStore: {
        provider: 'supabase',
        config: {
          supabaseUrl,
          supabaseKey,
          tableName: 'memories',
          dimension: 1536,
        },
      },
      llm: {
        provider: 'openai',
        config: {
          apiKey: openaiKey,
          model: 'gpt-4o-mini',
        },
      },
      historyStore: {
        provider: 'supabase',
        config: {
          supabaseUrl,
          supabaseKey,
          tableName: 'memory_history',
        },
      },
    });

    return _memory;
  } catch (err) {
    _initFailed = true;
    throw err;
  }
}

/**
 * Store conversation messages as memories. mem0 auto-extracts key facts.
 */
export async function addMemory(
  userId: string,
  messages: Message[],
  metadata?: Record<string, any>,
): Promise<SearchResult> {
  const memory = await getMemory();
  return memory.add(messages, { userId, metadata });
}

/**
 * Semantic search for memories relevant to a query.
 */
export async function searchMemories(
  userId: string,
  query: string,
  limit = 5,
): Promise<SearchResult> {
  const memory = await getMemory();
  return memory.search(query, { userId, limit });
}

/**
 * Get all memories for a user (sorted by recency).
 */
export async function getRecentMemories(
  userId: string,
  limit = 10,
): Promise<SearchResult> {
  const memory = await getMemory();
  return memory.getAll({ userId, limit });
}

/**
 * Get a specific memory by ID.
 */
export async function getMemoryById(memoryId: string): Promise<MemoryItem | null> {
  const memory = await getMemory();
  return memory.get(memoryId);
}

/**
 * Delete all memories for a user (used by Trust Center "delete all" action).
 */
export async function deleteUserMemories(userId: string): Promise<void> {
  const memory = await getMemory();
  await memory.deleteAll({ userId });
}

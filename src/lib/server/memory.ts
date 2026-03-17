// Memory layer — server-side only. Never import from client components.
// mem0ai/oss was removed from the project; this module provides a compatible
// in-memory stub so API routes that call addMemory/searchMemories compile and
// run without crashing. Replace with a real vector store when mem0ai is added back.

type Message = { role: string; content: string };
type SearchResult = any;
type MemoryItem = any;

const store = new Map<string, Array<{ id: string; memory: string; metadata?: Record<string, any>; createdAt: number }>>();

function uid() {
  return Math.random().toString(36).slice(2);
}

function getStore(userId: string) {
  if (!store.has(userId)) store.set(userId, []);
  return store.get(userId)!;
}

/**
 * Store conversation messages as memories. Extracts assistant messages as facts.
 */
export async function addMemory(
  userId: string,
  messages: Message[],
  metadata?: Record<string, any>,
): Promise<SearchResult> {
  const entries = getStore(userId);
  for (const msg of messages) {
    entries.push({ id: uid(), memory: msg.content, metadata, createdAt: Date.now() });
  }
  return { results: [] };
}

/**
 * Semantic search for memories relevant to a query (stub: returns most recent).
 */
export async function searchMemories(
  userId: string,
  _query: string,
  limit = 5,
): Promise<SearchResult> {
  const entries = getStore(userId);
  const results = entries.slice(-limit).reverse().map(e => ({ id: e.id, memory: e.memory, metadata: e.metadata }));
  return { results };
}

/**
 * Get all memories for a user (sorted by recency).
 */
export async function getRecentMemories(
  userId: string,
  limit = 10,
): Promise<SearchResult> {
  const entries = getStore(userId);
  const results = entries.slice(-limit).reverse().map(e => ({ id: e.id, memory: e.memory, metadata: e.metadata }));
  return { results };
}

/**
 * Get a specific memory by ID.
 */
export async function getMemoryById(memoryId: string): Promise<MemoryItem | null> {
  for (const entries of store.values()) {
    const found = entries.find(e => e.id === memoryId);
    if (found) return found;
  }
  return null;
}

/**
 * Delete all memories for a user (used by Trust Center "delete all" action).
 */
export async function deleteUserMemories(userId: string): Promise<void> {
  store.delete(userId);
}

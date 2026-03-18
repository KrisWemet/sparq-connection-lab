// Memory layer — server-side only. Never import from client components.
// Backed by Supabase pgvector for persistent, semantic memory storage.

import { createClient } from '@supabase/supabase-js';
import { embed } from './embeddings';

type Message = { role: string; content: string };
type SearchResult = { results: Array<{ id: string; memory: string; metadata?: Record<string, any>; score?: number }> };

/**
 * Service-role Supabase client for memory operations.
 * Uses service role key to bypass RLS (memories are scoped by user_id in queries).
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for memory operations');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Store conversation messages as memories with vector embeddings.
 */
export async function addMemory(
  userId: string,
  messages: Message[],
  metadata?: Record<string, any>,
): Promise<SearchResult> {
  const client = getServiceClient();

  const memoryText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const embedding = await embed(memoryText);

  const expiresAt = metadata?.expires_at || null;
  const cleanMeta = { ...metadata };
  delete cleanMeta.expires_at;

  const { data, error } = await client
    .from('memories')
    .insert({
      user_id: userId,
      memory: memoryText,
      metadata: cleanMeta,
      embedding: embedding ? `[${embedding.join(',')}]` : null,
      expires_at: expiresAt,
    })
    .select('id, memory, metadata')
    .single();

  if (error) {
    console.error('addMemory error:', error);
    return { results: [] };
  }

  return { results: data ? [{ id: data.id, memory: data.memory, metadata: data.metadata }] : [] };
}

/**
 * Semantic search for memories relevant to a query.
 * Falls back to recency-based retrieval when embeddings are unavailable.
 */
export async function searchMemories(
  userId: string,
  query: string,
  limit = 5,
): Promise<SearchResult> {
  const client = getServiceClient();
  const queryEmbedding = await embed(query);

  if (queryEmbedding) {
    // Vector similarity search using cosine distance
    const { data, error } = await client.rpc('match_memories', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_user_id: userId,
      match_count: limit,
    });

    if (!error && data && data.length > 0) {
      return {
        results: data.map((row: any) => ({
          id: row.id,
          memory: row.memory,
          metadata: row.metadata,
          score: row.similarity,
        })),
      };
    }

    // If RPC doesn't exist yet, fall through to recency
    if (error) {
      console.warn('match_memories RPC not available, falling back to recency:', error.message);
    }
  }

  // Fallback: recency-based retrieval
  return getRecentMemories(userId, limit);
}

/**
 * Get all memories for a user (sorted by recency), filtering out expired ones.
 */
export async function getRecentMemories(
  userId: string,
  limit = 10,
): Promise<SearchResult> {
  const client = getServiceClient();

  const { data, error } = await client
    .from('memories')
    .select('id, memory, metadata')
    .eq('user_id', userId)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRecentMemories error:', error);
    return { results: [] };
  }

  return {
    results: (data || []).map(row => ({
      id: row.id,
      memory: row.memory,
      metadata: row.metadata,
    })),
  };
}

/**
 * Get a specific memory by ID.
 */
export async function getMemoryById(memoryId: string) {
  const client = getServiceClient();
  const { data } = await client
    .from('memories')
    .select('id, memory, metadata, created_at')
    .eq('id', memoryId)
    .maybeSingle();
  return data || null;
}

/**
 * Delete all memories for a user (used by Trust Center "delete all" action).
 */
export async function deleteUserMemories(userId: string): Promise<void> {
  const client = getServiceClient();
  await client.from('memories').delete().eq('user_id', userId);
}

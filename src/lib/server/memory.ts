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
  const memoryText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');
  return insertMemory(userId, memoryText, metadata);
}

// Person Model V1 memory kinds (docs/PERSON_MODEL.md §5).
export type MemoryKind = 'fact' | 'context' | 'pattern' | 'discovery' | 'intention' | 'growth';
export const MEMORY_KINDS: readonly MemoryKind[] = ['fact', 'context', 'pattern', 'discovery', 'intention', 'growth'];

export type DistilledMemory = { text: string; kind: MemoryKind; importance: number };

/**
 * Store only what is worth remembering (constitution §2, §4): short distilled
 * sentences with a kind and importance. An empty list stores nothing — a
 * normal, valid outcome.
 */
export async function addDistilledMemories(
  userId: string,
  items: DistilledMemory[],
  metadata?: Record<string, any>,
): Promise<number> {
  let stored = 0;
  for (const item of items) {
    const result = await insertMemory(userId, item.text, metadata, item.kind, item.importance);
    if (result.results.length > 0) stored++;
  }
  return stored;
}

async function insertMemory(
  userId: string,
  memoryText: string,
  metadata?: Record<string, any>,
  kind: MemoryKind = 'context',
  importance = 0.5,
): Promise<SearchResult> {
  const client = getServiceClient();
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
      kind,
      importance: Math.min(1, Math.max(0, importance)),
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
    // Ranked retrieval (similarity × importance, discoveries lifted, old
    // context decayed — docs/PERSON_MODEL.md §6); plain cosine as fallback.
    const args = {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_user_id: userId,
      match_count: limit,
    };
    let { data, error } = await client.rpc('match_memories_ranked', args);
    if (error) {
      ({ data, error } = await client.rpc('match_memories', { ...args, match_count: limit * 2 }));
    }
    const rows = (data || []).filter((row: any) => !isTrace(row.metadata)).slice(0, limit);

    if (!error && rows.length > 0) {
      return {
        results: rows.map((row: any) => ({
          id: row.id,
          memory: row.memory,
          metadata: { ...(row.metadata || {}), ...(row.kind ? { kind: row.kind } : {}) },
          score: row.score ?? row.similarity,
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
 * Age-aware semantic search: only memories created BEFORE the given date.
 * Used by the growth engine's moment_pair signal (spec §4.1 #5) — the plain
 * searchMemories has no age filter and would self-match the current reflection.
 * Returns empty results (never throws, no recency fallback) when embeddings
 * are unavailable — an unfiltered fallback would reintroduce self-matching.
 */
export async function searchMemoriesBefore(
  userId: string,
  query: string,
  beforeIso: string,
  limit = 5,
): Promise<SearchResult> {
  const client = getServiceClient();
  const queryEmbedding = await embed(query);
  if (!queryEmbedding) return { results: [] };

  const { data, error } = await client.rpc('match_memories_before', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_user_id: userId,
    before_date: beforeIso,
    match_count: limit,
  });
  if (error || !data) return { results: [] };
  return {
    results: data.map((row: any) => ({
      id: row.id,
      memory: row.memory,
      metadata: row.metadata,
      score: row.similarity,
    })),
  };
}

/** Growth traces are the user's raw past words, kept only for the growth engine. */
function isTrace(metadata: unknown): boolean {
  return Boolean(metadata && typeof metadata === 'object' && (metadata as Record<string, unknown>).trace);
}

/**
 * Most recent memories for Peter's context, filtering out expired ones and
 * growth traces.
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
    .or('metadata->>trace.is.null,metadata->>trace.neq.true')
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

/**
 * The user's own conclusions and chosen experiments, for Peter's context
 * (constitution §5 "use the user's own language and prior self-discoveries").
 * Uses the caller's RLS-scoped client. Never throws.
 */
export async function buildOwnWordsBlock(
  supabase: { from: (table: string) => any },
  userId: string,
): Promise<string> {
  try {
    const [discoveries, experiments, setbacks] = await Promise.all([
      supabase.from('self_discoveries').select('discovery').eq('user_id', userId).eq('still_true', true)
        .order('created_at', { ascending: false }).limit(3),
      supabase.from('experiments').select('intention, reason:user_reasons(reason_text, still_true)')
        .eq('user_id', userId).eq('status', 'planned')
        .order('created_at', { ascending: false }).limit(2),
      // Recent setbacks with what got in the way (v1.2 §11A). Fails soft
      // (empty) before the transformation migration adds `learning`.
      supabase.from('experiments').select('intention, learning, resolved_at')
        .eq('user_id', userId).in('status', ['skipped', 'let_go', 'revised'])
        .gte('resolved_at', new Date(Date.now() - 7 * 86_400_000).toISOString())
        .order('resolved_at', { ascending: false }).limit(1),
    ]);
    const lines: string[] = [];
    const d = (discoveries?.data || []) as Array<{ discovery: string }>;
    const e = (experiments?.data || []) as Array<{ intention: string; reason?: unknown }>;
    const reasonOf = (row: { reason?: unknown }): string | null => {
      const r = (Array.isArray(row.reason) ? row.reason[0] : row.reason) as { reason_text?: string; still_true?: boolean } | null;
      return r?.still_true && r.reason_text ? r.reason_text : null;
    };
    if (d.length > 0) {
      lines.push('Things they discovered themselves (their words — these outrank any guess of yours; echo them only when it truly fits):');
      d.forEach(row => lines.push(`- "${row.discovery}"`));
    }
    if (e.length > 0) {
      lines.push('Small experiments they chose to try (you may ask how it is going, once, if it fits):');
      e.forEach(row => {
        const reason = reasonOf(row);
        lines.push(reason ? `- "${row.intention}" — their own reason: "${reason}"` : `- "${row.intention}"`);
      });
      if (e.some(row => reasonOf(row))) {
        lines.push('If follow-through gets hard, you may gently reconnect them to THEIR reason in their words. Never add a reason of your own, never use it to guilt them, and accept "it doesn\'t matter to me anymore" as a real answer.');
      }
    }
    const s = (setbacks?.error ? [] : setbacks?.data || []) as Array<{ intention: string; learning?: { what_got_in_way?: string } | null }>;
    const way = s[0]?.learning?.what_got_in_way;
    if (s.length > 0 && way && way !== 'not_important_now') {
      const label = SETBACK_LABELS[way] ?? 'it did not happen';
      lines.push(`Something they planned did not happen this week: "${s[0].intention}" (they said: ${label}). If it comes up, treat it as information, not failure — be curious about what got in the way. Never shame, never mention streaks.`);
    }
    return lines.length > 0 ? `\n\n${lines.join('\n')}` : '';
  } catch {
    return '';
  }
}

const SETBACK_LABELS: Record<string, string> = {
  too_big: 'it was too big',
  wrong_moment: 'the moment never came',
  forgot: 'they forgot',
  busy: 'life got busy',
};

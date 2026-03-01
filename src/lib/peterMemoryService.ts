// Peter Memory Service — extracts and retrieves memories across sessions
// Memories let Peter reference things the user said days or weeks ago.

import { supabase } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────

export type MemoryCategory =
  | 'struggle'
  | 'win'
  | 'partner_detail'
  | 'preference'
  | 'milestone'
  | 'general';

export type MemorySource =
  | 'conversation'
  | 'onboarding'
  | 'daily_growth'
  | 'reflection';

export interface PeterMemory {
  id: string;
  user_id: string;
  memory_text: string;
  context: string | null;
  category: MemoryCategory;
  salience: number;
  source_type: MemorySource;
  source_day: number | null;
  created_at: string;
  last_referenced_at: string | null;
  archived: boolean;
}

export interface NewMemory {
  memory_text: string;
  context?: string;
  category: MemoryCategory;
  salience?: number;
  source_type: MemorySource;
  source_day?: number;
}

// ─── Retrieval ──────────────────────────────────────────────────────

/** Get the most relevant memories for a user, sorted by salience */
export async function getMemories(
  userId: string,
  options?: { category?: MemoryCategory; limit?: number }
): Promise<PeterMemory[]> {
  const limit = options?.limit ?? 8;

  let query = supabase
    .from('peter_memories')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('salience', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[PeterMemory] fetch error:', error);
    return [];
  }
  return data ?? [];
}

/** Build a memory context block to inject into Peter's system prompt */
export async function getMemoryContext(userId: string): Promise<string> {
  const memories = await getMemories(userId, { limit: 10 });
  if (memories.length === 0) return '';

  const lines = memories.map((m) => {
    const dayNote = m.source_day ? ` (Day ${m.source_day})` : '';
    return `- ${m.memory_text}${dayNote}`;
  });

  // Mark these memories as referenced
  const ids = memories.map((m) => m.id);
  await supabase
    .from('peter_memories')
    .update({ last_referenced_at: new Date().toISOString() })
    .in('id', ids);

  return `\n\nThings you remember about this person:\n${lines.join('\n')}\n\nUse these naturally — don't list them, just weave them into conversation when relevant.`;
}

// ─── Storage ────────────────────────────────────────────────────────

/** Save a single memory */
export async function saveMemory(
  userId: string,
  memory: NewMemory
): Promise<PeterMemory | null> {
  const { data, error } = await supabase
    .from('peter_memories')
    .insert({
      user_id: userId,
      memory_text: memory.memory_text,
      context: memory.context ?? null,
      category: memory.category,
      salience: memory.salience ?? 5,
      source_type: memory.source_type,
      source_day: memory.source_day ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('[PeterMemory] save error:', error);
    return null;
  }
  return data;
}

/** Save multiple memories at once */
export async function saveMemories(
  userId: string,
  memories: NewMemory[]
): Promise<number> {
  if (memories.length === 0) return 0;

  const rows = memories.map((m) => ({
    user_id: userId,
    memory_text: m.memory_text,
    context: m.context ?? null,
    category: m.category,
    salience: m.salience ?? 5,
    source_type: m.source_type,
    source_day: m.source_day ?? null,
  }));

  const { data, error } = await supabase
    .from('peter_memories')
    .insert(rows)
    .select();

  if (error) {
    console.error('[PeterMemory] bulk save error:', error);
    return 0;
  }
  return data?.length ?? 0;
}

// ─── Extraction Prompt ──────────────────────────────────────────────

/** Generates the prompt that asks the AI to extract memories from a conversation */
export function getMemoryExtractionPrompt(
  conversationTranscript: string,
  sourceType: MemorySource,
  day?: number
): string {
  return `Read this conversation between a user and Peter the Otter. Extract key things Peter should remember for future conversations.

Conversation:
${conversationTranscript}

Return a JSON array of memories. Each memory should have:
- "memory_text": A concise 1-sentence fact Peter should remember (written as if Peter is noting it to himself, e.g. "They mentioned their partner forgets anniversaries")
- "category": One of "struggle", "win", "partner_detail", "preference", "milestone", "general"
- "salience": 1-10 how important this is to remember (10 = deeply personal, 1 = trivial)

Rules:
- Extract 0-4 memories (only things worth remembering)
- Focus on personal details, not generic statements
- "struggle" = something they find hard in the relationship
- "win" = something they did well or are proud of
- "partner_detail" = something specific about their partner
- "preference" = how they like to communicate, what they value
- "milestone" = an event or achievement
- Return [] if there's nothing noteworthy

Return ONLY a valid JSON array. No explanation.`;
}

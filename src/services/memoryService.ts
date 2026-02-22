import { supabase } from "@/integrations/supabase/client";
import { MemoryInterface } from "@/types/memory";

/**
 * SupabaseMemory — Progressive memory system using the memory_storage table.
 *
 * Uses a proper key-value store (memory_storage) with JSONB values and
 * upsert on (user_id, key) for efficient reads/writes.
 *
 * Also writes conversation memories to conversation_memories table
 * for building richer AI context over time.
 */
export class SupabaseMemory implements MemoryInterface {
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async get(key: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("memory_storage")
        .select("value")
        .eq("user_id", this.userId)
        .eq("key", key)
        .maybeSingle();

      if (error) throw error;
      return data?.value ?? null;
    } catch (error) {
      console.error("Error getting memory:", error);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const { error } = await supabase.from("memory_storage").upsert(
        {
          user_id: this.userId,
          key,
          value,
          timestamp: new Date().toISOString(),
        },
        { onConflict: "user_id,key" }
      );

      if (error) throw error;
    } catch (error) {
      console.error("Error setting memory:", error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("memory_storage")
        .delete()
        .eq("user_id", this.userId)
        .eq("key", key);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting memory:", error);
      throw error;
    }
  }

  async batchGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from("memory_storage")
        .select("key, value")
        .eq("user_id", this.userId)
        .in("key", keys);

      if (error) throw error;

      const result: Record<string, any> = {};
      data?.forEach((item) => {
        result[item.key] = item.value;
      });
      return result;
    } catch (error) {
      console.error("Error batch getting memories:", error);
      return {};
    }
  }

  async batchSet(entries: Record<string, any>): Promise<void> {
    try {
      const rows = Object.entries(entries).map(([key, value]) => ({
        user_id: this.userId,
        key,
        value,
        timestamp: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("memory_storage")
        .upsert(rows, { onConflict: "user_id,key" });

      if (error) throw error;
    } catch (error) {
      console.error("Error batch setting memories:", error);
      throw error;
    }
  }

  async listKeys(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("memory_storage")
        .select("key")
        .eq("user_id", this.userId);

      if (error) throw error;
      return data?.map((item) => item.key) ?? [];
    } catch (error) {
      console.error("Error listing memory keys:", error);
      return [];
    }
  }

  async search(query: string): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from("memory_storage")
        .select("key, value")
        .eq("user_id", this.userId)
        .ilike("key", `%${query}%`);

      if (error) throw error;

      const result: Record<string, any> = {};
      data?.forEach((item) => {
        result[item.key] = item.value;
      });
      return result;
    } catch (error) {
      console.error("Error searching memories:", error);
      return {};
    }
  }

  async clear(): Promise<void> {
    try {
      const { error } = await supabase
        .from("memory_storage")
        .delete()
        .eq("user_id", this.userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error clearing memories:", error);
      throw error;
    }
  }

  /**
   * Record a conversation memory for AI context building.
   * These accumulate over time and feed into personalization.
   */
  async recordConversationMemory(
    content: string,
    memoryType: "session" | "insight" | "pattern" | "preference" = "session",
    importance: number = 0.5
  ): Promise<void> {
    try {
      const { error } = await supabase.from("conversation_memories").insert({
        user_id: this.userId,
        content,
        memory_type: memoryType,
        importance,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error recording conversation memory:", error);
    }
  }

  /**
   * Get recent conversation memories for AI context injection.
   * Returns most important and recent memories.
   */
  async getRecentMemories(limit: number = 20): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("conversation_memories")
        .select("content, importance")
        .eq("user_id", this.userId)
        .order("importance", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data?.map((item) => item.content) ?? [];
    } catch (error) {
      console.error("Error getting recent memories:", error);
      return [];
    }
  }

  /**
   * Build a complete AI context string from all memory sources.
   * Used by AI services to personalize responses.
   */
  async buildAIContext(): Promise<string> {
    const [memories, profileData, preferences] = await Promise.all([
      this.getRecentMemories(10),
      this.get("personality_profile"),
      this.get("user_preferences"),
    ]);

    const parts: string[] = [];

    if (profileData) {
      parts.push(`User personality profile: ${JSON.stringify(profileData)}`);
    }

    if (preferences) {
      parts.push(`User preferences: ${JSON.stringify(preferences)}`);
    }

    if (memories.length > 0) {
      parts.push(`Recent session memories:\n${memories.join("\n")}`);
    }

    return parts.join("\n\n");
  }
}

export function getMemoryService(userId: string): SupabaseMemory {
  return new SupabaseMemory(userId);
}

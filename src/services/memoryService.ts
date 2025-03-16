
import { supabase } from '@/integrations/supabase/client';
import { MemoryInterface } from '@/types/memory';

export class SupabaseMemory implements MemoryInterface {
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Core memory operations
  async get(key: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('conversation_memories')
        .select('content')
        .eq('user_id', this.userId)
        .ilike('content', `%"key":"${key}"%`)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      try {
        // Extract value from stored JSON string
        const parsed = JSON.parse(data.content);
        return parsed.value;
      } catch (e) {
        return null;
      }
    } catch (error) {
      console.error('Error getting memory:', error);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      // Store as JSON object with key and value
      const content = JSON.stringify({
        key,
        value,
        timestamp: new Date().toISOString()
      });

      // Check if memory with this key already exists
      const { data: existing } = await supabase
        .from('conversation_memories')
        .select('id')
        .eq('user_id', this.userId)
        .ilike('content', `%"key":"${key}"%`)
        .maybeSingle();

      if (existing) {
        // Update existing memory
        const { error } = await supabase
          .from('conversation_memories')
          .update({ content })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new memory
        const { error } = await supabase
          .from('conversation_memories')
          .insert({
            user_id: this.userId,
            content
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error setting memory:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_memories')
        .delete()
        .eq('user_id', this.userId)
        .ilike('content', `%"key":"${key}"%`);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  }

  // Batch operations
  async batchGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const result: Record<string, any> = {};
      
      // For each key, create a condition for the ilike query
      const conditions = keys.map(key => `content.ilike.%"key":"${key}"%`);
      
      const { data, error } = await supabase
        .from('conversation_memories')
        .select('content')
        .eq('user_id', this.userId)
        .or(conditions.join(','));

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Process each result to extract the key-value pairs
        data.forEach(item => {
          try {
            const parsed = JSON.parse(item.content);
            if (parsed.key && keys.includes(parsed.key)) {
              result[parsed.key] = parsed.value;
            }
          } catch (e) {
            console.error('Error parsing memory item:', e);
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error batch getting memories:', error);
      return {};
    }
  }

  async batchSet(entries: Record<string, any>): Promise<void> {
    try {
      const memoryEntries = Object.entries(entries).map(([key, value]) => ({
        user_id: this.userId,
        content: JSON.stringify({
          key,
          value,
          timestamp: new Date().toISOString()
        })
      }));

      // Insert all memories in a batch
      const { error } = await supabase
        .from('conversation_memories')
        .upsert(
          memoryEntries,
          { 
            onConflict: 'user_id, content->key',
            ignoreDuplicates: false 
          }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error batch setting memories:', error);
      throw error;
    }
  }

  // Query operations
  async listKeys(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_memories')
        .select('content')
        .eq('user_id', this.userId);

      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      // Extract keys from all memories
      const keys: string[] = [];
      data.forEach(item => {
        try {
          const parsed = JSON.parse(item.content);
          if (parsed.key) {
            keys.push(parsed.key);
          }
        } catch (e) {
          console.error('Error parsing memory item:', e);
        }
      });
      
      return keys;
    } catch (error) {
      console.error('Error listing memory keys:', error);
      return [];
    }
  }

  async search(query: string): Promise<Record<string, any>> {
    try {
      // Simple text search in the content field
      const { data, error } = await supabase
        .from('conversation_memories')
        .select('content')
        .eq('user_id', this.userId)
        .ilike('content', `%${query}%`);

      if (error) throw error;
      
      if (!data || data.length === 0) return {};
      
      // Process results
      const results: Record<string, any> = {};
      data.forEach(item => {
        try {
          const parsed = JSON.parse(item.content);
          if (parsed.key) {
            results[parsed.key] = parsed.value;
          }
        } catch (e) {
          console.error('Error parsing memory item:', e);
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error searching memories:', error);
      return {};
    }
  }

  // Memory management
  async clear(): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_memories')
        .delete()
        .eq('user_id', this.userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing memories:', error);
      throw error;
    }
  }
}

// Function to create memory service for a specific user
export function getMemoryService(userId: string): SupabaseMemory {
  return new SupabaseMemory(userId);
}

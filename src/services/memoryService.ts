
import { supabase } from '@/integrations/supabase/client';
import { MemoryInterface, MemoryRecord } from '@/types/memory';
import { toast } from 'sonner';

export class SupabaseMemory implements MemoryInterface {
  private userId: string | null = null;
  
  constructor(userId?: string) {
    this.userId = userId || null;
  }
  
  /**
   * Set the user ID for memory operations
   */
  setUserId(userId: string) {
    this.userId = userId;
  }
  
  /**
   * Get current user ID or throw if not available
   */
  private getUserId(): string {
    if (!this.userId) {
      throw new Error('User not authenticated. Memory operations require authentication.');
    }
    return this.userId;
  }
  
  /**
   * Get a memory value by key
   */
  async get(key: string): Promise<any> {
    try {
      const userId = this.getUserId();
      
      const { data, error } = await supabase
        .from('memory_storage')
        .select('value')
        .eq('user_id', userId)
        .eq('key', key)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return null;
        }
        throw error;
      }
      
      return data?.value || null;
    } catch (error) {
      console.error('Error getting memory:', error);
      return null;
    }
  }
  
  /**
   * Set a memory value by key
   */
  async set(key: string, value: any): Promise<void> {
    try {
      const userId = this.getUserId();
      
      // Check if the key already exists
      const { data: existingData } = await supabase
        .from('memory_storage')
        .select('id')
        .eq('user_id', userId)
        .eq('key', key)
        .maybeSingle();
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('memory_storage')
          .update({ 
            value, 
            timestamp: new Date().toISOString() 
          })
          .eq('id', existingData.id);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('memory_storage')
          .insert({
            user_id: userId,
            key,
            value,
            timestamp: new Date().toISOString()
          });
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error setting memory:', error);
      toast.error('Failed to save to memory');
      throw error;
    }
  }
  
  /**
   * Delete a memory entry by key
   */
  async delete(key: string): Promise<void> {
    try {
      const userId = this.getUserId();
      
      const { error } = await supabase
        .from('memory_storage')
        .delete()
        .eq('user_id', userId)
        .eq('key', key);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Failed to delete from memory');
      throw error;
    }
  }
  
  /**
   * Get multiple memory values by keys
   */
  async batchGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const userId = this.getUserId();
      
      const { data, error } = await supabase
        .from('memory_storage')
        .select('key, value')
        .eq('user_id', userId)
        .in('key', keys);
        
      if (error) throw error;
      
      // Convert array to record object
      const result: Record<string, any> = {};
      data?.forEach(item => {
        result[item.key] = item.value;
      });
      
      return result;
    } catch (error) {
      console.error('Error batch getting memory:', error);
      return {};
    }
  }
  
  /**
   * Set multiple memory values at once
   */
  async batchSet(entries: Record<string, any>): Promise<void> {
    try {
      const userId = this.getUserId();
      const now = new Date().toISOString();
      
      // Get existing keys
      const keys = Object.keys(entries);
      const { data: existingRecords } = await supabase
        .from('memory_storage')
        .select('id, key')
        .eq('user_id', userId)
        .in('key', keys);
      
      // Prepare updates and inserts
      const existingKeys = new Set(existingRecords?.map(r => r.key) || []);
      const keyToIdMap = new Map(existingRecords?.map(r => [r.key, r.id]) || []);
      
      const updates = [];
      const inserts = [];
      
      for (const [key, value] of Object.entries(entries)) {
        if (existingKeys.has(key)) {
          updates.push({
            id: keyToIdMap.get(key),
            value,
            timestamp: now
          });
        } else {
          inserts.push({
            user_id: userId,
            key,
            value,
            timestamp: now
          });
        }
      }
      
      // Execute updates
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('memory_storage')
          .upsert(updates);
          
        if (updateError) throw updateError;
      }
      
      // Execute inserts
      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('memory_storage')
          .insert(inserts);
          
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error batch setting memory:', error);
      toast.error('Failed to save multiple items to memory');
      throw error;
    }
  }
  
  /**
   * List all memory keys for the user
   */
  async listKeys(): Promise<string[]> {
    try {
      const userId = this.getUserId();
      
      const { data, error } = await supabase
        .from('memory_storage')
        .select('key')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      return data?.map(item => item.key) || [];
    } catch (error) {
      console.error('Error listing memory keys:', error);
      return [];
    }
  }
  
  /**
   * Search memory by text in keys
   */
  async search(query: string): Promise<Record<string, any>> {
    try {
      const userId = this.getUserId();
      
      // Basic text search on keys
      const { data, error } = await supabase
        .from('memory_storage')
        .select('key, value')
        .eq('user_id', userId)
        .ilike('key', `%${query}%`);
        
      if (error) throw error;
      
      // Convert to record
      const result: Record<string, any> = {};
      data?.forEach(item => {
        result[item.key] = item.value;
      });
      
      return result;
    } catch (error) {
      console.error('Error searching memory:', error);
      return {};
    }
  }
  
  /**
   * Clear all memory for the user
   */
  async clear(): Promise<void> {
    try {
      const userId = this.getUserId();
      
      const { error } = await supabase
        .from('memory_storage')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error clearing memory:', error);
      toast.error('Failed to clear memory');
      throw error;
    }
  }
}

// Singleton instance for global memory access
let memoryInstance: SupabaseMemory | null = null;

/**
 * Get the memory service instance
 */
export function getMemoryService(userId?: string): SupabaseMemory {
  if (!memoryInstance) {
    memoryInstance = new SupabaseMemory(userId);
  } else if (userId) {
    memoryInstance.setUserId(userId);
  }
  
  return memoryInstance;
}

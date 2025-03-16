
export interface MemoryRecord {
  id?: string;
  user_id: string;
  key: string;
  value: any;
  timestamp: string;
}

export interface MemoryInterface {
  // Core memory operations
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  
  // Batch operations
  batchGet(keys: string[]): Promise<Record<string, any>>;
  batchSet(entries: Record<string, any>): Promise<void>;
  
  // Query operations
  listKeys(): Promise<string[]>;
  search(query: string): Promise<Record<string, any>>;
  
  // Memory management
  clear(): Promise<void>;
}

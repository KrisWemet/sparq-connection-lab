
import { useEffect, useState } from 'react';
import { SupabaseMemory, getMemoryService } from '@/services/memoryService';
import { useAuth } from '@/hooks/useAuth';

export function useMemory() {
  const { user } = useAuth();
  const [memory, setMemory] = useState<SupabaseMemory | null>(null);
  
  useEffect(() => {
    if (user) {
      const memoryService = getMemoryService(user.id);
      setMemory(memoryService);
    } else {
      setMemory(null);
    }
  }, [user]);
  
  return memory;
}

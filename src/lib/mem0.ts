import { Profile } from './supabase';

// This is a simplified mock of a Mem0 client
// In a real implementation, you would use the actual Mem0 SDK
// and configure it with your API keys

interface Mem0Memory {
  id: string;
  userId: string;
  content: string;
  embedding?: number[];
  metadata: {
    type: string;
    tags: string[];
    date: string;
    importance: number;
  };
  createdAt: string;
}

interface Mem0Suggestion {
  id: string;
  content: string;
  relevanceScore: number;
  source: {
    memoryId: string;
    excerpt: string;
  };
}

class Mem0Client {
  private apiKey: string;
  private memories: Map<string, Mem0Memory[]> = new Map();
  
  constructor(apiKey: string = '') {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_MEM0_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Mem0 API key is missing. Using mock implementation.');
    }
  }

  // Store a new memory
  async storeMemory(userId: string, content: string, metadata: Partial<Mem0Memory['metadata']>): Promise<string> {
    // In a real implementation, this would call the Mem0 API
    const memory: Mem0Memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      content,
      metadata: {
        type: metadata.type || 'general',
        tags: metadata.tags || [],
        date: metadata.date || new Date().toISOString(),
        importance: metadata.importance || 1,
      },
      createdAt: new Date().toISOString(),
    };
    
    if (!this.memories.has(userId)) {
      this.memories.set(userId, []);
    }
    
    this.memories.get(userId)?.push(memory);
    return memory.id;
  }

  // Get personalized suggestions based on user profile and past activities
  async getSuggestions(userId: string, query: string, profile?: Profile): Promise<Mem0Suggestion[]> {
    // In a real implementation, this would perform a semantic search using the Mem0 API
    // For now, we'll return mock suggestions
    
    const userMemories = this.memories.get(userId) || [];
    
    // Basic keyword matching for the mock implementation
    const matchingMemories = userMemories.filter(memory => 
      memory.content.toLowerCase().includes(query.toLowerCase()) ||
      memory.metadata.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    return matchingMemories.map(memory => ({
      id: `sug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: generateSuggestion(memory.content, profile),
      relevanceScore: Math.random() * 0.5 + 0.5, // Random score between 0.5 and 1
      source: {
        memoryId: memory.id,
        excerpt: memory.content.substring(0, 100) + '...',
      }
    }));
  }

  // Get personalized relationship insights
  async getInsights(userId: string, profile?: Profile): Promise<string[]> {
    // In a real implementation, this would analyze user data and generate insights
    // For now, we'll return mock insights
    
    const partnerName = profile?.partner_name || 'your partner';
    const relationshipStatus = profile?.relationship_status || 'your relationship';
    
    return [
      `You and ${partnerName} communicate most effectively in the evening`,
      `${partnerName} responds well to appreciation language`,
      `Quality time is your strongest connection method`,
      `You've shown improvement in active listening`,
      `Morning conversations tend to be more productive for resolving issues`,
      `Shared activities strengthen your relationship more than gifts`,
    ];
  }

  // Generate a personalized activity suggestion 
  async suggestActivity(userId: string, activityType?: string, profile?: Profile): Promise<string> {
    // In a real implementation, this would use embeddings and semantic search
    // to find the most relevant activity based on user profile and history
    
    const partnerName = profile?.partner_name || 'your partner';
    
    const activities = [
      `Take 10 minutes to write down three things you appreciate about ${partnerName} today`,
      `Plan a surprise date based on ${partnerName}'s favorite activity`,
      `Share a meaningful memory and ask ${partnerName} to share one too`,
      `Practice active listening during your next conversation - focus entirely on understanding rather than responding`,
      `Try a new activity together this weekend to create fresh shared experiences`,
      `Write a short note expressing gratitude for something specific ${partnerName} did recently`,
    ];
    
    return activities[Math.floor(Math.random() * activities.length)];
  }
}

// Helper function to generate personalized suggestions
function generateSuggestion(content: string, profile?: Profile): string {
  const partnerName = profile?.partner_name || 'your partner';
  
  // Basic templates for suggestions
  const templates = [
    `Based on your experiences, try focusing on listening more deeply when ${partnerName} talks about their day`,
    `You've mentioned enjoying quality time together. Consider planning a special evening with ${partnerName} this weekend`,
    `Your communication style works well when you take time to process thoughts before responding`,
    `${partnerName} seems to appreciate when you notice small details. Try pointing out something positive you've observed today`,
    `Building on your previous conversations, try expressing appreciation for ${partnerName} in their primary love language`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Export a singleton instance
export const mem0 = new Mem0Client(); 
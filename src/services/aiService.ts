import { toast } from "sonner";

interface DateIdea {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  cost: string;
  rating: number;
  location?: string;
  address?: string;
  image?: string;
}

interface AIServiceOptions {
  location?: string;
  preferences?: string[];
  budget?: 'Free' | 'Low' | 'Medium' | 'High';
  indoor?: boolean;
  outdoor?: boolean;
  maxResults?: number;
}

export class AIService {
  private static instance: AIService;
  private lastRequestTime: number = 0;
  private requestThrottleMs: number = 1000;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async generateDateIdeas(options: AIServiceOptions = {}): Promise<DateIdea[]> {
    const now = Date.now();
    if (now - this.lastRequestTime < this.requestThrottleMs) {
      await new Promise(resolve =>
        setTimeout(resolve, this.requestThrottleMs - (now - this.lastRequestTime))
      );
    }
    this.lastRequestTime = Date.now();

    try {
      const { location = "local area", preferences = [], budget, maxResults = 5 } = options;

      const response = await fetch('/api/date-ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, preferences, budget, maxResults }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.ideas || [];
    } catch (error) {
      console.error("Error generating date ideas:", error);
      toast.error("Failed to generate date ideas. Using fallback suggestions.");
      return this.getFallbackDateIdeas();
    }
  }

  private getFallbackDateIdeas(): DateIdea[] {
    return [
      {
        id: 1001,
        title: "Picnic in the Park",
        description: "Pack a basket with your favorite snacks, a blanket, and head to a local park for a relaxing afternoon together.",
        category: "Outdoor",
        duration: "2-3 hours",
        cost: "Low",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&h=500"
      },
      {
        id: 1002,
        title: "Home Cooking Challenge",
        description: "Choose a new recipe neither of you has tried before and cook it together at home.",
        category: "Indoor",
        duration: "2-3 hours",
        cost: "Medium",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&h=500"
      },
      {
        id: 1003,
        title: "Local Museum Visit",
        description: "Explore a local museum or art gallery you haven't visited before.",
        category: "Indoor",
        duration: "2-4 hours",
        cost: "Low",
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=800&h=500"
      }
    ];
  }
}

import { apiConfig } from "@/lib/api-config";
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
  private requestThrottleMs: number = 1000; // Minimum time between requests

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate date ideas based on location and preferences
   */
  public async generateDateIdeas(options: AIServiceOptions = {}): Promise<DateIdea[]> {
    const { openai } = apiConfig.apiKeys;
    
    if (!openai) {
      toast.error("OpenAI API key is not configured. Please add it in settings.");
      return this.getFallbackDateIdeas();
    }

    // Throttle requests
    const now = Date.now();
    if (now - this.lastRequestTime < this.requestThrottleMs) {
      await new Promise(resolve => 
        setTimeout(resolve, this.requestThrottleMs - (now - this.lastRequestTime))
      );
    }
    this.lastRequestTime = Date.now();

    try {
      const { location = "local area", preferences = [], budget, indoor, outdoor, maxResults = 5 } = options;
      
      // Build the prompt
      let prompt = `Generate ${maxResults} unique date ideas`;
      
      if (location) {
        prompt += ` for couples in ${location}`;
      }
      
      if (preferences.length > 0) {
        prompt += ` who enjoy ${preferences.join(", ")}`;
      }
      
      if (budget) {
        prompt += ` with a ${budget.toLowerCase()} budget`;
      }
      
      if (indoor && !outdoor) {
        prompt += ` for indoor activities`;
      } else if (outdoor && !indoor) {
        prompt += ` for outdoor activities`;
      }
      
      prompt += `. For each idea, provide a title, detailed description, category, estimated duration, cost level (Free, Low, Medium, High), and a rating out of 5. If applicable, include a specific location name and address. Format the response as a JSON array.`;

      const response = await fetch(`${apiConfig.endpoints.openai}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openai}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates creative and romantic date ideas for couples."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content in response");
      }

      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Could not parse JSON from response");
      }

      const ideas: DateIdea[] = JSON.parse(jsonMatch[0]);
      
      // Add IDs to the ideas and ensure rating is a number
      return ideas.map((idea, index) => {
        // Generate a random rating between 4.0 and 5.0 if none exists
        const defaultRating = 4 + Math.random();
        
        // Ensure rating is a number
        let rating: number;
        if (typeof idea.rating === 'number') {
          rating = idea.rating;
        } else if (idea.rating && typeof idea.rating === 'string') {
          rating = parseFloat(idea.rating);
        } else {
          rating = defaultRating;
        }
        
        // Ensure rating is valid
        if (isNaN(rating)) {
          rating = defaultRating;
        }
        
        return {
          ...idea,
          id: Date.now() + index,
          rating,
          image: idea.image || this.getRandomImageForCategory(idea.category)
        };
      });
    } catch (error) {
      console.error("Error generating date ideas:", error);
      toast.error("Failed to generate date ideas. Using fallback suggestions.");
      return this.getFallbackDateIdeas();
    }
  }

  /**
   * Get fallback date ideas when API fails
   */
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

  /**
   * Get a random image URL for a category
   */
  private getRandomImageForCategory(category: string): string {
    const categoryImages: Record<string, string[]> = {
      "Outdoor": [
        "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&h=500",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=500",
        "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=800&h=500"
      ],
      "Indoor": [
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&h=500",
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&h=500",
        "https://images.unsplash.com/photo-1542628682-88321d2a4828?auto=format&fit=crop&w=800&h=500"
      ],
      "Food": [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&h=500",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&h=500",
        "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&h=500"
      ],
      "Adventure": [
        "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&h=500",
        "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=800&h=500",
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&h=500"
      ],
      "Romantic": [
        "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=800&h=500",
        "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=800&h=500",
        "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=800&h=500"
      ]
    };

    // Default category if not found
    const images = categoryImages[category] || categoryImages["Romantic"];
    return images[Math.floor(Math.random() * images.length)];
  }
} 
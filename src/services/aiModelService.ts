/**
 * AI Model Abstraction Layer
 *
 * Routes AI tasks to the appropriate model based on task complexity
 * and user subscription tier. Supports multiple providers:
 *
 * - **Gemini Flash** (free tier): Fast, lightweight tasks
 * - **Claude Sonnet 4.5** (premium): Daily sessions, personalized content
 * - **Claude Opus 4.5** (premium reports): Personality reports, mirror narratives
 *
 * All services should use this instead of direct API calls.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type AIProvider = "gemini" | "claude-sonnet" | "claude-opus" | "openai";

export type AITaskType =
  | "daily-session"         // Learn/Implement/Reflect generation
  | "personality-inference"  // Signal extraction from responses
  | "question-generation"    // Generating personalized questions
  | "micro-action"           // Personalizing micro-action templates
  | "mirror-narrative"       // Day 14 personality narrative (premium)
  | "weekly-insight"         // Weekly pattern summary
  | "date-ideas"             // Date idea generation
  | "coaching"               // AI coaching responses
  | "reflection-analysis";   // Analyzing reflection responses

export type SubscriptionTier = "free" | "premium" | "ultimate";

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
  temperature: number;
  endpoint: string;
}

export interface AIRequest {
  taskType: AITaskType;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
}

// ─── Provider Configurations ────────────────────────────────────────────────

const PROVIDER_CONFIGS: Record<AIProvider, AIModelConfig> = {
  gemini: {
    provider: "gemini",
    model: "gemini-2.0-flash",
    maxTokens: 2000,
    temperature: 0.7,
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
  },
  "claude-sonnet": {
    provider: "claude-sonnet",
    model: "claude-sonnet-4-5-20250929",
    maxTokens: 2000,
    temperature: 0.7,
    endpoint: "https://api.anthropic.com/v1",
  },
  "claude-opus": {
    provider: "claude-opus",
    model: "claude-opus-4-6",
    maxTokens: 4000,
    temperature: 0.6,
    endpoint: "https://api.anthropic.com/v1",
  },
  openai: {
    provider: "openai",
    model: "gpt-4o-mini",
    maxTokens: 1500,
    temperature: 0.7,
    endpoint: "https://api.openai.com/v1",
  },
};

// ─── Task → Provider Routing ────────────────────────────────────────────────

/** Maps each task type to the best provider for each subscription tier */
const TASK_ROUTING: Record<AITaskType, Record<SubscriptionTier, AIProvider>> = {
  "daily-session": {
    free: "gemini",
    premium: "claude-sonnet",
    ultimate: "claude-sonnet",
  },
  "personality-inference": {
    free: "gemini",
    premium: "claude-sonnet",
    ultimate: "claude-sonnet",
  },
  "question-generation": {
    free: "gemini",
    premium: "claude-sonnet",
    ultimate: "claude-sonnet",
  },
  "micro-action": {
    free: "gemini",
    premium: "claude-sonnet",
    ultimate: "claude-sonnet",
  },
  "mirror-narrative": {
    free: "gemini",
    premium: "claude-opus",
    ultimate: "claude-opus",
  },
  "weekly-insight": {
    free: "gemini",
    premium: "claude-sonnet",
    ultimate: "claude-sonnet",
  },
  "date-ideas": {
    free: "gemini",
    premium: "claude-sonnet",
    ultimate: "claude-sonnet",
  },
  coaching: {
    free: "gemini",
    premium: "claude-sonnet",
    ultimate: "claude-sonnet",
  },
  "reflection-analysis": {
    free: "gemini",
    premium: "claude-sonnet",
    ultimate: "claude-sonnet",
  },
};

// ─── Service ────────────────────────────────────────────────────────────────

export class AIModelService {
  private static instance: AIModelService;
  private subscriptionTier: SubscriptionTier = "free";
  private lastRequestTime = 0;
  private minRequestInterval = 500; // ms between requests

  private constructor() {}

  static getInstance(): AIModelService {
    if (!AIModelService.instance) {
      AIModelService.instance = new AIModelService();
    }
    return AIModelService.instance;
  }

  /** Update the subscription tier (call when tier changes) */
  setSubscriptionTier(tier: SubscriptionTier): void {
    this.subscriptionTier = tier;
  }

  /** Get which provider will be used for a given task */
  getProviderForTask(taskType: AITaskType): AIProvider {
    return TASK_ROUTING[taskType][this.subscriptionTier];
  }

  /**
   * Send a request to the appropriate AI model based on task type
   * and subscription tier. Handles routing, throttling, and fallbacks.
   */
  async complete(request: AIRequest): Promise<AIResponse> {
    // Throttle requests
    await this.throttle();

    const provider = this.getProviderForTask(request.taskType);
    const config = PROVIDER_CONFIGS[provider];

    try {
      return await this.callProvider(provider, config, request);
    } catch (error) {
      console.warn(`Primary provider ${provider} failed, trying fallback:`, error);
      // Fallback chain: claude → openai → gemini
      return this.callWithFallback(request, provider);
    }
  }

  // ─── Provider-Specific Calls ────────────────────────────────────────────

  private async callProvider(
    provider: AIProvider,
    config: AIModelConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    switch (provider) {
      case "gemini":
        return this.callGemini(config, request);
      case "claude-sonnet":
      case "claude-opus":
        return this.callClaude(config, request);
      case "openai":
        return this.callOpenAI(config, request);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async callGemini(
    config: AIModelConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    const apiKey = this.getApiKey("gemini");
    if (!apiKey) throw new Error("Gemini API key not configured");

    const response = await fetch(
      `${config.endpoint}/models/${config.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${request.systemPrompt}\n\n${request.userPrompt}` },
              ],
            },
          ],
          generationConfig: {
            temperature: request.temperature ?? config.temperature,
            maxOutputTokens: request.maxTokens ?? config.maxTokens,
            ...(request.jsonMode ? { responseMimeType: "application/json" } : {}),
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      content,
      provider: "gemini",
      model: config.model,
      tokensUsed: data.usageMetadata?.totalTokenCount,
    };
  }

  private async callClaude(
    config: AIModelConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    const apiKey = this.getApiKey("claude");
    if (!apiKey) throw new Error("Claude API key not configured");

    const response = await fetch(`${config.endpoint}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: request.maxTokens ?? config.maxTokens,
        system: request.systemPrompt,
        messages: [{ role: "user", content: request.userPrompt }],
        ...(request.temperature !== undefined
          ? { temperature: request.temperature }
          : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content =
      data.content?.[0]?.type === "text" ? data.content[0].text : "";

    return {
      content,
      provider: config.provider,
      model: config.model,
      tokensUsed:
        (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    };
  }

  private async callOpenAI(
    config: AIModelConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    const apiKey = this.getApiKey("openai");
    if (!apiKey) throw new Error("OpenAI API key not configured");

    const response = await fetch(`${config.endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        temperature: request.temperature ?? config.temperature,
        max_tokens: request.maxTokens ?? config.maxTokens,
        ...(request.jsonMode
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return {
      content,
      provider: "openai",
      model: config.model,
      tokensUsed: data.usage?.total_tokens,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async callWithFallback(
    request: AIRequest,
    failedProvider: AIProvider
  ): Promise<AIResponse> {
    const fallbackOrder: AIProvider[] = [
      "claude-sonnet",
      "openai",
      "gemini",
    ];

    for (const provider of fallbackOrder) {
      if (provider === failedProvider) continue;

      try {
        const config = PROVIDER_CONFIGS[provider];
        return await this.callProvider(provider, config, request);
      } catch {
        continue;
      }
    }

    throw new Error("All AI providers failed");
  }

  private getApiKey(provider: "gemini" | "claude" | "openai"): string | undefined {
    const envKeys: Record<string, string> = {
      gemini: import.meta.env.VITE_GEMINI_API_KEY || "",
      claude: import.meta.env.VITE_ANTHROPIC_API_KEY || "",
      openai: import.meta.env.VITE_OPENAI_API_KEY || "",
    };

    const key = envKeys[provider];
    if (key) return key;

    // Fall back to localStorage-stored keys
    try {
      const stored = JSON.parse(
        localStorage.getItem("sparq-connect-api-keys") || "{}"
      );
      const storageMap: Record<string, string> = {
        gemini: "google",
        claude: "anthropic",
        openai: "openai",
      };
      return stored[storageMap[provider]] || undefined;
    } catch {
      return undefined;
    }
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minRequestInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minRequestInterval - elapsed)
      );
    }
    this.lastRequestTime = Date.now();
  }
}

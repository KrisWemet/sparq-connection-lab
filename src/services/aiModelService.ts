/**
 * AI Model Service - Kimi K2.5 via NVIDIA NIM API
 *
 * Routes all AI tasks to Kimi K2.5 (moonshotai/kimi-k2.5) via NVIDIA NIM.
 * Supports two modes based on subscription tier:
 *
 * - **Free tier**: "instant" mode - fast responses without reasoning (temp 0.6, 2048 tokens)
 * - **Premium tier**: "thinking" mode - deep reasoning and personalization (temp 1.0, 4096 tokens)
 *
 * All services should use this instead of direct API calls.
 */

import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AIProvider = "kimi-k2.5";

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
  reasoning?: string; // Only populated in premium "thinking" mode
}

// ─── Configuration ──────────────────────────────────────────────────────────

const NVIDIA_NIM_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL_ID = "moonshotai/kimi-k2.5";

/** Rate limiting: NVIDIA free tier has 40 RPM limit */
const MAX_REQUESTS_PER_MINUTE = 40;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

// ─── Service ────────────────────────────────────────────────────────────────

export class AIModelService {
  private static instance: AIModelService;
  private subscriptionTier: SubscriptionTier = "free";

  // Rate limiting queue
  private requestQueue: Array<{
    resolve: (value: AIResponse) => void;
    reject: (error: Error) => void;
    request: AIRequest;
  }> = [];
  private requestTimestamps: number[] = [];
  private isProcessingQueue = false;

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

  /** Get which provider will be used for a given task (always Kimi K2.5) */
  getProviderForTask(_taskType: AITaskType): AIProvider {
    return "kimi-k2.5";
  }

  /**
   * Send a request to Kimi K2.5 via NVIDIA NIM API.
   * Handles rate limiting, mode selection, and error recovery.
   */
  async complete(request: AIRequest): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, request });
      this.processQueue();
    });
  }

  // ─── Queue Processing ───────────────────────────────────────────────────

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      // Check rate limit
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter(
        (ts) => now - ts < RATE_LIMIT_WINDOW_MS
      );

      if (this.requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
        // Wait until oldest request expires from the window
        const oldestTimestamp = Math.min(...this.requestTimestamps);
        const waitTime = RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp);
        await new Promise((resolve) => setTimeout(resolve, waitTime + 100));
        continue;
      }

      // Process next request
      const item = this.requestQueue.shift();
      if (!item) break;

      this.requestTimestamps.push(now);

      try {
        const response = await this.callKimi(item.request);
        item.resolve(response);
      } catch (error) {
        console.error("Kimi K2.5 API call failed:", error);
        item.reject(error as Error);
      }

      // Small delay between requests to avoid bursts
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.isProcessingQueue = false;
  }

  // ─── Kimi K2.5 API Call ─────────────────────────────────────────────────

  private async callKimi(request: AIRequest): Promise<AIResponse> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      const error = "NVIDIA API key not configured. Please add VITE_NVIDIA_API_KEY to your environment.";
      toast.error(error);
      throw new Error(error);
    }

    // Determine mode based on subscription tier
    const isPremium = this.subscriptionTier === "premium" || this.subscriptionTier === "ultimate";
    const config = this.getConfig(isPremium);

    // Build messages array (OpenAI-compatible format)
    const messages = [
      { role: "system", content: request.systemPrompt },
      { role: "user", content: request.userPrompt },
    ];

    // Build request body
    const requestBody: Record<string, unknown> = {
      model: MODEL_ID,
      messages,
      temperature: request.temperature ?? config.temperature,
      max_tokens: request.maxTokens ?? config.maxTokens,
    };

    // Add JSON mode if requested (Kimi supports response_format)
    if (request.jsonMode) {
      requestBody.response_format = { type: "json_object" };
    }

    // Premium mode: enable thinking/reasoning
    if (isPremium) {
      // Kimi K2.5 supports reasoning via special parameters
      // Based on Kimi's API docs, reasoning is enabled by default with higher temp
      requestBody.thinking = true; // Enable reasoning/thinking mode
    }

    try {
      const response = await fetch(NVIDIA_NIM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        const error = `Kimi K2.5 API error (${response.status}): ${errorText}`;

        // Show user-friendly error toast
        if (response.status === 401) {
          toast.error("AI service authentication failed. Please check your API key.");
        } else if (response.status === 429) {
          toast.error("AI service rate limit reached. Please try again in a moment.");
        } else if (response.status >= 500) {
          toast.error("AI service temporarily unavailable. Please try again.");
        } else {
          toast.error("AI service error. Please try again.");
        }

        throw new Error(error);
      }

      const data = await response.json();

      // Extract content from OpenAI-compatible response
      const content = data.choices?.[0]?.message?.content || "";

      if (!content) {
        throw new Error("Empty response from Kimi K2.5");
      }

      // Extract reasoning if available (premium mode)
      const reasoning = isPremium && data.choices?.[0]?.message?.reasoning
        ? data.choices[0].message.reasoning
        : undefined;

      // Extract token usage
      const tokensUsed = data.usage?.total_tokens;

      return {
        content,
        provider: "kimi-k2.5",
        model: MODEL_ID,
        tokensUsed,
        reasoning,
      };
    } catch (error) {
      // If it's already our custom error, re-throw
      if (error instanceof Error && error.message.includes("Kimi K2.5")) {
        throw error;
      }

      // Network or unexpected errors
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error("Unable to connect to AI service. Please check your connection.");
      throw new Error(`Kimi K2.5 request failed: ${errorMessage}`);
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  /**
   * Get configuration based on subscription tier.
   * Free = instant mode, Premium/Ultimate = thinking mode.
   */
  private getConfig(isPremium: boolean): AIModelConfig {
    return {
      provider: "kimi-k2.5",
      model: MODEL_ID,
      endpoint: NVIDIA_NIM_ENDPOINT,
      // Free tier: instant mode (faster, cheaper)
      // Premium tier: thinking mode (deeper, more personalized)
      maxTokens: isPremium ? 4096 : 2048,
      temperature: isPremium ? 1.0 : 0.6,
    };
  }

  /**
   * Get NVIDIA API key from environment or localStorage fallback.
   */
  private getApiKey(): string | undefined {
    // Try environment variable first
    const envKey = import.meta.env.VITE_NVIDIA_API_KEY;
    if (envKey) return envKey;

    // Fall back to localStorage-stored keys
    try {
      const stored = JSON.parse(
        localStorage.getItem("sparq-connect-api-keys") || "{}"
      );
      return stored.nvidia || undefined;
    } catch {
      return undefined;
    }
  }
}

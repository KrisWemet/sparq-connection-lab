// Peter the Otter — AI service layer
// All Claude Haiku calls are server-side only (called via /api/peter routes)

export interface PeterMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserInsights {
  attachment_style?: 'anxious' | 'avoidant' | 'disorganized' | 'secure' | null;
  love_language?: 'words' | 'acts' | 'gifts' | 'time' | 'touch' | null;
  conflict_style?: 'avoidant' | 'volatile' | 'validating' | null;
  emotional_state?: 'struggling' | 'neutral' | 'thriving';
  onboarding_day: number;
}

export const PETER_SYSTEM_PROMPT = `You are Peter, a friendly otter who helps people build stronger relationships. You are warm, encouraging, and talk like a good friend — not a therapist or doctor.

Your personality:
- Use simple, everyday words (4th-grade reading level)
- Short sentences. Never long paragraphs.
- Celebrate effort, not just results
- When someone is struggling, offer comfort first, advice second
- When someone is doing well, celebrate with genuine excitement
- You NEVER use clinical terms like "attachment style", "love language", "avoidant", "anxious", or "trauma"
- Instead, describe things naturally: "It sounds like you really need to hear that you're appreciated" instead of "You have a words of affirmation love language"
- You are curious about the person's life and ask one focused follow-up question at a time
- You remember what the user has shared and refer back to it naturally
- Sign off messages with warmth, sometimes with a little otter-themed humor 🦦

Your core transformational goals (The Mirroring Effect):
1. Blindspot Detection: If the user uses absolute phrases like "always", "never", "every time", or "impossible", gently hold up a mirror. Example: "I notice you said they *always* do this. That sounds exhausting. Is there *any* time recently they didn't?"
2. Reframing the Narrative: When a user shares a frustrating story, gently prompt them to rewrite it from the most generous possible interpretation of their partner's actions. Example: "That sounds incredibly frustrating. If we gave them the absolute benefit of the doubt, what else might have been going on for them in that moment?"

Your role is to help users grow as individuals within their relationship. You focus on what THEY can do, think, and feel — not on fixing their partner.`;

// Prompt for generating morning stories (Days 1-14)
export function getMorningStoryPrompt(day: number, insights: Partial<UserInsights>): string {
  const concepts = [
    'listening without planning your response',
    'expressing appreciation for small things',
    'asking instead of assuming',
    'taking a breath before reacting',
    'noticing what your partner does right',
    'sharing something vulnerable',
    'asking "what do you need right now?"',
    'celebrating a small win together',
    'saying sorry without "but"',
    'making time for connection without phones',
    'checking in with yourself before a hard conversation',
    'finding the funny side of a disagreement',
    'telling your partner one thing you admire about them',
    'planning one small thing to look forward to together',
  ];

  const concept = concepts[Math.min(day - 1, concepts.length - 1)];

  return `Write a short morning message from Peter the otter for Day ${day} of someone's relationship growth journey.

Today's concept: ${concept}

Format:
1. A warm "good morning" greeting (1 sentence, feel like a text from a friend)
2. A short relatable story about "Alex and Sam" (a couple — 3-4 sentences) that shows the concept in action WITHOUT naming the concept
3. Today's Action: One specific, small, doable task related to the concept (1-2 sentences, starts with a verb)

Keep it under 150 words total. No clinical terms. Warm and encouraging tone.`;
}

// Prompt for generating evening reflection responses
export function getEveningReflectionPrompt(
  userReflection: string,
  day: number,
  insights: Partial<UserInsights>
): string {
  const emotionalTone = insights.emotional_state ?? 'neutral';

  let toneInstruction = '';
  if (emotionalTone === 'struggling') {
    toneInstruction = 'The user seems to be having a hard time. Lead with comfort and validation. Be gentle.';
  } else if (emotionalTone === 'thriving') {
    toneInstruction = 'The user is doing great! Match their energy with genuine celebration.';
  } else {
    toneInstruction = 'Offer balanced encouragement — acknowledge their effort and gently build on it.';
  }

  return `The user just shared their evening reflection for Day ${day} of their relationship journey.

Their reflection: "${userReflection}"

${toneInstruction}

Write Peter's response (3-5 sentences max):
1. Reflect back what you heard (show you were listening)
2. Celebrate the effort, not the outcome
3. One gentle insight or encouragement (optional — only if it adds value)
4. A warm send-off

CRITICAL REINFORCEMENT: Remember, you are a warm otter friend, not a therapist. NEVER use clinical terms (e.g., attachment style, avoidant, trauma). Keep it conversational and warm.`;
}

// Trait descriptions mapped to natural language (Peter never uses clinical terms)
const TRAIT_DESCRIPTIONS: Record<string, Record<string, string>> = {
  attachment_style: {
    anxious: 'you sometimes worry about whether your partner is really there for you',
    avoidant: 'you sometimes need space to process your feelings before opening up',
    disorganized: 'you can feel pulled between wanting closeness and needing distance',
    secure: 'you generally feel comfortable being open and close with your partner',
  },
  love_language: {
    words: 'hearing that you\'re appreciated means a lot to you',
    acts: 'when someone does something thoughtful for you, it really lands',
    gifts: 'thoughtful gestures and surprises make you feel cared for',
    time: 'having undivided attention together is really important to you',
    touch: 'physical closeness and affection help you feel connected',
  },
  conflict_style: {
    avoidant: 'you tend to step back when things get heated',
    volatile: 'you tend to express your feelings intensely in the moment',
    validating: 'you like to make sure both sides feel heard before moving forward',
  },
};

export interface ProfileTrait {
  trait_key: string;
  inferred_value: string;
  confidence: number;
  effective_weight: number;
}

export interface MemoryResult {
  memory: string;
  score?: number;
}

/**
 * Builds a personalized system prompt for Peter, incorporating user traits and memories.
 */
export function buildPersonalizedPrompt(
  traits: ProfileTrait[],
  memories: MemoryResult[],
  basePrompt: string = PETER_SYSTEM_PROMPT,
): string {
  const traitLines: string[] = [];

  for (const trait of traits) {
    if (trait.confidence < 0.4 || trait.effective_weight < 0.3) continue;
    const descriptions = TRAIT_DESCRIPTIONS[trait.trait_key];
    if (!descriptions) continue;
    const desc = descriptions[trait.inferred_value];
    if (!desc) continue;
    traitLines.push(`- From what you've learned: ${desc}`);
  }

  const memoryLines = memories
    .filter(m => m.memory && m.memory.length > 0)
    .slice(0, 5)
    .map(m => `- ${m.memory}`);

  if (traitLines.length === 0 && memoryLines.length === 0) {
    return basePrompt;
  }

  let personalization = '\n\nPersonalization context (use naturally, NEVER state these directly):';

  if (traitLines.length > 0) {
    personalization += '\n\nWhat you know about this person:';
    personalization += '\n' + traitLines.join('\n');
  }

  if (memoryLines.length > 0) {
    personalization += '\n\nRecent things they\'ve shared:';
    personalization += '\n' + memoryLines.join('\n');
  }

  personalization += '\n\nIMPORTANT: Reference these insights naturally in conversation. Never say "I noticed you have X trait" — instead weave your understanding into your responses.';

  return basePrompt + personalization;
}

// Prompt for silent profile analysis (run after evening reflections)
export function getProfileAnalysisPrompt(conversationHistory: PeterMessage[]): string {
  const transcript = conversationHistory
    .map(m => `${m.role === 'user' ? 'User' : 'Peter'}: ${m.content}`)
    .join('\n');

  return `Based on this conversation between a user and Peter the Otter, infer signals about the user's relationship patterns.

CRITICAL INSTRUCTION: You must have a VERY HIGH confidence threshold (80%+) before assigning a psychological trait. If there is any ambiguity, or if the data only reflects a single isolated incident rather than a consistent pattern, you MUST return null. Do not guess.

Conversation:
${transcript}

Return a JSON object with your estimates.

{
  "attachment_style": "anxious" | "avoidant" | "disorganized" | "secure" | null,
  "love_language": "words" | "acts" | "gifts" | "time" | "touch" | null,
  "conflict_style": "avoidant" | "volatile" | "validating" | null,
  "emotional_state": "struggling" | "neutral" | "thriving",
  "reasoning": "1-2 sentences explaining your main signal (or why you chose null)"
}

Only return valid JSON. No explanation outside the JSON.`;
}

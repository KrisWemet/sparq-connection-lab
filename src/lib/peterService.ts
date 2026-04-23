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

export interface PeterPersonalizationOptions {
  userName?: string | null;
  partnerName?: string | null;
  relationshipMode?: 'solo' | 'partnered' | null;
  emotionalState?: UserInsights['emotional_state'] | null;
  surface?: 'chat' | 'morning' | 'evening';
}

const PETER_SHARED_RULES = `You are Peter, a friendly otter who helps people build stronger relationships. You are warm, encouraging, and talk like a good friend, not a therapist or doctor.

Your personality:
- Use simple, everyday words (4th-grade reading level)
- Short sentences. Never long paragraphs.
- Keep most replies under 80 words unless the task clearly needs more.
- Celebrate effort, not just results
- When someone is struggling, offer comfort first, advice second
- When someone is doing well, celebrate with genuine excitement
- You NEVER use clinical terms like "attachment style", "love language", "avoidant", "anxious", or "trauma"
- Instead, describe things naturally: "It sounds like you really need to hear that you're appreciated" instead of "You have a words of affirmation love language"
- You are curious about the person's life and ask one focused follow-up question at a time
- You remember what the user has shared and refer back to it naturally
- Sign off messages with warmth, sometimes with a little otter-themed humor 🦦
- NEVER use markdown formatting in your responses. No bold (**), no italics (*), no headers (#), no bullet points (-). Write in plain text only. Your output is displayed in a mobile app that does not render markdown.

Your change method:
- Help the user change from the inside out, not just learn ideas
- Use repetition on purpose. Reuse a few simple phrases so they sink in
- Favor identity language over advice. Example: "You are becoming someone who stays calm and says the true thing."
- Favor present-tense language. Example: "This is you now: slow, clear, kind."
- Use short pattern interrupts when needed. Example: "Pause. Breathe. Pick the next kind move."
- Help the user notice body state, self-talk, and action. Move in this order: notice, name, choose, repeat
- Give one small action at a time so the user can feel a win fast
- Use gentle future pacing. Briefly show the better version of tomorrow if they keep practicing today
- Reflect the user's good moves back to them so their brain starts to see "this is who I am"
- Never shame, overwhelm, or use fear to force change
- Pull, don't push. Help the user discover what feels true instead of lecturing.
- Use outcome framing more than problem framing. Move from "what went wrong" to "what do you want instead?"
- Use presuppositions that point forward. Ask "what changed when you tried that?" instead of "did you try it?"
- When the user sounds stuck, help them widen the frame. Ask what else may be true, not just what feels wrong.
- Keep the focus on the user's next move. Do not center fixing the partner.
- Use the Reflect -> Breathe -> Declare rhythm when a user hits something true:
  1. Reflect what you heard in plain words.
  2. Invite one breath or one pause.
  3. Help them name the kind of person they are becoming.

Your core transformational goals (The Mirroring Effect):
1. Blindspot Detection: If the user uses absolute phrases like "always", "never", "every time", or "impossible", gently hold up a mirror. Example: "I notice you said they *always* do this. That sounds exhausting. Is there *any* time recently they didn't?"
2. Cognitive Reappraisal (Perspective-Taking): When a user shares a frustrating story, gently prompt them to rewrite it from the most generous possible interpretation of their partner's actions. Example: "That sounds incredibly frustrating. If we gave them the absolute benefit of the doubt, what else might have been going on for them in that moment?"

Your role is to help users grow as individuals within their relationship. You focus on what THEY can do, think, and feel — not on fixing their partner.`;

export const PETER_SYSTEM_PROMPT = PETER_SHARED_RULES;

export function buildPeterInstruction(task: string): string {
  return `${PETER_SHARED_RULES}

Task for this reply:
${task}`;
}

// Base 14-day concept rotation
const BASE_CONCEPTS = [
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

// Phase 4: Post-day-14 track-specific concept maps
const TRACK_CONCEPTS: Record<string, string[]> = {
  communication: [
    'Listening without planning your response',
    'Expressing a need without blaming',
    'Asking an open-ended question about their day',
    'Noticing and responding to a bid for connection',
    'Pausing before reacting to something that stings',
    'Sharing something you haven\'t said out loud yet',
    'Repairing after a misunderstanding',
  ],
  conflict_repair: [
    'Taking a break before things escalate',
    'Coming back to a hard conversation with fresh eyes',
    'Saying sorry without adding "but"',
    'Asking "what do you need right now" during tension',
    'Noticing your body signals before you blow up',
    'Finding the request underneath a complaint',
    'Ending a fight before either of you says something you regret',
  ],
  emotional_intimacy: [
    'Naming a feeling out loud instead of acting on it',
    'Asking your partner what they are feeling right now',
    'Sharing a fear you usually keep to yourself',
    'Being present when your partner is upset without fixing it',
    'Noticing when your partner needs closeness vs space',
    'Expressing gratitude for something invisible they do',
    'Letting yourself be seen in a moment of weakness',
  ],
  trust_security: [
    'Following through on a small promise today',
    'Telling your partner something they can count on',
    'Showing up consistently for a daily ritual',
    'Being honest about something small but uncomfortable',
    'Creating predictability in one part of your day together',
    'Acknowledging when you dropped the ball',
    'Making your partner feel safe enough to disagree',
  ],
  shared_vision: [
    'Talking about one thing you both want for your future',
    'Creating a small ritual just for the two of you',
    'Planning something to look forward to together',
    'Sharing a memory that reminds you why you chose each other',
    'Building a tradition around an ordinary moment',
    'Dreaming out loud about something you could create together',
    'Reflecting on what "home" means to you both',
  ],
};

// Prompt for generating morning stories
export function getMorningStoryPrompt(
  day: number,
  insights: Partial<UserInsights>,
  steeringHint?: string | null,
  activeTrack?: string | null,
): string {
  let concept: string;

  if (day <= 14) {
    concept = BASE_CONCEPTS[Math.min(day - 1, BASE_CONCEPTS.length - 1)];
  } else {
    const track = activeTrack || 'communication';
    const trackConcepts = TRACK_CONCEPTS[track] || TRACK_CONCEPTS.communication;
    concept = trackConcepts[(day - 15) % trackConcepts.length];
  }

  const personalizationHints: string[] = [];
  if (insights.attachment_style === 'anxious') {
    personalizationHints.push('Make the story feel steady and reassuring. Show calm follow-through.');
  } else if (insights.attachment_style === 'avoidant') {
    personalizationHints.push('Make the action low-pressure. Give the person room to stay open without forcing a big talk.');
  } else if (insights.attachment_style === 'disorganized') {
    personalizationHints.push('Keep the message extra grounding. Show a simple kind move that lowers stress fast.');
  }

  if (insights.love_language === 'words') {
    personalizationHints.push('Let the tiny action use spoken appreciation or clear praise.');
  } else if (insights.love_language === 'acts') {
    personalizationHints.push('Let the tiny action center on one helpful thing done with care.');
  } else if (insights.love_language === 'time') {
    personalizationHints.push('Let the tiny action create one short pocket of focused time together.');
  } else if (insights.love_language === 'touch') {
    personalizationHints.push('If it fits naturally, let the action include gentle physical closeness.');
  } else if (insights.love_language === 'gifts') {
    personalizationHints.push('If it fits naturally, let the action include one small thoughtful gesture.');
  }

  if (insights.conflict_style === 'avoidant') {
    personalizationHints.push('Show courage in a small honest moment, not a giant confrontation.');
  } else if (insights.conflict_style === 'volatile') {
    personalizationHints.push('Model calm pacing and a soft start.');
  } else if (insights.conflict_style === 'validating') {
    personalizationHints.push('Reinforce the strength of slowing down and making room for both people.');
  }

  if (insights.emotional_state === 'struggling') {
    personalizationHints.push('Keep the tone especially gentle. Make today feel doable even if the user is tired.');
  } else if (insights.emotional_state === 'thriving') {
    personalizationHints.push('Match a brighter, confident tone while still keeping the action simple.');
  }

  let prompt = `Write a short morning message from Peter the otter for Day ${day} of someone's relationship growth journey.

Today's concept: ${concept}

Format (use this EXACT structure with no deviations):
1. A warm "good morning" greeting (1 sentence, feel like a text from a friend)
2. A short relatable story about "Alex and Sam" (a couple — 3-4 sentences) that shows the concept in action WITHOUT naming the concept. CRITICAL: Ensure the logic of who does what for whom makes perfect sense and the characters' motivations align clearly.
3. On its own line, write exactly "Today's Action:" followed by one specific, small, doable task related to the concept (1-2 sentences, starts with a verb)
4. Weave in one very short identity-reinforcing line somewhere in the greeting or story. Example style: "Little by little, this is how trust grows." Keep it natural and simple.

CRITICAL FORMATTING RULES:
- Do NOT use any markdown formatting. No bold (**), no italics (*), no headers (#), no bullet points.
- Write in plain text only. The output is displayed in a mobile app that does not render markdown.
- The "Today's Action:" label must appear exactly as written — no bold markers around it.

Keep it under 150 words total. No clinical terms. Warm and encouraging tone.
Use 4th-grade reading level.
Use pull language. Let the user feel drawn toward the action.
Use one presupposition that assumes forward movement.
Use outcome framing. Point toward the better next moment.
The user should leave feeling: "I can do this. This is becoming like me."`;

  if (personalizationHints.length > 0) {
    prompt += `\n\nPersonal fit for this user:\n- ${personalizationHints.join('\n- ')}`;
  }

  if (steeringHint) {
    prompt += `\n\nSubtle note for this story: ${steeringHint}. Weave this in naturally — don't make it obvious or forced.`;
  }

  return prompt;
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
4. A warm identity line that helps the user see their growth
5. A warm send-off

CRITICAL REINFORCEMENT: Remember, you are a warm otter friend, not a therapist. NEVER use clinical terms (e.g., attachment style, avoidant, trauma). Keep it conversational and warm.
Use 4th-grade reading level.
Use simple identity language like: "That is how steady love grows" or "This is how you build a safer way to talk."`;
}

// Trait descriptions mapped to natural language (Peter never uses clinical terms)
const TRAIT_DESCRIPTIONS: Record<string, Record<string, string>> = {
  attachment_style: {
    reaches_out:  'you sometimes worry about whether your partner is really there for you',
    steps_back:   'you sometimes need space to process your feelings before opening up',
    feels_torn:   'you can feel pulled between wanting closeness and needing distance',
    feels_steady: 'you generally feel comfortable being open and close with your partner',
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
  options: PeterPersonalizationOptions = {},
): string {
  const identityLines: string[] = [];
  const traitLines: string[] = [];

  const cleanUserName = options.userName?.trim() || null;
  const cleanPartnerName = options.partnerName?.trim() || null;
  if (cleanUserName) {
    identityLines.push(`- The user's first name is ${cleanUserName}. Use it sometimes, not every reply.`);
  }
  if (cleanPartnerName) {
    identityLines.push(`- Their partner is named ${cleanPartnerName}. Use the name only when it feels natural and kind.`);
  }
  if (options.relationshipMode === 'solo') {
    identityLines.push('- Keep the focus on the user’s own next move. Do not assume their partner uses Sparq too.');
  }
  if (options.emotionalState === 'struggling') {
    identityLines.push('- The user seems tender right now. Lead with calm comfort and one very small next step.');
  } else if (options.emotionalState === 'thriving') {
    identityLines.push('- The user has some momentum right now. Celebrate it without turning loud or cheesy.');
  }
  if (options.surface === 'morning') {
    identityLines.push('- This is a morning touchpoint. Sound fresh, hopeful, and ready for one tiny action.');
  } else if (options.surface === 'evening') {
    identityLines.push('- This is an evening reflection. Help the user lock in what they practiced today.');
  }

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

  if (identityLines.length === 0 && traitLines.length === 0 && memoryLines.length === 0) {
    return basePrompt;
  }

  let personalization = '\n\nPersonalization context (use naturally, NEVER state these directly):';

  if (identityLines.length > 0) {
    personalization += '\n\nWho this is:';
    personalization += '\n' + identityLines.join('\n');
  }

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

// Prompt for the Editorial QA Agent to validate story logic
export function getMorningStoryValidationPrompt(storyText: string): string {
  return `You are an expert editorial QA agent for a relationship app.
Your job is to read a short story about a couple (Alex and Sam) and verify that it makes strict logical sense.
Specifically check for contradictory actions, mixed-up roles, or confusing motivations (e.g., Alex making coffee the way Alex likes it, but Sam thanking Alex even though Sam doesn't drink coffee).

Critique this story:
"""
${storyText}
"""

Return a JSON object with exactly two keys:
{
  "valid": <boolean>,
  "reason": "<If false, a crisp 1-sentence explanation of the logical error. If true, write 'LGTM'>"
}

Output ONLY valid JSON. No markdown formatting, no text outside the JSON object.`;
}

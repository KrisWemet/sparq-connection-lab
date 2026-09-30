// src/pages/api/peter/onboarding.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PETER_SYSTEM_PROMPT, type PeterMessage } from '@/lib/peterService';
import { buildCrisisResponse, detectCrisisIntent, resolveCountryCode } from '@/lib/safety';
import { trackPrimaryPathServerError } from '@/lib/server/beta-ops';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { stripMarkdown } from '@/lib/strip-markdown';
import { peterChat } from '@/lib/openrouter';
import {
  getOnboardingHandoffPolicy,
  ONBOARDING_MAX_EXCHANGES,
  normalizeOnboardingClosingMessage,
  READY_TO_CLOSE_MARKER,
  resolveOnboardingShouldClose,
} from '@/lib/onboarding/peterHandoffPolicy';
import type { DerivedProfile } from '@/lib/onboarding/types';

// Openings offer a first guess, never a verdict (constitution §2): the user
// has answered a few questions, and they are the judge of who they are.
const ATTACHMENT_OPENINGS: Record<string, string> = {
  anxious: `Hey {firstName}. Thanks for sharing all that. Here's my first guess, and tell me if I'm off: you feel things fast, and that comes from caring a lot. When things are really calm between you and {partnerRef}, can you rest in it? Or does part of you wait for the other shoe to drop?`,
  avoidant: `Hey {firstName}. Thanks for sharing all that. My first guess, and tell me if I'm off: you might be the one who stays steady when things get loud. I'm curious. Right before you step back in a hard moment, what's happening inside?`,
  disorganized: `Hey {firstName}. Thank you for trusting me with some big things. Whatever you've carried, we'll go at your pace. Can I ask: is there one time you remember feeling truly safe? Anywhere, with anyone, any moment.`,
  secure: `Hey {firstName}. Thanks for sharing all that. It sounds like there's some real steadiness in you, though I'm still getting to know you. If things got really good between you and {partnerRef}, what would that look like for you?`,
};

function buildOnboardingSystemPrompt(profile: DerivedProfile): string {
  const partnerRef = profile.partnerName ?? 'your partner';
  const opening = (ATTACHMENT_OPENINGS[profile.attachmentStyle] ?? ATTACHMENT_OPENINGS.secure)
    .replace(/{firstName}/g, profile.firstName)
    .replace(/{partnerRef}/g, partnerRef);

  const freeTextContext = Object.keys(profile.freeTextAnswers).length > 0
    ? `\n\nFree-text answers they gave during onboarding (for context only — do NOT quote these back):\n${Object.entries(profile.freeTextAnswers).map(([i, t]) => `Q${i}: "${t}"`).join('\n')}`
    : '';

  return `${PETER_SYSTEM_PROMPT}

ONBOARDING SESSION:
${profile.firstName} just answered a few getting-started questions. From them you have a first, tentative picture — a guess, not a verdict. This is a short 2-${ONBOARDING_MAX_EXCHANGES} exchange conversation to build connection, give them one genuinely useful moment, and transition them to their first journey.

TONE MODE: ${profile.toneMode}
PRIMARY APPROACHES: ${profile.primaryModalities.join(', ')}

YOUR OPENING MESSAGE (send this as your first response — do not deviate):
"${opening}"
${freeTextContext}

SESSION RULES:
- Maximum ${ONBOARDING_MAX_EXCHANGES} exchanges total.
- Ask at most one question per response.
- If they say your guess does not fit, thank them warmly and follow their version. They are the judge of who they are.
- Aim to leave them with one useful thing: their own words for what they want, or one small thing to notice this week.
- Never reference the onboarding questions directly.
- Never use clinical language (no "attachment style", "avoidant", "anxious", "trauma", "dysregulation").
- Only add a warm sign-off on your final message. Mid-session responses end cleanly without a sign-off.
- By exchange 3, prefer closing instead of opening a new thread.
- When you have enough context to close warmly and make a journey recommendation, end your response with ${READY_TO_CLOSE_MARKER}
- Your final closing message MUST be formatted as exactly two lines separated by a newline (\\n):
  Line 1: One specific observation about this person, offered as a warm hunch built from what they said (for example "I have a hunch that..."), never as a fact about who they are. No sign-off on this line.
  Line 2: "Let me show you where I think we start. 🦦"
- The client extracts line 1 as the closing sentence displayed in the journey recommendation screen. Line 2 is stripped.`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, profile, exchangeCount } = req.body as {
    messages: PeterMessage[];
    profile: DerivedProfile;
    exchangeCount: number;
  };

  if (!messages || !Array.isArray(messages) || !profile) {
    return res.status(400).json({ error: 'messages and profile are required' });
  }

  const latestUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';

  // Auth required — check before LLM call
  const authed = await getAuthedContext(req);
  if (!authed) return res.status(401).json({ error: 'Unauthorized' });

  // Crisis detection always on
  const crisisDetection = await detectCrisisIntent(latestUserMessage);

  if (crisisDetection.triggered) {
    const countryCode = resolveCountryCode(req);
    return res.status(200).json({
      message: buildCrisisResponse(countryCode, crisisDetection.types),
      shouldClose: false,
      safety: { triggered: true },
    });
  }

  const handoffPolicy = getOnboardingHandoffPolicy(exchangeCount);

  const systemPrompt = buildOnboardingSystemPrompt(profile);

  try {
    const rawMessage = await peterChat({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        ...(handoffPolicy.preferClose && !handoffPolicy.forceClose
          ? [{ role: 'system' as const, content: `You likely have enough context now. Prefer closing on this turn. Ask no new question unless it is truly necessary. If you can close warmly now, end with ${READY_TO_CLOSE_MARKER}.` }]
          : []),
        ...(handoffPolicy.forceClose
          ? [{ role: 'system' as const, content: `This is exchange ${ONBOARDING_MAX_EXCHANGES} of ${ONBOARDING_MAX_EXCHANGES} — your final message. Do not ask another question. Close warmly with your specific observation about this person, then end with ${READY_TO_CLOSE_MARKER} and "Let me show you where I think we start. 🦦"` }]
          : []),
      ],
      maxTokens: 512,
    });

    const shouldClose = resolveOnboardingShouldClose(exchangeCount, rawMessage);
    const safeMessage = shouldClose
      ? normalizeOnboardingClosingMessage(rawMessage)
      : rawMessage.replace(READY_TO_CLOSE_MARKER, '').trim();
    const message = stripMarkdown(safeMessage);

    return res.status(200).json({
      message,
      shouldClose,
      safety: { triggered: false },
    });
  } catch (err) {
    await trackPrimaryPathServerError(authed.supabase, authed.userId, 'onboarding_peter', err, {
      exchange_count: exchangeCount,
    });
    console.error('peter/onboarding error:', err);
    return res.status(500).json({ error: 'Peter is having a moment. Please try again.' });
  }
}

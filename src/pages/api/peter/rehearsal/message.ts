import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT } from '@/lib/peterService';
import { stripMarkdown } from '@/lib/strip-markdown';
import { detectCrisisIntent, resolveCountryCode, buildCrisisResponse } from '@/lib/safety';
import type { ChatMessage } from '@/lib/openrouter';

type Ctx = { supabase: SupabaseClient<any>; userId: string };

type RehearsalPhase = 'setup' | 'intensity_selection' | 'rehearsal' | 'debrief' | 'debrief_close';

type RequestBody = {
  session_id: string;
  phase: RehearsalPhase;
  message: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  setup_question_index?: 1 | 2 | 3;
  intensity_level?: 'gentle' | 'realistic' | 'challenging';
};

const ATTACHMENT_DESCRIPTORS: Record<string, string> = {
  anxious: 'someone who needs reassurance and can feel easily dismissed when stressed',
  avoidant: 'someone who tends to withdraw and needs space to process before engaging',
  disorganized: 'someone whose responses can feel unpredictable — sometimes wanting closeness, sometimes pulling away',
  secure: 'someone who can generally stay present and engaged, though may still get defensive under stress',
};

function attachmentDescriptor(style: string | null | undefined): string {
  if (!style) return 'someone who responds in a typical human way — sometimes guarded, sometimes open';
  return ATTACHMENT_DESCRIPTORS[style] || 'someone who responds in a typical human way — sometimes guarded, sometimes open';
}

function buildRehearsalOverlay(
  situationSummary: string,
  intensityLevel: string,
  partnerDescriptor: string,
): string {
  return `You are currently playing the role of the user's partner in a safe rehearsal exercise.
Your job is to respond as a real person would — not as a therapist-coached ideal, and not as an abusive worst-case. Realistic, human, imperfect.

Partner context: ${partnerDescriptor}
Situation: ${situationSummary.slice(0, 500)}
Your emotional register: calibrated to intensity level "${intensityLevel}"

Hard rules:
1. No contempt, mockery, sarcasm, or character attacks.
2. No response that feels final, hopeless, or like the door is completely closed.
3. Every response must contain at least one signal of humanity or underlying openness — a question, an expression of feeling beneath the defensiveness, or an acknowledgment, even if small. Never end on pure rejection.
4. Keep responses concise — 2–4 sentences. Real partners don't monologue.
5. Match emotional intensity to the selected level:
   - gentle: receptive with mild hesitation
   - realistic: distracted, mildly defensive, occasionally redirects
   - challenging: resistant, deflects, pushes back — but still human underneath`;
}

const DEBRIEF_OVERLAY = `You just completed a rehearsal with this user. You are back as yourself — Peter.
The rehearsal is over. Your job is to debrief warmly.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as RequestBody;
  const { session_id, phase, message, messages = [], setup_question_index, intensity_level } = body;

  if (!session_id || !phase || message === undefined) {
    return res.status(400).json({ error: 'session_id, phase, and message are required' });
  }

  try {
    // Fetch session — verify ownership
    const { data: session, error: sessionError } = await ctx.supabase
      .from('rehearsal_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', ctx.userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Crisis detection — always first, every phase
    const crisisResult = await detectCrisisIntent(message);
    if (crisisResult.triggered) {
      const countryCode = resolveCountryCode(req);
      const crisisText = buildCrisisResponse(countryCode, crisisResult.types);

      const crisisPrefix = phase === 'rehearsal'
        ? 'I need to step out of the rehearsal for a moment.\n\n'
        : '';

      return res.status(200).json({
        peter_message: crisisPrefix + crisisText,
        shouldClose: true,
      });
    }

    // ── Phase routing ──

    if (phase === 'setup') {
      return handleSetup(ctx, session, message, messages, setup_question_index ?? 1, res);
    }

    if (phase === 'intensity_selection') {
      return handleIntensitySelection(ctx, session, intensity_level ?? 'realistic', res);
    }

    if (phase === 'rehearsal') {
      return handleRehearsal(ctx, session, message, messages, res);
    }

    if (phase === 'debrief') {
      return handleDebrief(ctx, session, messages, res);
    }

    if (phase === 'debrief_close') {
      return handleDebriefClose(ctx, session, messages, res);
    }

    return res.status(400).json({ error: 'Invalid phase' });
  } catch (err) {
    console.error('Rehearsal message error:', err);
    return res.status(500).json({ error: 'Peter is having a moment. Please try again.' });
  }
}

// ── Setup phase ──
async function handleSetup(
  ctx: Ctx,
  session: Record<string, unknown>,
  message: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  setupQuestionIndex: 1 | 2 | 3,
  res: NextApiResponse,
) {
  const isValidAnswer = message.trim().length >= 10;

  if (!isValidAnswer) {
    const followUp = await peterChat({
      messages: [
        { role: 'system', content: PETER_SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message },
        { role: 'user', content: 'Ask a gentle follow-up to get more detail. Keep it to one warm sentence.' },
      ],
      maxTokens: 80,
    });
    return res.status(200).json({
      peter_message: stripMarkdown(followUp).trim(),
    });
  }

  // Write validated answer to DB
  const qKey = `setup_q${setupQuestionIndex}` as 'setup_q1' | 'setup_q2' | 'setup_q3';
  await ctx.supabase
    .from('rehearsal_sessions')
    .update({ [qKey]: message.trim() })
    .eq('id', session.id);

  // Q3 accepted → generate situation summary + transition
  if (setupQuestionIndex === 3) {
    const q1 = (session.setup_q1 as string | null) || '';
    const q2 = (session.setup_q2 as string | null) || '';
    const q3 = message.trim();

    let situationSummary = [q1, q2, q3].filter(Boolean).join(' ').slice(0, 500);
    let topicCategory: string = 'other';

    try {
      const classifyResult = await peterChat({
        messages: [
          {
            role: 'system',
            content: 'You are a classification assistant. Output ONLY valid JSON.',
          },
          {
            role: 'user',
            content: `Summarize this situation and classify it. Output ONLY JSON:
{
  "summary": "one sentence summary of the core situation (max 500 chars)",
  "category": "one of: communication | conflict | needs | intimacy | trust | boundaries | other"
}

Q1 (situation): ${q1}
Q2 (what they need heard): ${q2}
Q3 (what they fear): ${q3}`,
          },
        ],
        maxTokens: 300,
      });

      const parsed = JSON.parse(classifyResult.trim());
      const validCategories = ['communication', 'conflict', 'needs', 'intimacy', 'trust', 'boundaries', 'other'];
      if (parsed.summary) situationSummary = String(parsed.summary).slice(0, 500);
      if (parsed.category && validCategories.includes(parsed.category)) {
        topicCategory = parsed.category;
      }
    } catch {
      // Classification failure — use fallback values
    }

    await ctx.supabase
      .from('rehearsal_sessions')
      .update({ situation_summary: situationSummary, topic_category: topicCategory })
      .eq('id', session.id);

    const q3Response = await peterChat({
      messages: [
        { role: 'system', content: PETER_SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message },
        {
          role: 'user',
          content: 'Respond warmly to what they shared about what they fear. Acknowledge it briefly. Keep it to 1–2 sentences.',
        },
      ],
      maxTokens: 100,
    });

    return res.status(200).json({
      peter_message: stripMarkdown(q3Response).trim(),
      next_phase: 'intensity_dial',
      answer_accepted: true,
    });
  }

  // Q1 or Q2 accepted → generate next question
  const nextQPrompt = setupQuestionIndex === 1
    ? 'Now ask: "What do you most need them to hear?" Keep it conversational — one sentence.'
    : 'Now ask: "What are you most afraid will happen when you bring it up?" Keep it to one warm sentence.';

  const nextQ = await peterChat({
    messages: [
      { role: 'system', content: PETER_SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
      { role: 'user', content: nextQPrompt },
    ],
    maxTokens: 100,
  });

  return res.status(200).json({
    peter_message: stripMarkdown(nextQ).trim(),
    answer_accepted: true,
  });
}

// ── Intensity selection phase ──
async function handleIntensitySelection(
  ctx: Ctx,
  session: Record<string, unknown>,
  intensityLevel: 'gentle' | 'realistic' | 'challenging',
  res: NextApiResponse,
) {
  await ctx.supabase
    .from('rehearsal_sessions')
    .update({ intensity_level: intensityLevel })
    .eq('id', session.id);

  // Fetch partner name if available
  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('partner_name, partner_id')
    .eq('id', ctx.userId)
    .maybeSingle();

  const partnerName = (profile as { partner_name?: string | null; partner_id?: string | null } | null)?.partner_name;
  const partnerRef = partnerName || 'your partner';

  const transitionMessage = await peterChat({
    messages: [
      { role: 'system', content: PETER_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Tell the user you're stepping into the role of ${partnerRef} now. Say: "Okay. I'm going to be ${partnerRef} now. Remember — this is practice, and I'm on your side no matter what." Then add a brief warm sentence matching the intensity level they chose: "${intensityLevel}". Keep the whole thing to 2–3 sentences.`,
      },
    ],
    maxTokens: 120,
  });

  return res.status(200).json({
    peter_message: stripMarkdown(transitionMessage).trim(),
    next_phase: 'rehearsal',
  });
}

// ── Rehearsal phase ──
async function handleRehearsal(
  ctx: Ctx,
  session: Record<string, unknown>,
  message: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  res: NextApiResponse,
) {
  const intensityLevel = (session.intensity_level as string) || 'realistic';
  const situationSummary = (session.situation_summary as string | null)
    || [(session.setup_q1 as string | null), (session.setup_q2 as string | null), (session.setup_q3 as string | null)]
      .filter(Boolean).join(' ').slice(0, 500)
    || 'A personal conversation between partners.';

  // Determine partner attachment style descriptor
  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('partner_id')
    .eq('id', ctx.userId)
    .maybeSingle();

  const partnerId = (profile as { partner_id?: string | null } | null)?.partner_id;
  let partnerDescriptor: string;

  if (partnerId) {
    // Try partner's attachment style from user_insights
    const { data: partnerInsights } = await ctx.supabase
      .from('user_insights')
      .select('attachment_style')
      .eq('user_id', partnerId)
      .maybeSingle();

    const partnerStyle = (partnerInsights as { attachment_style?: string | null } | null)?.attachment_style;

    if (partnerStyle) {
      partnerDescriptor = attachmentDescriptor(partnerStyle);
    } else {
      // Fall back to user's own attachment style as proxy
      const { data: userTraits } = await ctx.supabase
        .from('profile_traits')
        .select('inferred_value')
        .eq('user_id', ctx.userId)
        .eq('trait_key', 'attachment_style')
        .maybeSingle();
      partnerDescriptor = attachmentDescriptor((userTraits as { inferred_value?: string | null } | null)?.inferred_value);
    }
  } else {
    // Solo user — derive from setup Q3 (what they fear) if available
    const q3 = (session.setup_q3 as string | null) || '';
    if (q3) {
      partnerDescriptor = `someone whose response pattern matches what the user fears: "${q3.slice(0, 100)}"`;
    } else {
      partnerDescriptor = 'someone who responds in a typical human way — sometimes guarded, sometimes open';
    }
  }

  // Increment exchange count
  const newExchangeCount = ((session.exchange_count as number) || 0) + 1;
  await ctx.supabase
    .from('rehearsal_sessions')
    .update({ exchange_count: newExchangeCount })
    .eq('id', session.id);

  const overlay = buildRehearsalOverlay(situationSummary, intensityLevel, partnerDescriptor);

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: overlay },
    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message },
  ];

  // After 5 exchanges, inject soft-close system message
  if (newExchangeCount >= 5) {
    chatMessages.push({
      role: 'system',
      content: 'The user may be ready to end the rehearsal. You may gently offer to close.',
    });
  }

  const peterResponse = await peterChat({
    messages: chatMessages,
    maxTokens: 200,
    temperature: 0.8,
  });

  const responseBody: Record<string, unknown> = {
    peter_message: stripMarkdown(peterResponse).trim(),
  };

  if (newExchangeCount >= 5) {
    responseBody.suggested_close = true;
  }

  return res.status(200).json(responseBody);
}

// ── Debrief phase ──
async function handleDebrief(
  ctx: Ctx,
  session: Record<string, unknown>,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  res: NextApiResponse,
) {
  const situationSummary = (session.situation_summary as string | null) || 'their situation';
  const intensityLevel = (session.intensity_level as string) || 'realistic';
  const exchangeCount = (session.exchange_count as number) || 0;

  const debriefSystem = `${PETER_SYSTEM_PROMPT}

${DEBRIEF_OVERLAY}

Situation context: ${situationSummary.slice(0, 300)}
Intensity played: ${intensityLevel}
Exchanges completed: ${exchangeCount}

Your job now: Name ONE specific thing you observed during the rehearsal. Ask one grounding question if it deepens the insight. Keep it to 3–4 sentences. Be warm and specific — not generic.`;

  const debriefMessages: ChatMessage[] = [
    { role: 'system', content: debriefSystem },
    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  if (messages.length === 0) {
    // First debrief turn — Peter opens
    debriefMessages.push({
      role: 'user',
      content: 'The rehearsal just ended. Open the debrief.',
    });
  }

  const debriefResponse = await peterChat({
    messages: debriefMessages,
    maxTokens: 200,
  });

  return res.status(200).json({
    peter_message: stripMarkdown(debriefResponse).trim(),
  });
}

// ── Debrief close phase ──
async function handleDebriefClose(
  ctx: Ctx,
  session: Record<string, unknown>,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  res: NextApiResponse,
) {
  const situationSummary = (session.situation_summary as string | null) || 'their situation';
  const intensityLevel = (session.intensity_level as string) || 'realistic';
  const exchangeCount = (session.exchange_count as number) || 0;

  const debriefCloseSystem = `${PETER_SYSTEM_PROMPT}

${DEBRIEF_OVERLAY}

Situation context: ${situationSummary.slice(0, 300)}
Intensity played: ${intensityLevel}
Exchanges completed: ${exchangeCount}

This is the final debrief exchange. Close warmly, then end your response with:
ANCHOR: [one sentence the user can carry into the real conversation]

The ANCHOR: line must be on its own line at the very end. It must be a single actionable sentence (under 150 characters) the user can hold onto.`;

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: debriefCloseSystem },
    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  if (messages.length === 0) {
    chatMessages.push({
      role: 'user',
      content: 'Close the debrief warmly and give me my anchor.',
    });
  }

  const rawResponse = await peterChat({
    messages: chatMessages,
    maxTokens: 200,
  });

  // Parse ANCHOR: marker
  const lines = rawResponse.split('\n');
  const anchorLine = lines.find(l => l.trimStart().startsWith('ANCHOR: '));
  let peterAnchor: string;

  if (anchorLine) {
    peterAnchor = anchorLine.replace(/^.*ANCHOR:\s*/, '').trim().slice(0, 150);
  } else {
    // Fallback: last sentence of response
    const sentences = rawResponse.match(/[^.!?]+[.!?]+/g) || [];
    const last = sentences.filter(s => s.trim().length <= 150).pop()?.trim();
    peterAnchor = last ?? rawResponse.slice(0, 150).trim();
  }

  // Strip ANCHOR line from message
  const peterMessage = rawResponse
    .split('\n')
    .filter(l => !l.trimStart().startsWith('ANCHOR: '))
    .join('\n')
    .trim();

  // Persist anchor
  await ctx.supabase
    .from('rehearsal_sessions')
    .update({ peter_anchor: peterAnchor })
    .eq('id', session.id);

  return res.status(200).json({
    peter_message: stripMarkdown(peterMessage).trim(),
    peter_anchor: peterAnchor,
    next_phase: 'close',
  });
}

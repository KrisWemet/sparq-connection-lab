import type { NextApiRequest, NextApiResponse } from 'next';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT, PeterMessage, buildPersonalizedPrompt, type ProfileTrait, type MemoryResult } from '@/lib/peterService';
import { buildCrisisResponse, detectCrisisIntent, resolveCountryCode } from '@/lib/safety';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { resolveEntitlements } from '@/lib/server/entitlements';
import { trackEvent } from '@/lib/server/analytics';
import { searchMemories, buildOwnWordsBlock } from '@/lib/server/memory';
import { loadPrivacyState } from '@/lib/server/privacy';
import { assessReflectionQuality } from '@/lib/server/reflection-quality';
import { stripMarkdown } from '@/lib/strip-markdown';
import { classifyMoment, decideMode } from '@/lib/server/conversation-mode';
import { buildDoNotRepushBlock, detectVoicedInsight, loadRecentRejections, recordRejection, rejectedTraitKeys } from '@/lib/server/rejected-hypotheses';
import { applyRejectionEvidence, type TraitRow } from '@/lib/server/trait-revision';
import { buildConversationPrefsBlock, cleanPrefs } from '@/lib/server/insight-profile';
import { buildPatternContext, buildLegacyTraits, buildPatternLevels, patternContextToTraits } from '@/lib/server/attachment-context';
import { getPatternHints } from '@/lib/server/pattern-hints';
import { logFinalPrompt } from '@/lib/server/dev-prompt-log';
import { getActiveGrowthMomentForChat, markMomentSurfaced, buildGrowthMomentBlock } from '@/lib/server/growth-moments';
import { getNorthStarState, buildLadderPromptBlock, processLadderTurn, getActiveNorthStar, buildNorthStarOrientation, type NorthStarState } from '@/lib/server/north-star';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemOverride, eveningContext } = req.body as {
    messages: PeterMessage[];
    systemOverride?: string;
    eveningContext?: {
      day: number;
      morningAction: string;
      turnNumber: number;
      reflectionPrompt?: string;
      journeyTitle?: string;
    };
  };

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const latestUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

    // Run auth + crisis detection in parallel
    const [authed, crisisDetection] = await Promise.all([
      getAuthedContext(req),
      detectCrisisIntent(latestUserMessage),
    ]);

    if (crisisDetection.triggered) {
      const countryCode = resolveCountryCode(req);
      // Master PRD §4.2/§7 (locked): manual help link only — no crisis
      // monitoring. The safety_events insert here logged VERBATIM matched
      // phrases from the user's message, and the analytics event recorded
      // that a person was in crisis. Both removed: Peter still answers with
      // resources, but nothing about it is stored or tracked.
      return res.status(200).json({
        message: buildCrisisResponse(countryCode, crisisDetection.types),
        safety: { triggered: true, countryCode, types: crisisDetection.types },
        usage: { remaining_daily_messages: null, limit_reached: false },
      });
    }

    // Check entitlements + usage cap
    let remainingDailyMessages: number | null = null;
    if (authed) {
      const entitlements = await resolveEntitlements(authed.supabase, authed.userId);
      const cap = entitlements.coach_message_limit_per_day;
      if (cap != null) {
        const today = new Date().toISOString().slice(0, 10);
        const { data: usageRow } = await authed.supabase
          .from('coach_usage_daily')
          .select('message_count')
          .eq('user_id', authed.userId)
          .eq('usage_date', today)
          .maybeSingle();

        const used = usageRow?.message_count || 0;
        remainingDailyMessages = Math.max(0, cap - used);

        if (used >= cap) {
          return res.status(200).json({
            message:
              "You've hit today's coach message limit on the free plan. Conflict First Aid is still available anytime, and your next message opens tomorrow.",
            safety: { triggered: false },
            usage: { remaining_daily_messages: 0, limit_reached: true },
          });
        }
      }
    }

    // Build personalized system prompt (traits + memories in parallel)
    let systemPrompt = systemOverride || PETER_SYSTEM_PROMPT;

    // North Star state (spec §4/§5) — resolved inside the personalization
    // block (single loadPrivacyState), consumed at the evening block and
    // post-LLM marker site.
    let ladderState: NorthStarState | null = null;
    let privacyCanStoreMemories = false;

    if (authed && !systemOverride) {
      try {
        const privacy = await loadPrivacyState(authed.supabase, authed.userId);
        privacyCanStoreMemories = privacy.can_store_memories;

        if (privacy.can_personalize) {
          if (eveningContext) {
            const st = await getNorthStarState(authed.supabase, authed.userId, eveningContext.day);
            if (st.shouldLadderTonight) ladderState = st;
          }
          const [patternContext, patternLevels, legacyTraits, memResult, profileResult, insightsResult] = await Promise.all([
            buildPatternContext(authed.supabase, authed.userId),
            buildPatternLevels(authed.supabase, authed.userId),
            buildLegacyTraits(authed.supabase, authed.userId),
            privacy.can_store_memories
              ? searchMemories(authed.userId, latestUserMessage, 5).catch(() => ({ results: [] }))
              : Promise.resolve({ results: [] }),
            authed.supabase
              .from('profiles')
              .select('name, partner_name')
              .eq('id', authed.userId)
              .maybeSingle(),
            authed.supabase
              .from('user_insights')
              .select('emotional_state')
              .eq('user_id', authed.userId)
              .maybeSingle(),
          ]);

          const traits: ProfileTrait[] = [
            ...patternContextToTraits(patternContext),
            ...legacyTraits,
          ];
          const memories: MemoryResult[] = (memResult?.results || []).map((r: any) => ({
            memory: r.memory || r.content || '',
            score: r.score,
          }));

          systemPrompt = buildPersonalizedPrompt(traits, memories, PETER_SYSTEM_PROMPT, {
            userName: profileResult.data?.name,
            partnerName: profileResult.data?.partner_name,
            relationshipMode: privacy.preferences.relationship_mode,
            emotionalState: insightsResult.data?.emotional_state ?? null,
            surface: eveningContext ? 'evening' : 'chat',
          });

          // Self-discoveries + chosen experiments (Person Model V1), and the
          // guesses they told Peter don't fit — never re-pushed (v1.1 §6A).
          if (privacy.can_store_memories) {
            systemPrompt += await buildOwnWordsBlock(authed.supabase, authed.userId);
            const rejections = await loadRecentRejections(authed.supabase, authed.userId);
            systemPrompt += buildDoNotRepushBlock(rejections);
            for (const key of rejectedTraitKeys(rejections)) patternLevels[key] = 'excluded';
          }

          // How the user asked Peter to talk with them (Insight Profile, their
          // own settings — v1.1 §3, §5A Liking). These outrank inferred tone hints.
          const { data: prefsRow } = await authed.supabase
            .from('user_preferences')
            .select('conversation_prefs')
            .eq('user_id', authed.userId)
            .maybeSingle();
          systemPrompt += buildConversationPrefsBlock(cleanPrefs(prefsRow?.conversation_prefs));

          // Phase 23: append chat tone hints (D-03). Tone always applies.
          const { chatToneHints, insightLines } = getPatternHints(patternContext, 'chat', patternLevels);
          if (chatToneHints.length > 0) {
            systemPrompt += '\n\nTone guidance for this conversation:\n- ' + chatToneHints.join('\n- ');
          }

          // On a North Star ladder night Peter has ONE job: run the ladder to
          // bedrock. Insight skeletons ("you may quietly observe...") and a
          // growth-moment block ("name this change, then hand it back") are
          // competing instructions that pull him off it — and worse, the
          // growth moment was being marked consumed while he was busy
          // laddering, burning a verified moment the user never heard.
          // Both are suppressed on ladder nights; they return the next night.
          if (!ladderState) {
            if (insightLines.length > 0) {
              systemPrompt += '\n\n' + insightLines.join('\n');
            }

            // Growth Engine (spec §5.1): at most one verified moment per conversation.
            // Known tradeoff: the moment is marked consumed when APPENDED to the
            // prompt, but the block allows Peter to stay silent — a moment can be
            // consumed without being voiced. Acceptable: it still appears in the
            // Mirror and Day-14 reveal, and output inspection isn't available.
            const growthMoment = await getActiveGrowthMomentForChat(authed.supabase, authed.userId);
            if (growthMoment) {
              const block = buildGrowthMomentBlock(growthMoment);
              if (block) {
                systemPrompt += block;
                // Mark chat-consumed (fire-and-forget; 7-day cooldown enforced on read)
                markMomentSurfaced(authed.supabase, growthMoment.id);
              }
            }
          }

          // North Star orientation (spec §5) — quiet ideal-self shaping.
          // Skipped while a ladder is open (the ladder block handles the line).
          if (!ladderState) {
            const northStarLine = await getActiveNorthStar(authed.supabase, authed.userId);
            if (northStarLine) {
              systemPrompt += buildNorthStarOrientation(northStarLine);
            }
          }
        }
      } catch (personalizeError) {
        console.error('Personalization error (falling back to base prompt):', personalizeError);
      }
    }

    // North Star ladder night (spec §4): replace the normal evening context
    // entirely. The turn-3 forced close in the else-branch is thereby
    // suppressed; buildLadderPromptBlock enforces its own bounds and a
    // turn-11 hard wrap, with processLadderTurn's turn-12 cap as the net.
    // Timing intelligence (constitution v1.2 §6B): when the user is depleted,
    // stabilizing beats any growth move — including a ladder night or a
    // "tell me more" nudge.
    const stabilizeNow = classifyMoment(latestUserMessage) === 'depleted';

    if (eveningContext && ladderState) {
      systemPrompt += buildLadderPromptBlock(ladderState, eveningContext.turnNumber, eveningContext.day);
      if (stabilizeNow) {
        systemPrompt += `\n\nOVERRIDE: They are overwhelmed right now. Do not ladder tonight and ask no deeper questions. Comfort them in a few plain words, offer one optional slow breath, tell them nothing is due, and end the message with [[NORTH_STAR_DEFERRED]].`;
      }
    } else if (eveningContext) {
      // Append evening context with reflection quality nudging (Phase 3)
      const { day, morningAction, turnNumber, reflectionPrompt, journeyTitle } = eveningContext;

      // Journey context preamble
      const journeyCtx = journeyTitle ? ` (${journeyTitle})` : '';

      if (turnNumber >= 3) {
        // Natural close — Peter wraps up warmly, no more questions
        systemPrompt += `\n\nEVENING CHECK-IN CONTEXT (Day ${day}${journeyCtx}):\nToday's action was: "${morningAction}"\nThis is the closing message. Give a warm, brief summary of what you heard tonight (2-3 sentences). End with an encouraging closing line like "Rest well — I'll have something new for you tomorrow." Do NOT ask any follow-up questions. Do NOT invite more sharing. This is a natural, satisfying ending to the conversation.`;
      } else {
        const wrapUp = turnNumber >= 2
          ? " This is likely their last message — keep your response warm and brief. Do not ask another question unless their message clearly invites more conversation."
          : '';
        systemPrompt += `\n\nEVENING CHECK-IN CONTEXT (Day ${day}${journeyCtx}):\nToday's action was: "${morningAction}"\nReflect back what you heard warmly. Celebrate effort, not outcome. 3-4 sentences, no clinical terms.${wrapUp}`;

        // Use journey-specific reflection prompt as conversation opener when available
        if (reflectionPrompt && turnNumber === 0) {
          systemPrompt += `\n\nThe reflection question for tonight is: "${reflectionPrompt}". Use this as your opening question instead of a generic prompt. Weave it naturally into your greeting.`;
        }

        // Assess reflection quality and nudge Peter's response style
        const quality = assessReflectionQuality(latestUserMessage);
        if (quality.depth === 'shallow' && turnNumber < 2 && !stabilizeNow) {
          systemPrompt += `\n\nThe user's response was brief. Warmly reflect what they shared, then gently invite more detail with a specific follow-up question. Don't pressure — just be curious. Example: "I hear you — can you tell me about one specific moment from today?"`;
        } else if (quality.depth === 'deep') {
          systemPrompt += `\n\nThe user shared something meaningful. Acknowledge the depth and specificity. Celebrate their openness. Don't push for more — honor what they gave you.`;
        }
      }
    }

    // Constitution §6: suggest the smallest useful move for this reply.
    // Skipped on ladder nights (the ladder owns the turn), on the evening
    // closing turn (no questions), and for custom system overrides.
    const isClosingTurn = Boolean(eveningContext && eveningContext.turnNumber >= 3);
    if (!systemOverride && !ladderState && !isClosingTurn) {
      const decision = decideMode(latestUserMessage);
      if (decision.instruction) systemPrompt += decision.instruction;

      // Resistance is information (v1.1 §6A): remember what Peter got wrong so
      // it is never offered again. Fire-and-forget; honors memory settings.
      if (decision.signal === 'pushback' && authed && privacyCanStoreMemories) {
        const lastUserIndex = messages.map(m => m.role).lastIndexOf('user');
        const previousPeter = [...messages.slice(0, Math.max(0, lastUserIndex))].reverse().find(m => m.role === 'assistant')?.content || '';
        if (previousPeter) {
          const voicedKey = detectVoicedInsight(previousPeter);
          void (async () => {
            await recordRejection(authed.supabase, authed.userId, {
              hypothesisRef: voicedKey ? `trait:${voicedKey}` : null,
              offeredAs: voicedKey ? 'insight' : 'reflection',
              offeredText: previousPeter,
              userResponse: latestUserMessage,
            });
            if (voicedKey) {
              const { data: trait } = await authed.supabase
                .from('profile_traits')
                .select('id, inferred_value, confidence, status, evidence, counter_evidence, candidate_value, candidate_confidence')
                .eq('user_id', authed.userId)
                .eq('trait_key', voicedKey)
                .maybeSingle();
              if (trait) {
                await authed.supabase
                  .from('profile_traits')
                  .update(applyRejectionEvidence(trait as TraitRow, `They said it didn't fit: ${latestUserMessage}`))
                  .eq('id', trait.id);
              }
            }
          })().catch(() => {});
        }
      }
    }

    logFinalPrompt('peter/chat', systemPrompt);

    // Core LLM call
    const rawMessage = await peterChat({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      maxTokens: 512,
    });

    // North Star markers parse on RAW output before stripMarkdown (spec §4).
    // turnNumber drives the deterministic turn-12 hard close — the ladder can
    // never stay open past it regardless of what the LLM emitted.
    let ladderActive = false;
    let preStripped = rawMessage;
    if (ladderState && authed && eveningContext) {
      const result = await processLadderTurn(
        authed.supabase, authed.userId, ladderState, rawMessage,
        latestUserMessage, privacyCanStoreMemories, eveningContext.turnNumber,
      );
      preStripped = result.visibleMessage;
      ladderActive = result.ladderOpen;
    }
    const message = stripMarkdown(preStripped);

    // Return response immediately — do usage tracking in the background
    // (Vercel will keep the function alive briefly for fire-and-forget promises)
    if (authed) {
      const today = new Date().toISOString().slice(0, 10);
      const updateUsage = async () => {
        try {
          const { data: usageRow } = await authed.supabase
            .from('coach_usage_daily')
            .select('message_count')
            .eq('user_id', authed.userId)
            .eq('usage_date', today)
            .maybeSingle();
          const nextCount = (usageRow?.message_count || 0) + 1;
          await authed.supabase.from('coach_usage_daily').upsert(
            {
              user_id: authed.userId,
              usage_date: today,
              message_count: nextCount,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,usage_date' }
          );
        } catch {}
      };
      // Fire and forget
      updateUsage();
      trackEvent(authed.supabase, authed.userId, 'coach_message_sent', {
        remaining_daily_messages: remainingDailyMessages,
      });
      if (remainingDailyMessages != null) {
        remainingDailyMessages = Math.max(0, remainingDailyMessages - 1);
      }
    }

    return res.status(200).json({
      message,
      safety: { triggered: false },
      ladder_active: ladderActive,
      usage: { remaining_daily_messages: remainingDailyMessages, limit_reached: false },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Peter chat error:', errMsg);
    return res.status(500).json({ error: 'Peter is taking a nap — try again in a moment 🦦' });
  }
}

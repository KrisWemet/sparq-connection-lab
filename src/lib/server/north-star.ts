// north-star.ts — single owner of North Star ladder state (spec §4).
// Adaptive values laddering: variable depth, what/how phrasing, bedrock
// detection, max 4 follow-ups. All functions fail-soft — a ladder failure
// must always degrade to a normal evening check-in, never a broken evening.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface NorthStarRow {
  id: string;
  status: 'seeded' | 'laddering' | 'active' | 'retired' | 'declined';
  seed_text: string | null;
  line: string | null;
  proposed_line: string | null;
  attempt_count: number;
  needs_reladder: boolean;
  last_attempt_at: string | null;
}

export interface NorthStarState {
  row: NorthStarRow | null;
  shouldLadderTonight: boolean;
  isReladder: boolean;
}

const MARKER_PROPOSED = /\[\[NORTH_STAR_PROPOSED:\s*([^\]]+?)\s*\]\]/;
const MARKER_CONFIRMED = /\[\[NORTH_STAR_CONFIRMED\]\]/;
const MARKER_DEFERRED = /\[\[NORTH_STAR_DEFERRED\]\]/;
const STRIP_ALL_MARKERS = /\s*\[\[NORTH_STAR[^\]]*\]\]\s*/g;

/** Fetch the current non-retired row (at most one by construction). */
async function getCurrentRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<NorthStarRow | null> {
  const { data } = await supabase
    .from('north_stars')
    .select('id, status, seed_text, line, proposed_line, attempt_count, needs_reladder, last_attempt_at')
    .eq('user_id', userId)
    .neq('status', 'retired')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as NorthStarRow) || null;
}

/**
 * Lazy seed (spec §4): derive seed_text from the user's own onboarding words
 * (psychological_profile.freeTextAnswers — persisted by deriveProfile) and
 * insert a 'seeded' row. Idempotent; null seed is valid (ladder opens
 * without the callback).
 */
async function seedNorthStar(
  supabase: SupabaseClient,
  userId: string,
): Promise<NorthStarRow | null> {
  try {
    let seed: string | null = null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('psychological_profile')
      .eq('id', userId)
      .maybeSingle();
    const freeText = profile?.psychological_profile?.freeTextAnswers;
    if (freeText && typeof freeText === 'object') {
      const answers = Object.values(freeText).filter(
        (v): v is string => typeof v === 'string' && v.trim().length >= 12,
      );
      // Longest answer = richest stated reason (deterministic)
      seed = answers.sort((a, b) => b.length - a.length)[0]?.trim().slice(0, 240) ?? null;
    }
    const { data } = await supabase
      .from('north_stars')
      .insert({ user_id: userId, status: 'seeded', seed_text: seed })
      .select('id, status, seed_text, line, proposed_line, attempt_count, needs_reladder, last_attempt_at')
      .single();
    return (data as NorthStarRow) || null;
  } catch {
    return null;
  }
}

/**
 * Eligibility (spec §4): ladder tonight when
 *  (continuation) status is 'laddering' — mid-ladder conversation; OR
 *  (a) first capture: day 2–4, no active/declined row, attempt_count < 3,
 *      last attempt ≥ 2 days ago; OR
 *  (b) re-ladder: active row with needs_reladder = true (cooldown + cap apply).
 * Privacy (can_personalize) is gated by the CALLER (chat.ts already checks).
 * Day source of truth: client-supplied eveningContext.day (consistent with
 * the existing evening path; daily_sessions idempotency bounds abuse).
 */
export async function getNorthStarState(
  supabase: SupabaseClient,
  userId: string,
  eveningDay: number,
): Promise<NorthStarState> {
  try {
    let row = await getCurrentRow(supabase, userId);

    if (row?.status === 'laddering') {
      // Mid-ladder continuation — but guard against abandonment: a 'laddering'
      // row whose last attempt is >1 day old means the user closed the app
      // mid-conversation. Treat as deferred (graceful, honors cooldown intent)
      // instead of reopening every evening forever.
      const last = row.last_attempt_at ? new Date(row.last_attempt_at).getTime() : 0;
      if (Date.now() - last > 86400000) {
        await supabase.from('north_stars').update({
          status: row.needs_reladder ? 'active' : (row.attempt_count >= 3 ? 'declined' : 'seeded'),
          proposed_line: null,
        }).eq('id', row.id);
        return { row, shouldLadderTonight: false, isReladder: false };
      }
      return { row, shouldLadderTonight: true, isReladder: row.needs_reladder };
    }
    if (row?.status === 'active' && row.needs_reladder) {
      // Re-ladder eligibility (b) — same courtesy rules as first capture:
      // attempt cap and 2-day cooldown, so a deferred re-ladder retries
      // "on a later evening", never nightly (spec deflection decision).
      if (row.attempt_count >= 3) {
        await supabase.from('north_stars')
          .update({ needs_reladder: false }).eq('id', row.id); // give up; old line stays active
        return { row, shouldLadderTonight: false, isReladder: false };
      }
      const last = row.last_attempt_at ? new Date(row.last_attempt_at).getTime() : 0;
      if (last && Date.now() - last < 2 * 86400000) {
        return { row, shouldLadderTonight: false, isReladder: false };
      }
      return { row, shouldLadderTonight: true, isReladder: true };
    }
    if (row?.status === 'active' || row?.status === 'declined') {
      return { row, shouldLadderTonight: false, isReladder: false };
    }

    // First-capture path
    if (eveningDay < 2 || eveningDay > 4) {
      return { row, shouldLadderTonight: false, isReladder: false };
    }
    if (!row) {
      row = await seedNorthStar(supabase, userId); // lazy seed (spec §4)
    }
    if (!row) return { row: null, shouldLadderTonight: false, isReladder: false };
    if (row.attempt_count >= 3) {
      await supabase.from('north_stars').update({ status: 'declined' }).eq('id', row.id);
      return { row, shouldLadderTonight: false, isReladder: false };
    }
    const last = row.last_attempt_at ? new Date(row.last_attempt_at).getTime() : 0;
    if (Date.now() - last < 2 * 86400000) {
      return { row, shouldLadderTonight: false, isReladder: false };
    }
    return { row, shouldLadderTonight: true, isReladder: false };
  } catch {
    return { row: null, shouldLadderTonight: false, isReladder: false };
  }
}

/**
 * The evening system-prompt replacement for ladder turns (spec §2 + §4).
 * Voice rules: what/how phrasing only — NEVER the pattern "why is that
 * important" (triggers justification, not feeling). Fourth-grade level.
 */
export function buildLadderPromptBlock(
  state: NorthStarState,
  turnNumber: number,
  day: number,
): string {
  const row = state.row;
  const opening = state.isReladder
    ? `At their graduation they told you their "becoming" line ("${row?.line ?? ''}") might be shifting. Tonight, gently ask what feels true now.`
    : row?.seed_text
      ? `When you first met, they said they wanted: "${row.seed_text}". Tonight, after warmly receiving their reflection, get genuinely curious: ask what having that would actually give them.`
      : `Tonight, after warmly receiving their reflection, get genuinely curious about what they're really here for — ask what they're hoping changes, then what that would give them.`;

  const hardClose = turnNumber >= 7
    ? `\nThis conversation has gone long. Warmly wrap up NOW: thank them, no more questions, end with [[NORTH_STAR_DEFERRED]].`
    : '';

  return `\n\nTONIGHT'S SPECIAL FOCUS (Day ${day} — values conversation, woven into the evening check-in):
${opening}

How to ladder (one step per reply, at most 4 ladder questions total):
- Reflect a few of their own words back, then ask ONE gentle deeper question.
- Use "what" and "how" questions only: "What would that give you?", "What does that feel like?", "What happens for you in those moments?" NEVER ask "why is that
  important" — never interrogate.
- You are listening for bedrock: feeling words, shorter answers, a sentence about who they are or fear becoming ("I don't want to shut down like my dad"), or "I don't know how to say it." When you hear bedrock, STOP asking.
- At bedrock: distill it into one warm identity sentence in THEIR language — "So it sounds like you're becoming someone who ___." Ask "Did I get that right?" and end that message with the hidden line [[NORTH_STAR_PROPOSED: someone who ___]].
- If they confirm (yes / that's it / exactly): respond warmly, bridge into one short normal reflection question about their day, and end the message with [[NORTH_STAR_CONFIRMED]].
- If they adjust your wording: re-distill ONCE using their adjustment, end with a new [[NORTH_STAR_PROPOSED: ...]].
- If they deflect or stay on the surface twice in a row: let it go completely with warmth ("That's okay — it'll come when it comes"), continue as a normal evening reflection, and end that message with [[NORTH_STAR_DEFERRED]].
- The hidden [[...]] lines are for the system, not the user — always place them at the very end of the message.${hardClose}`;
}

export interface LadderTurnResult {
  visibleMessage: string;
  ladderOpen: boolean;
}

/**
 * Parse markers from RAW LLM output (before stripMarkdown — spec §4), advance
 * state, return the marker-stripped message. canStoreTranscript=false ⇒ state
 * advances via status/markers only; transcript never written (spec §7).
 */
export async function processLadderTurn(
  supabase: SupabaseClient,
  userId: string,
  state: NorthStarState,
  rawOutput: string,
  userMessage: string,
  canStoreTranscript: boolean,
  turnNumber: number,
): Promise<LadderTurnResult> {
  // Collapse only horizontal runs — \n\n paragraph breaks must survive
  const visibleMessage = rawOutput
    .replace(STRIP_ALL_MARKERS, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
  try {
    let row = state.row;
    if (!row) return { visibleMessage, ladderOpen: false };

    // DETERMINISTIC hard cap (spec §4 safety net): at turn >= 8 the ladder
    // closes regardless of what the LLM emitted. Without this, one
    // marker-less wrap-up strands ladder_active=true and the client can
    // never set canCompleteDay — streak loss from a disobedient LLM turn.
    const forceClose = turnNumber >= 8;

    // First ladder turn: open the attempt. Re-ladders ALSO move through
    // 'laddering' (line preserved on the row; needs_reladder stays true as
    // the re-ladder flag) so continuation works identically for both paths
    // and eligibility (b)'s cooldown can't kill a mid-conversation ladder.
    if (row.status === 'seeded' || (row.status === 'active' && row.needs_reladder)) {
      await supabase
        .from('north_stars')
        .update({
          status: 'laddering',
          attempt_count: row.attempt_count + 1,
          last_attempt_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      row = { ...row, status: 'laddering', attempt_count: row.attempt_count + 1 };
    }

    if (canStoreTranscript) {
      const { data: cur } = await supabase
        .from('north_stars').select('ladder_transcript').eq('id', row.id).maybeSingle();
      const transcript = Array.isArray(cur?.ladder_transcript) ? cur.ladder_transcript : [];
      transcript.push({ role: 'user', content: userMessage.slice(0, 500) });
      transcript.push({ role: 'assistant', content: visibleMessage.slice(0, 500) });
      await supabase.from('north_stars')
        .update({ ladder_transcript: transcript }).eq('id', row.id);
    }

    const proposed = rawOutput.match(MARKER_PROPOSED);
    if (proposed && !forceClose) {
      await supabase.from('north_stars')
        .update({ proposed_line: proposed[1].slice(0, 300) }).eq('id', row.id);
      return { visibleMessage, ladderOpen: true };
    }

    if (MARKER_CONFIRMED.test(rawOutput)) {
      const { data: cur } = await supabase
        .from('north_stars').select('proposed_line').eq('id', row.id).maybeSingle();
      const line = cur?.proposed_line || null;
      if (line) {
        if (state.isReladder && row.line) {
          // retire-and-replace (spec §2): old row keeps history
          await supabase.from('north_stars')
            .update({ status: 'retired', needs_reladder: false }).eq('id', row.id);
          await supabase.from('north_stars').insert({
            user_id: userId,
            status: 'active',
            line,
            confirmed_at: new Date().toISOString(),
          });
        } else {
          await supabase.from('north_stars').update({
            status: 'active',
            line,
            confirmed_at: new Date().toISOString(),
            needs_reladder: false,
          }).eq('id', row.id);
        }
        return { visibleMessage, ladderOpen: false };
      }
      // CONFIRMED without a stored proposal — fall through to deferral
      // (never invent a line)
    }

    if (MARKER_DEFERRED.test(rawOutput) || MARKER_CONFIRMED.test(rawOutput) || forceClose) {
      // Graceful exit. Re-ladder: old line returns to 'active', needs_reladder
      // stays true — eligibility (b)'s cooldown + attempt cap govern the
      // retry, so it resumes "on a later evening", never nightly, and gives
      // up entirely after 3 attempts (eligibility clears the flag).
      // First capture: back to 'seeded' (cooldown applies) or 'declined' at cap.
      const update = state.isReladder
        ? { status: 'active' as const, proposed_line: null }
        : {
            status: row.attempt_count >= 3 ? ('declined' as const) : ('seeded' as const),
            proposed_line: null,
          };
      await supabase.from('north_stars').update(update).eq('id', row.id);
      return { visibleMessage, ladderOpen: false };
    }

    return { visibleMessage, ladderOpen: true };
  } catch {
    return { visibleMessage, ladderOpen: false };
  }
}

/** Active line for surfaces (placecard, orientation). Null-safe, fail-soft. */
export async function getActiveNorthStar(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('north_stars')
      .select('line')
      .eq('user_id', userId)
      .eq('status', 'active')
      .not('line', 'is', null)
      .order('confirmed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.line ?? null;
  } catch {
    return null;
  }
}

/** Orientation block (spec §5) — identical Phase 23 insertion pattern. */
export function buildNorthStarOrientation(line: string): string {
  return (
    `\n\nThis person is becoming: "${line}" (their own confirmed words). ` +
    `Never quote this at them or mention you know it; let it quietly shape ` +
    `what you notice, the stories you choose, and what you encourage.`
  );
}

/**
 * pattern-hints.ts — Phase 23 Peter Adaptation
 *
 * Single helper that maps the 8-dimension PatternContext (from Phase 21) into
 * surface-specific instruction arrays appended to Peter's system/user prompts.
 *
 * Three output surfaces (D-01):
 *   - morning : story-shape hints, threshold approximated as PatternContext presence (D-10)
 *   - chat    : tone variants (D-05) + insight moment skeletons gated at confidence >= 0.7 (D-11)
 *   - insight : returns the same insightLines as 'chat' with empty other arrays (forward-compat)
 *
 * Voice rules (every copy item must pass):
 *   - Fourth-grade reading level
 *   - Pull language, not push
 *   - NO clinical labels — see forbidden-vocabulary list in 23-CONTEXT.md
 *   - Insight skeletons use behavioral observation phrasing per D-14, ATTACH-PETER-03
 *
 * Critical contracts:
 *   - SYNC, no I/O — never blocks the request
 *   - NEVER throws — every lookup uses optional chaining
 *   - PATTERN_KEYS iteration order preserved (D-07)
 *   - PatternContext presence is treated as a 0.3-floor proxy for the 0.35 morning threshold
 *     (D-10 + Pitfall 5 in 23-RESEARCH.md). PatternContext doesn't carry weight metadata
 *     (D-12 forbids extending the type), so this is a documented approximation.
 */

import {
  PATTERN_KEYS,
  type PatternContext,
  type PatternKey,
} from '@/lib/server/attachment-context';

// ─── Output Shape (D-01) ─────────────────────────────────────────────────────

export interface PatternHints {
  morningHints: string[];
  chatToneHints: string[];
  insightLines: string[];
}

export type HintSurface = 'morning' | 'chat' | 'insight';

// ─── Copy Tables (Plan 02 fills these) ───────────────────────────────────────
//
// All inner-key values are empty strings until Plan 02 authors them. The helper
// filters empty strings out, so the public API behaves correctly (returns empty
// arrays) before copy lands. Plan 02 replaces every '' with a reviewed copy item.

/**
 * Per-(dim, value) story-shape hint appended to the morning user-prompt.
 * 31 entries (8 dims × 3-4 values). Some values may share a hint.
 */
export const MORNING_HINTS: Record<PatternKey, Partial<Record<string, string>>> = {
  attachment_style: {
    reaches_out: 'Make the story feel steady and reassuring. Show calm follow-through and small consistent care.',
    steps_back: 'Make the action low-pressure. Give the person room to stay open without forcing a big talk.',
    feels_torn: 'Keep the message grounding. Show one simple kind move that lowers the stress of choosing.',
    feels_steady: 'Match a steady, confident tone. Show closeness as a calm, normal daily practice.',
  },
  repair_style: {
    reaches_out_first: 'Show a small brave reaching gesture — a soft return after something minor went sideways.',
    needs_space_first: 'Let the action include a beat of breath or a small pause before reconnecting.',
    uses_humor: 'Let the action carry warmth or a small playful note that softens an edge.',
    wants_direct_talk: 'Show a clear, kind, plain-spoken moment — saying the real thing simply.',
  },
  reassurance_need: {
    frequent_check_ins: 'Let the action be a small intentional check-in or a clear word of presence.',
    words_matter_most: 'Let the tiny action use spoken appreciation or a clear, warm sentence of care.',
    actions_over_words: 'Let the tiny action center on one helpful thing done with attention.',
    figures_it_out: 'Frame the action as something they do quietly for themselves first, then share if they want.',
  },
  space_preference: {
    process_together: 'Let the action be something done side by side — not parallel, but together.',
    process_alone_first: 'Let the action include a small private moment of noticing before any sharing.',
    moves_between_both: 'Make the action flexible — could be solo or shared depending on the day\'s feel.',
  },
  stress_communication: {
    goes_quiet: 'Show calm pacing. A shared silence or a gentle presence — no pressure to fill the air.',
    talks_it_through: 'Let the action invite a short, warm exchange — voicing one specific real thing.',
    gets_louder: 'Model a soft start. Show one moment of calm landing before anything bigger.',
    needs_to_move_first: 'Let the action involve gentle movement together — a short walk, putting something away side by side.',
  },
  interpretation_bias: {
    assumes_the_best: 'Reinforce their generosity. Show a small honest moment that meets them where they already lean.',
    looks_for_patterns: 'Show a single specific kind move. Stay concrete — one moment, not a theme.',
    takes_it_personally: 'Keep the tone extra warm. Show care that doesn\'t need to be earned.',
    asks_directly: 'Show a clear, plain-spoken moment — asking the simple, real question.',
  },
  vulnerability_pace: {
    opens_up_early: 'Honor the openness. Show a small steady response that meets it without rushing past.',
    opens_slowly: 'Keep the action small and unhurried. One quiet shared moment is plenty.',
    needs_full_safety: 'Lead with safety. Show the small predictable kind thing — consistency before softening.',
    struggles_to_open: 'Make the action almost wordless. A small kind gesture instead of a feelings conversation.',
  },
  worth_pattern: {
    tied_to_being_needed: 'Show care that arrives without being asked for, and worth that doesn\'t depend on having a job to do.',
    tied_to_being_chosen: 'Show one small daily choosing — picking the partner on purpose in a simple way.',
    tied_to_achieving: 'Make the action about presence over performance — being there beats getting it perfect.',
    relatively_stable: 'Match a brighter, confident tone. Keep the action simple and grounded.',
  },
};

/**
 * Per-(dim, value) chat tone instruction appended to system prompt before
 * eveningContext (D-03). 31 total entries.
 */
export const CHAT_TONE_VARIANTS: Record<PatternKey, Partial<Record<string, string>>> = {
  attachment_style: {
    reaches_out: 'Open warmly and quickly. They steady themselves through closeness — let them feel you\'re right here before exploring anything harder.',
    steps_back: 'Give them room. One soft invitation, then wait. Don\'t crowd the space they need to find themselves.',
    feels_torn: 'Move slowly and hold both sides. Acknowledge the pull toward closeness and the pull toward space before suggesting anything.',
    feels_steady: 'Match their grounded tone. Stay calm and curious — they don\'t need over-softening.',
  },
  repair_style: {
    reaches_out_first: 'Honor the reaching. Affirm that it takes something to be the one who comes back first.',
    needs_space_first: 'Don\'t push for the talk. Any repair idea should feel like something they can come back to when ready.',
    uses_humor: 'A little warmth or lightness in tone is welcome here. Don\'t get heavy unless the moment really calls for it.',
    wants_direct_talk: 'Be clear and plain. They prefer honesty over careful softening.',
  },
  reassurance_need: {
    frequent_check_ins: 'Open warmer than usual. Let them feel you\'re here before any reflection or question.',
    words_matter_most: 'Speak the care clearly. Don\'t make them read between the lines — say the warm thing plainly.',
    actions_over_words: 'Keep talk light. Lean toward one concrete thing they can do or notice in real life.',
    figures_it_out: 'Trust them to find their own thread. Hold space without filling it — don\'t over-reassure.',
  },
  space_preference: {
    process_together: 'Invite shared reflection. They land best when working it through with someone beside them.',
    process_alone_first: 'Make any prompt feel like something they can take with them. Don\'t expect real-time processing.',
    moves_between_both: 'Read the moment. Some days they want to talk it through; some days they want to sit with it. Offer both.',
  },
  stress_communication: {
    goes_quiet: 'Be patient. Short, warm prompts. Don\'t fill the quiet with more questions.',
    talks_it_through: 'Make room for them to think out loud. Reflect back what you hear — don\'t redirect.',
    gets_louder: 'Hold steady. Acknowledge the size of the feeling without matching or amplifying it.',
    needs_to_move_first: 'Suggest something physical or doable as a first step. Words come easier after movement.',
  },
  interpretation_bias: {
    assumes_the_best: 'Honor their generosity. Gently invite curiosity about what else might be true without scolding the openness.',
    looks_for_patterns: 'Be specific and concrete. One moment at a time — not themes or abstractions.',
    takes_it_personally: 'Lead with care. Help separate this moment from any bigger story about who they are.',
    asks_directly: 'Match their directness. Be specific and clear — they appreciate plain language.',
  },
  vulnerability_pace: {
    opens_up_early: 'Hold the depth gently. Reflect back warmly before moving on.',
    opens_slowly: 'Let them set the pace. Small openings, no pressure to go deeper than they offered.',
    needs_full_safety: 'Lead with safety. Name what\'s already steady before inviting anything tender.',
    struggles_to_open: 'Use gentle, low-stakes prompts. Honor partial answers — a fragment is real progress.',
  },
  worth_pattern: {
    tied_to_being_needed: 'Affirm them as a person, not only as a giver. Notice what they bring beyond what they do.',
    tied_to_being_chosen: 'Affirm the small daily choosing — showing up on purpose — over big declarations.',
    tied_to_achieving: 'Celebrate presence and effort, not just outcome. Worth doesn\'t need a performance to be real.',
    relatively_stable: 'Match their steadiness. No need to over-affirm — keep it real and warm.',
  },
};

/**
 * Per-(dim, value) insight moment skeleton (D-14, D-15). Each MUST begin with
 * Uses behavioral observation phrasing only — never clinical language.
 * 31 total entries.
 */
export const INSIGHT_SKELETONS: Record<PatternKey, Partial<Record<string, string>>> = {
  attachment_style: {
    reaches_out: "I've noticed you tend to lean toward your partner when things feel uncertain — like closeness helps you find your footing",
    steps_back: "I've noticed you tend to pull back a little when things feel unsettled — like you need a moment to find yourself before coming back",
    feels_torn: "I've noticed you tend to feel pulled in two directions sometimes — wanting closeness and wanting space at the same time",
    feels_steady: "I've noticed you tend to stay pretty grounded when things between you and your partner shift",
  },
  repair_style: {
    reaches_out_first: "I've noticed you tend to be the one who breaks the ice after a hard moment",
    needs_space_first: "I've noticed you tend to want a little space before circling back when things feel hard",
    uses_humor: "I've noticed you tend to use a little warmth or lightness to soften things after a rough patch",
    wants_direct_talk: "I've noticed you tend to want to talk it through clearly rather than letting it sit",
  },
  reassurance_need: {
    frequent_check_ins: "I've noticed you tend to feel more settled when you and your partner check in with each other often",
    words_matter_most: "I've noticed you tend to land most when the care is spoken out loud",
    actions_over_words: "I've noticed you tend to feel most safe when you can see the care show up in what your partner actually does",
    figures_it_out: "I've noticed you tend to work things out from the inside before reaching for reassurance from others",
  },
  space_preference: {
    process_together: "I've noticed you tend to think more clearly when you can talk it out with your partner side by side",
    process_alone_first: "I've noticed you tend to need a little quiet time with yourself before you really know what you feel",
    moves_between_both: "I've noticed you tend to move between wanting space and wanting closeness depending on how the day is going",
  },
  stress_communication: {
    goes_quiet: "I've noticed you tend to get quieter when things feel heavy — like you're sorting it out inside first",
    talks_it_through: "I've noticed you tend to talk things out when stress shows up — saying it out loud is how it lands",
    gets_louder: "I've noticed you tend to feel things big in the moment, with the feeling right there in your voice",
    needs_to_move_first: "I've noticed you tend to need to move your body — a walk, the dishes — before the right words come",
  },
  interpretation_bias: {
    assumes_the_best: "I've noticed you tend to give your partner the benefit of the doubt when something feels off",
    looks_for_patterns: "I've noticed you tend to step back and look for the bigger picture when something feels off between you two",
    takes_it_personally: "I've noticed you tend to wonder if a small thing might mean something bigger about you",
    asks_directly: "I've noticed you tend to ask straight out when something your partner said or did isn't clear to you",
  },
  vulnerability_pace: {
    opens_up_early: "I've noticed you tend to share what's close to your heart pretty early on",
    opens_slowly: "I've noticed you tend to let people in slowly, layer by layer, when it feels safe to do so",
    needs_full_safety: "I've noticed you tend to need to feel completely safe before the deeper things come out",
    struggles_to_open: "I've noticed you tend to find it hard sometimes to put words to the softer feelings inside you",
  },
  worth_pattern: {
    tied_to_being_needed: "I've noticed you tend to feel most valued when your partner clearly needs what you bring",
    tied_to_being_chosen: "I've noticed you tend to feel most grounded when your partner picks you on purpose, again and again",
    tied_to_achieving: "I've noticed you tend to feel most sure of yourself when you've shown up and done something well",
    relatively_stable: "I've noticed you tend to feel pretty solid in your own worth without needing a lot of outside proof",
  },
};

// ─── Wrapping for insight cadence (D-13) ─────────────────────────────────────

/**
 * Wrap each insight skeleton with the suggestion + cadence guard from D-13.
 * The wrap text instructs the LLM to use the observation sparingly and only
 * if it fits naturally.
 */
function wrapInsightLine(skeleton: string): string {
  return (
    `If it fits this moment naturally, you may quietly observe: "${skeleton}". ` +
    `Use sparingly — at most once per conversation. Never force it.`
  );
}

// ─── Public API (D-01, D-07) ─────────────────────────────────────────────────

/**
 * Pure synchronous mapping from PatternContext to surface-specific hint arrays.
 *
 * NEVER throws — every lookup uses optional chaining. Empty-string copy entries
 * (Plan 01 placeholders or unauthored values) are filtered out so callers
 * always receive non-empty strings or empty arrays.
 *
 * Iteration follows PATTERN_KEYS order (D-07).
 *
 * Threshold notes:
 *   - 'morning' surface: PatternContext presence is the proxy for >= 0.35
 *     (D-10, D-12 — see file-level comment).
 *   - 'chat' surface: no extra floor — PatternContext is already filtered to
 *     >= 0.3 by buildPatternContext (D-08, D-09).
 *   - Insight lines: PatternContext doesn't carry weights, so the >= 0.7 gate
 *     (D-11) is enforced via system-prompt cadence guidance ("at most once per
 *     conversation"). This is a documented v1 trade-off (D-17).
 */
export function getPatternHints(
  ctx: PatternContext,
  surface: HintSurface,
): PatternHints {
  const morningHints: string[] = [];
  const chatToneHints: string[] = [];
  const insightLines: string[] = [];

  for (const key of PATTERN_KEYS) {
    const value = ctx[key];
    if (value === null) continue;

    if (surface === 'morning') {
      const hint = MORNING_HINTS[key]?.[value];
      if (hint && hint.length > 0) morningHints.push(hint);
    }

    if (surface === 'chat' || surface === 'insight') {
      if (surface === 'chat') {
        const tone = CHAT_TONE_VARIANTS[key]?.[value];
        if (tone && tone.length > 0) chatToneHints.push(tone);
      }
      const skeleton = INSIGHT_SKELETONS[key]?.[value];
      if (skeleton && skeleton.length > 0) {
        insightLines.push(wrapInsightLine(skeleton));
      }
    }
  }

  return { morningHints, chatToneHints, insightLines };
}

// ─── Dev-only structural assertion ───────────────────────────────────────────
// Verifies all 8 PATTERN_KEYS appear as top-level keys in each copy table.
// Runs at module load; gated to non-production to avoid noise.

if (process.env.NODE_ENV !== 'production') {
  for (const key of PATTERN_KEYS) {
    console.assert(
      key in MORNING_HINTS && key in CHAT_TONE_VARIANTS && key in INSIGHT_SKELETONS,
      `[pattern-hints] PATTERN_KEYS '${key}' missing from one of the copy tables`,
    );
  }
}

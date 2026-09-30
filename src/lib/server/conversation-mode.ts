// conversation-mode.ts — Peter's next-move decision layer (constitution §6).
// Pure and deterministic: classifies the user's latest message into the
// smallest useful conversational move and returns one prompt line. Safety is
// handled before this runs (lib/safety.ts); growth moments add Celebrate.

export type ConversationMode = 'listen' | 'explore' | 'reflect' | 'challenge' | 'act' | 'celebrate';

export type MomentSignal =
  | 'pushback'
  | 'self_discovery'
  | 'intention'
  | 'asks_for_help'
  | 'absolute_about_partner'
  | 'heavy_feeling'
  | 'brief'
  | 'none';

export type ModeDecision = {
  mode: ConversationMode | null;
  signal: MomentSignal;
  instruction: string | null;
};

// Resistance is information (constitution v1.1 §2, §6A): the user rejecting
// Peter's reflection or suggestion. Checked first — it overrides everything.
const PUSHBACK =
  /^\s*(no|nope|nah|not really|not quite|i don'?t think so|that'?s not (it|true|right|what i meant)|you'?re wrong|stop|don'?t do that)\b|\b(that'?s not (it|true|right|what i meant)|you don'?t (get|understand)( it| me)?|not what i (meant|said)|you'?re not listening|i didn'?t say that)\b/i;
const SELF_DISCOVERY =
  /\b(i (just )?reali[sz]e|it (just )?hit me|i never noticed|now i see|i see now|that'?s why i|i think i (get|see|understand) (it|now|why)|i guess i('m| am| do| always)|maybe i('m| am) (the one|scared|afraid|worried)|i noticed (that )?i)\b/i;
const INTENTION =
  /\b(i('ll| will| am going to|'m going to| want to try| plan to)|tomorrow i|next time i|i'?m going to try)\b/i;
const ASKS_FOR_HELP =
  /\b(what should i|what do i do|what can i do|any (ideas|advice|tips)|how (do|can|should) i|what would you (do|suggest)|can you help me)\b/i;
const ABSOLUTE = /\b(always|never|every (single )?time|nothing ever|no one ever)\b/i;
const PARTNER_REF = /\b(he|she|they|him|her|them|partner|husband|wife|boyfriend|girlfriend|spouse)\b/i;
const HEAVY_FEELING =
  /\b(hurt|lonely|exhausted|overwhelmed|scared|angry|furious|heartbroken|crying|cried|ashamed|hopeless|so tired|fed up|just need to vent|can'?t do this)\b/i;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Classify the moment. Order matters: the first match wins. */
export function classifyMoment(message: string): MomentSignal {
  const text = message.trim();
  if (!text) return 'none';
  if (PUSHBACK.test(text)) return 'pushback';
  if (SELF_DISCOVERY.test(text)) return 'self_discovery';
  if (ASKS_FOR_HELP.test(text)) return 'asks_for_help';
  if (INTENTION.test(text)) return 'intention';
  if (HEAVY_FEELING.test(text)) return 'heavy_feeling';
  if (ABSOLUTE.test(text) && PARTNER_REF.test(text)) return 'absolute_about_partner';
  if (wordCount(text) < 8) return 'brief';
  return 'none';
}

const INSTRUCTIONS: Record<Exclude<MomentSignal, 'none'>, { mode: ConversationMode; line: string }> = {
  pushback: {
    mode: 'listen',
    line: 'They pushed back on something you said. Thank them plainly, ask what you might be misunderstanding (or follow the correction they gave), and reflect their version in their words. Drop your earlier idea completely — do not rephrase it, hint at it, or bring it back later.',
  },
  self_discovery: {
    mode: 'listen',
    line: 'They just saw something true about themselves. Honor it in their own words. Do not add your interpretation or dig deeper. It is fine to end without a question.',
  },
  intention: {
    mode: 'act',
    line: 'They chose something to try. Help them make it small and specific (when, and what exactly), in their words. If they have not said why it matters to them, ask once what makes it worth trying. Do not add a second task.',
  },
  asks_for_help: {
    mode: 'act',
    line: 'They asked for help. First ask what they have already thought of, or offer at most two small ideas and let them choose. Keep the choice theirs.',
  },
  heavy_feeling: {
    mode: 'listen',
    line: 'They are carrying something heavy. Comfort first. Reflect the feeling in plain words. No advice, no reframing, and at most one gentle question.',
  },
  absolute_about_partner: {
    mode: 'challenge',
    line: 'They described their partner in absolutes. First show you hear the frustration. Then, with curiosity and not correction, wonder about one exception. Never take a side.',
  },
  brief: {
    mode: 'explore',
    line: 'Their message was short. Ask one warm, specific question that invites a real moment. Do not pile on questions.',
  },
};

/**
 * Decide the suggested move for this reply. Returns a null mode when nothing
 * clear stands out — Peter then chooses using his shared rules.
 */
export function decideMode(message: string): ModeDecision {
  const signal = classifyMoment(message);
  if (signal === 'none') return { mode: null, signal, instruction: null };
  const { mode, line } = INSTRUCTIONS[signal];
  return {
    mode,
    signal,
    instruction: `\n\nSuggested move for this reply: ${mode.toUpperCase()}. ${line}`,
  };
}

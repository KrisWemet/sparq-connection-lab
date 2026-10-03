// conversation-mode.ts — Peter's next-move decision layer (constitution §6).
// Pure and deterministic: classifies the user's latest message into the
// smallest useful conversational move and returns one prompt line. Safety is
// handled before this runs (lib/safety.ts); growth moments add Celebrate.

export type ConversationMode =
  | 'listen'
  | 'stabilize'
  | 'explore'
  | 'reflect'
  | 'challenge'
  | 'act'
  | 'follow_up'
  | 'celebrate';

export type MomentSignal =
  | 'declines_help'
  | 'depleted'
  | 'pushback'
  | 'setback'
  | 'tried_it'
  | 'got_easy'
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

// Safety (constitution §5): they turned down crisis help but are still here.
// Peter stays with them AND keeps real help within reach.
const DECLINES_HELP =
  /\b(don'?t want (a |to call (a |the )?)?(hotline|helpline|crisis line|therapist|anyone else)|no hotlines?|not calling (anyone|a hotline)|stop (sending|giving) me (numbers|hotlines))\b/i;

// Reported speech ("she said I never…") is the partner's absolute, not the
// user's — it is not a cue to challenge the user's view of their partner.
const REPORTED_ABSOLUTE = /\b(said|says|told me|tells me|accused me of)\b[^.!?]*\b(always|never)\b/i;

// Timing intelligence (constitution v1.2 §6B): no capacity for growth right
// now. Checked before everything else — stabilizing beats any growth move.
const DEPLETED =
  /\b(can'?t (do|handle|deal with|take) (this|it|anything|any more|anymore)|too much( right now| tonight| today)?$|it'?s (all )?too much|falling apart|breaking down|(no|zero|barely any) sleep|haven'?t slept|can'?t (breathe|think( straight)?|stop shaking)|i'?m (shaking|panicking)|panicking|so flooded|completely overwhelmed|so overwhelmed|overwhelmed|i'?m done for (today|tonight)|running on empty)\b/i;

// Setbacks are data (constitution v1.2 §11A): they didn't follow through, or
// an old pattern came back.
const SETBACK =
  /\b(i (totally |completely )?(blew it|messed (it )?up|screwed (it )?up|failed|slipped|fell back|caved|gave up|did it again)|didn'?t (do|try|get to) it|didn'?t get around to it|forgot (to|again|every day|all week)|back to square one|back to my old|my old habits?|slipped back|(straight|right) back into|old (habit|pattern)s? (came|is|are) back|did(n'?t| not) (manage|follow through)|skipped it)\b/i;

// Follow up (constitution v1.2 §6): they're reporting on something they tried.
const TRIED_IT =
  /\b(i (tried|did) (it|that|the|this)|i gave it a (go|try|shot)|it (worked|didn'?t work|went (well|badly|okay|ok|great|weird))|tried it (once|twice|again|today|yesterday))\b/i;

// Adaptive difficulty (constitution v1.2 §11A): a chosen practice has
// become easy — offer the next step, never impose it.
const GOT_EASY =
  /\b((that|this|it)('s| is)( one| getting| gotten| become)? (easy|easier|natural|second nature)( now)?|getting easier|comes? (naturally|easy) now|easy now)\b/i;

// Resistance is information (constitution v1.1 §2, §6A): the user rejecting
// Peter's reflection or suggestion. Overrides every growth move below it.
const PUSHBACK =
  /^\s*(no|nope|nah|not really|not quite|i don'?t think so|that'?s not (it|true|right|what i meant)|you'?re wrong|stop|don'?t do that)\b|\b(that'?s not (it|true|right|what i meant)|you don'?t (get|understand)( it| me)?|not what i (meant|said)|you'?re not listening|i didn'?t say that)\b/i;
const SELF_DISCOVERY =
  /\b(i (just )?reali[sz]e|it (just )?hit me|i never noticed|now i see|i see now|that'?s why i|i think i (get|see|understand) (it|now|why)|i guess i('m| am| do| always)|maybe i('m| am) (the one|scared|afraid|worried)|i noticed (that )?i)\b/i;
const INTENTION =
  /\b(i('ll| will| am going to|'m going to| want to try| plan to)|tomorrow i|next time i|i'?m going to try)\b/i;
const ASKS_FOR_HELP =
  /\b(what should i|what do i do|what can i do|any (ideas|advice|tips)|how (do|can|should) i|what would you (do|suggest)|can you help me|(just )?give me (something|an idea|one thing|a thing)|just tell me what)\b/i;
const ABSOLUTE = /\b(always|never|every (single )?time|nothing ever|no one ever)\b/i;
const PARTNER_REF = /\b(he|she|they|him|her|them|partner|husband|wife|boyfriend|girlfriend|spouse)\b/i;
const HEAVY_FEELING =
  /\b(hurt|lonely|exhausted|scared|angry|furious|heartbroken|crying|cried|ashamed|hopeless|so tired|fed up|just need to vent)\b/i;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Classify the moment. Order matters: the first match wins. */
export function classifyMoment(message: string): MomentSignal {
  const text = message.trim();
  if (!text) return 'none';
  if (DECLINES_HELP.test(text)) return 'declines_help';
  if (DEPLETED.test(text)) return 'depleted';
  // A report on their own experiment ("No, I forgot") is not a rejection of
  // Peter's idea, so it is read before pushback.
  if (SETBACK.test(text)) return 'setback';
  if (TRIED_IT.test(text)) return 'tried_it';
  if (GOT_EASY.test(text)) return 'got_easy';
  if (PUSHBACK.test(text)) return 'pushback';
  if (SELF_DISCOVERY.test(text)) return 'self_discovery';
  if (ASKS_FOR_HELP.test(text)) return 'asks_for_help';
  if (INTENTION.test(text)) return 'intention';
  if (HEAVY_FEELING.test(text)) return 'heavy_feeling';
  if (ABSOLUTE.test(text) && PARTNER_REF.test(text) && !REPORTED_ABSOLUTE.test(text)) return 'absolute_about_partner';
  if (wordCount(text) < 8) return 'brief';
  return 'none';
}

const INSTRUCTIONS: Record<Exclude<MomentSignal, 'none'>, { mode: ConversationMode; line: string }> = {
  declines_help: {
    mode: 'listen',
    line: 'They turned down crisis help but are still talking to you. Stay with them warmly and keep talking. Also, gently and without lecturing, keep real help within reach in one short line (the help link stays right here, and they deserve real support too). Never promise not to mention help again, and do not move to normal coaching.',
  },
  depleted: {
    mode: 'stabilize',
    line: 'They have no room for growth right now. This is not the moment to push growth or anything else. Comfort them in a few plain words, offer at most one tiny optional grounding step (one slow breath, feet on the floor), and say nothing is due tonight. No questions about experiments, no lessons, no reframes, no new task, no pep talk.',
  },
  setback: {
    mode: 'follow_up',
    line: 'Something they chose to try did not happen, or an old pattern came back. This is information, not failure. No guilt, no "you said you would", no streak talk. If there is earlier evidence of change, it still counts. Get curious about one thing: what got in the way, whether it was too big or the wrong moment, or whether it still matters to them. Then offer to make it smaller, try a different moment, or let it go for now. They choose.',
  },
  got_easy: {
    mode: 'celebrate',
    line: 'Something they chose to practice is getting easy. Point to it plainly ("that is real"), then offer one next step up and the option to stay where they are a while longer. They choose. Do not grade it, do not assign the next level, and no feeling claims like "I love that".',
  },
  tried_it: {
    mode: 'follow_up',
    line: 'They are telling you how something they tried went. Ask what actually happened before you judge or praise it. Learn with them: what worked, what felt off, what surprised them. If it helps, offer to keep it, tweak it, or take a next step. They choose. End by pointing them back to their life, not to more chat.',
  },
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
    line: 'They chose something to try. Help them make it small and specific (when, and what exactly), in their words. If it would help, ask once what makes it worth trying for them — never as a condition. Do not add a second task. End by sending them off to try it.',
  },
  asks_for_help: {
    mode: 'act',
    line: 'They asked for help. If they ask what you think they should do, give your honest view in one or two sentences and what it rests on, say what you cannot know, and leave the choice with them — do not dodge the question. Otherwise offer at most two small, concrete ideas (or ask what they have already thought of) and let them choose. If they pick one, it is theirs — help them start, and do not make them explain why first. Keep the choice theirs.',
  },
  heavy_feeling: {
    mode: 'listen',
    line: 'They are carrying something heavy. Comfort first. Reflect the feeling in plain words. No advice, no reframing, no lesson, challenge or task — this is not the moment to push growth. If they seem flooded, help them slow down (a slow breath, feet on the floor). At most one gentle question; calming down can be the whole goal.',
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

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
  | 'control_concern'
  | 'pushback'
  | 'mixed_feelings'
  | 'low_confidence'
  | 'recurring_conflict'
  | 'regret'
  | 'no_improvement'
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

// Acceptance is never tolerance of control (modalities-therapeutic §9 limits).
// Controlling behavior the crisis detector (lib/safety.ts) does not catch:
// Peter must not treat it as an ordinary difference.
const CONTROL_CONCERN =
  /\b((checks|goes through|reads|looks through) my (phone|texts|messages|email)|tracks (my location|where i am)|(won'?t|doesn'?t) let me (see|go|talk|leave|have|work|spend)|(says|told me) i (can'?t|am not allowed to|'?m not allowed to) (see|go|talk|leave|have|work|wear)|i'?m not allowed to (see|go|talk|leave|have|work|wear)|controls (all )?(the|my|our) (money|finances|bank)|takes my (phone|keys|money))\b/i;

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
// Motivational-interviewing-informed moves (docs/evals/peter-behavior.md Q–T).
// Mixed feelings about a change: reflect both sides before anything else.
const MIXED_FEELINGS =
  /\b(part of me|on (the )?one hand|i'?m torn|torn between|mixed feelings|i don'?t know if i (really )?(want|can)|(i (want|need|should)( to)?|i have to) [^.!?]{1,60}\bbut (i|i'?m|it|it'?s|part|then|those|these|that|every time|whenever|at the same time)\b|i (want|wish) [^.!?]{1,60}\band (i'?m|it'?s|it) (also |just )?(scared|afraid|tired|exhausted|drained|hard))/i;
// Doubting they can do something they chose: explore confidence and barriers.
const LOW_CONFIDENCE =
  /\b(i don'?t think i can|i'?m not sure i can|not sure i'?m able|i'?ll (probably |just |likely )+(fail|mess (it|this) up|forget)|i'?m (just )?not good at (this|that|it)|i never (stick|keep) (to|at|with) (anything|things|it))\b/i;
// IBCT-informed (docs/PSYCHOLOGY_AUDIT.md, modalities-therapeutic §9): the
// same fight keeps coming back — explore the loop, not either person.
const RECURRING_CONFLICT =
  /\b(we keep (fighting|arguing|having (the same|this) (fight|argument))|(the )?same (fight|argument)( again| every time| over and over)|every time we (talk|try to talk) about|we always (fight|argue) about|it always turns into a fight|we go (round and round|in circles))\b/i;
// Self-compassion (§10): regret about something they did.
const REGRET =
  /\b(i (feel|felt) (terrible|awful|so bad|horrible|guilty) (about|for|that|because)|i regret|i shouldn'?t have (said|done|yelled|snapped|told)|i hate (that|what) i (said|did)|i said something (awful|terrible|horrible|mean|hurtful|cruel)|i'?m (so |really )?ashamed of)\b/i;
// Solution-focused (§11): no improvement, or it is getting worse.
const NO_IMPROVEMENT =
  /\b(nothing (is |seems to be )?(working|helping|changing)|it'?s not (getting )?(any )?better|(things|it)('s| is| are)? getting worse|nothing has changed|not making (a|any) difference|this (isn'?t|is not) helping)\b/i;
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
  if (CONTROL_CONCERN.test(text)) return 'control_concern';
  // A report on their own experiment ("No, I forgot") is not a rejection of
  // Peter's idea, so it is read before pushback.
  if (SETBACK.test(text)) return 'setback';
  if (TRIED_IT.test(text)) return 'tried_it';
  if (GOT_EASY.test(text)) return 'got_easy';
  if (PUSHBACK.test(text)) return 'pushback';
  if (MIXED_FEELINGS.test(text)) return 'mixed_feelings';
  if (LOW_CONFIDENCE.test(text)) return 'low_confidence';
  if (REGRET.test(text)) return 'regret';
  if (NO_IMPROVEMENT.test(text)) return 'no_improvement';
  if (RECURRING_CONFLICT.test(text)) return 'recurring_conflict';
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
    line: 'They turned down crisis help but are still talking to you. Stay with them warmly and keep talking. Also, gently and without lecturing, keep real help within reach in one short line (the help link stays right here, and they deserve real support too). Never promise not to mention help again, do not move to normal coaching, and do not say "I am not going anywhere" or claim you will always be there — say what is true: you are here right now, and real people can help too.',
  },
  depleted: {
    mode: 'stabilize',
    line: 'They have no room for growth right now. This is not the moment to push growth or anything else. Comfort them in a few plain words, offer at most one tiny optional grounding step (one slow breath, feet on the floor), and say nothing is due tonight. No questions about experiments, no lessons, no reframes, no new task, no pep talk.',
  },
  control_concern: {
    mode: 'reflect',
    line: 'They describe their partner controlling or watching them (phone, money, friends, where they go). This is not an ordinary difference to accept or a loop to explore. Say plainly and kindly that what they describe is not okay and is not their fault. Their safety and their choices come first. Mention that real help is available right here (the help link), without pressure. Ask one gentle question about how safe they feel. Do not explore the partner\'s side, do not suggest they adjust or compromise, and do not tell them to stay or leave — that choice is theirs.',
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
  mixed_feelings: {
    mode: 'reflect',
    line: 'They feel two ways about this. Say both sides back in one sentence, in their words, joined with "and" (not "but"), and do not take a side. If they already chose a direction, end on that side and ask one small question about what would make a first step feel doable. If they have not chosen, or it is a big life choice, keep it even and ask which side feels truer tonight, or let it rest. No arguing for change, no list of reasons.',
  },
  low_confidence: {
    mode: 'explore',
    line: 'They doubt they can do it. Do not reassure them that they can, and do not push. Name one real strength or effort you have seen, if there is one. Then ask one question about what would make it a little easier, or what is in the way. Making it smaller or not now are both fine answers.',
  },
  recurring_conflict: {
    mode: 'explore',
    line: 'The same fight keeps coming back. Keep the loop as the focus, never either person. Ask one question that helps them see it from one side: how the two of them are different, what is tender for each, what outside stress is in it, or what happens just before it turns. Never guess what their partner thinks or wants; ask what they have seen. Accepting a difference never means putting up with control, threats or being hurt — if they describe that, say so plainly and put their safety first.',
  },
  regret: {
    mode: 'reflect',
    line: 'They regret something they did. Be kind and honest at once. Reflect what hurts. Help them hold that one mistake is not all of who they are. If it fits, ask what it did to the other person, and then what one small repair or next try could look like. No reassurance that skips the impact, no piling on, no lecture.',
  },
  no_improvement: {
    mode: 'explore',
    line: 'They say it is not getting better, or it is getting worse. Take that seriously and do not argue with it or blame them. First reflect how discouraging that is. Then, only if it fits, ask about one time it was even a little better and what was different. Offer to change what they are practicing, make it smaller, or take a break — they choose. Never suggest a better attitude alone will fix it. If it sounds unsafe, safety comes first.',
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

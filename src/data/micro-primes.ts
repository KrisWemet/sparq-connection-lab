// Daily Micro-Primes — Master PRD §4.3.
//
// v1 ships ONLY two categories (per the PRD's Neutral Observer build gates):
//   1. Perceived Partner Responsiveness (PPR) — Reis & Clark, U. Rochester
//   2. Capitalization / Active-Constructive Responding — Gable et al., UCLA
// The other three (Michelangelo, Loving-Kindness, Growth Mindset) are specced
// with seed content but deliberately NOT wired into the v1 cadence.
//
// Every prime carries an implementation intention ("if X, then I will Y")
// — Gollwitzer's finding is the single most robust effect in behavior-change
// research, and the PRD calls this step load-bearing, not optional.
//
// Voice rule (enjoyment-first): the citation lives in METADATA for the science
// page and internal traceability — it is NEVER shown inside the daily loop.
// The user sees a warm nudge, not a research abstract.

export type PrimeCategory = 'ppr' | 'capitalization';

export interface MicroPrime {
  id: string;
  category: PrimeCategory;
  /** Warm, second-person nudge. Fourth-grade reading level. No jargon. */
  body: string;
  /** The if-then plan, pre-filled with the user's habit anchor at render time. */
  ifThen: (anchor: string) => string;
  /** Internal only — surfaces on the science page, never in the loop. */
  citation: string;
  institution: string;
}

export const MICRO_PRIMES: MicroPrime[] = [
  // ── Perceived Partner Responsiveness ──────────────────────────────────────
  {
    id: 'ppr-notice-navigating',
    category: 'ppr',
    body: 'Think of one thing your partner has been quietly carrying lately. Not a crisis — just something on their mind. What would it look like to show them today that you noticed?',
    ifThen: (a) => `When ${a}, I'll name the one thing I know they're carrying — out loud, to them.`,
    citation: 'Reis, H. T., & Clark, M. S. (2004). Perceived partner responsiveness.',
    institution: 'University of Rochester',
  },
  {
    id: 'ppr-understood',
    category: 'ppr',
    body: 'Feeling understood matters more than being agreed with. Today, before you respond to something they say, try repeating back what you heard first.',
    ifThen: (a) => `When ${a}, I'll practice saying "so what I'm hearing is…" the next time we talk.`,
    citation: 'Reis, H. T., & Clark, M. S. (2013). Responsiveness.',
    institution: 'University of Rochester',
  },
  {
    id: 'ppr-what-matters',
    category: 'ppr',
    body: 'When your partner tells you something today, listen for what it says about what matters to them — underneath the words themselves.',
    ifThen: (a) => `When ${a}, I'll ask one question about why something mattered to them, instead of just what happened.`,
    citation: 'Reis, H. T., Clark, M. S., & Holmes, J. G. (2004).',
    institution: 'University of Rochester',
  },
  {
    id: 'ppr-small-signal',
    category: 'ppr',
    body: 'Being cared for is made of small signals, not grand ones. Pick one tiny thing today that says "I see you" without needing a conversation.',
    ifThen: (a) => `When ${a}, I'll do one small thing that shows I was paying attention.`,
    citation: 'Reis, H. T., & Clark, M. S. (2004).',
    institution: 'University of Rochester',
  },

  // ── Capitalization / Active-Constructive Responding ───────────────────────
  {
    id: 'cap-good-news',
    category: 'capitalization',
    body: 'How you respond to their good news predicts more than how you handle fights. If they share something good today — get curious. Ask a follow-up. Let them tell you more.',
    ifThen: (a) => `When ${a}, I'll remind myself: if they share good news, I ask one more question about it.`,
    citation: 'Gable, S. L., Reis, H. T., Impett, E. A., & Asher, E. R. (2004).',
    institution: 'UCLA / University of Rochester',
  },
  {
    id: 'cap-celebrate-small',
    category: 'capitalization',
    body: 'Most good news is small — a decent meeting, a good run, a thing that went right. Small news celebrated well does more than big news acknowledged flatly.',
    ifThen: (a) => `When ${a}, I'll treat the next small good thing they mention like it counts.`,
    citation: 'Gable, S. L., et al. (2004). What do you do when things go right?',
    institution: 'UCLA',
  },
  {
    id: 'cap-enthusiasm',
    category: 'capitalization',
    body: 'There\'s a difference between "that\'s nice" and "wait, tell me everything." Only one of them makes someone feel like their win was real.',
    ifThen: (a) => `When ${a}, I'll practice being genuinely enthusiastic once today.`,
    citation: 'Gable, S. L., & Reis, H. T. (2010). Good news!',
    institution: 'UCLA',
  },
  {
    id: 'cap-missed-one',
    category: 'capitalization',
    body: 'If you missed one recently — a moment they shared something and you were half-listening — you can still go back to it. "You told me about that thing. How did it turn out?"',
    ifThen: (a) => `When ${a}, I'll circle back to something they told me that I brushed past.`,
    citation: 'Gable, S. L., et al. (2004).',
    institution: 'UCLA / University of Rochester',
  },
];

/**
 * Deterministic daily rotation — alternates categories so the two constructs
 * interleave rather than clustering. Same day + same user = same prime
 * (no reshuffling on refresh).
 */
export function getPrimeForDay(dayIndex: number): MicroPrime {
  const ppr = MICRO_PRIMES.filter(p => p.category === 'ppr');
  const cap = MICRO_PRIMES.filter(p => p.category === 'capitalization');
  const pool = dayIndex % 2 === 0 ? ppr : cap;
  return pool[Math.floor(dayIndex / 2) % pool.length];
}

/** Default anchor copy when the user hasn't picked one yet. */
export const DEFAULT_ANCHOR = 'you get a quiet minute today';

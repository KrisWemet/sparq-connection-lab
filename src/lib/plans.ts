// plans.ts — the one place Sparq's plans and prices are defined (decided by
// Chris 2026-10-02; prices from SPARQ_MASTER_SPEC §13). Each plan adds to the
// one before it. Only list a feature here if it exists in the app today.
//
// Payments are not built yet (CLAUDE.md: design it, don't enforce it). Server
// entitlements stay two-level: Free = FREE_ENTITLEMENTS in lib/product.ts;
// Solo and Together both map to PAID_ENTITLEMENTS ('premium'). Together's
// couple features are open to everyone until payments launch.

export type PlanId = 'free' | 'solo' | 'together';

export type Plan = {
  id: PlanId;
  name: string;
  /** US dollars per month; 0 for free. */
  monthly: number;
  /** US dollars per year; 0 for free. */
  yearly: number;
  /** Who the price covers. */
  covers: string;
  tagline: string;
  /** What this plan adds on top of the plan before it. */
  adds: string[];
  /** Server entitlement level this plan maps to. */
  entitlement: 'free' | 'premium';
};

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    yearly: 0,
    covers: 'For you',
    tagline: 'A real start, not a demo.',
    adds: [
      'Your first 14 days: everything in Solo, free',
      'Daily practice 3 days a week (morning story, small action, evening reflection)',
      'Talk with Peter (10 messages a day)',
      '2 journeys of your choice',
      'See and correct everything Peter guesses about you',
      'Link with your partner',
      'Conflict First Aid and crisis help, always free',
    ],
    entitlement: 'free',
  },
  {
    id: 'solo',
    name: 'Solo',
    monthly: 9.99,
    yearly: 79.99,
    covers: 'For you',
    tagline: 'Build the habit every day.',
    adds: [
      'Daily practice every day, not just 3',
      'Talk with Peter as much as you like',
      'All 22 journeys',
    ],
    entitlement: 'premium',
  },
  {
    id: 'together',
    name: 'Together',
    monthly: 14.99,
    yearly: 119.99,
    covers: 'For both of you',
    tagline: 'Grow side by side.',
    adds: [
      'Solo for both partners, on one plan',
      'Your shared space: what you each choose to share, in one place',
      'Ask Peter for something to talk about together, from what you both shared',
      'Patterns between you, and what helps',
    ],
    entitlement: 'premium',
  },
];

export function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}

/** Percent saved by paying yearly instead of monthly, rounded down. */
export function yearlySavingsPercent(plan: Plan): number {
  if (!plan.monthly || !plan.yearly) return 0;
  return Math.floor(((plan.monthly * 12 - plan.yearly) / (plan.monthly * 12)) * 100);
}

/** What a plan costs per month when paid yearly. */
export function yearlyAsMonthly(plan: Plan): number {
  return Math.round((plan.yearly / 12) * 100) / 100;
}

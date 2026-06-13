// Deterministic welcome-back copy (spec §4). Pure functions, no LLM, no deps.
// Tone: glad you're back, nothing to catch up on, let's just begin.

/** Greeting line shown in PeterGreeting when a user returns after a gap. */
export function welcomeGreeting(firstName: string, daysAway: number): string {
  const name = firstName ? `, ${firstName}` : '';
  if (daysAway >= 14) {
    return `It's really good to see you again${name}. However long it's been, there's nothing to catch up on — we can just pick up gently from here.`;
  }
  if (daysAway >= 7) {
    return `Welcome back${name}. It's been a little while, and I'm genuinely glad you're here. No catching up needed — let's just begin.`;
  }
  // 3–6 days
  return `Hey${name} — good to see you back. A few days is nothing. Let's ease back in together.`;
}

/** Welcome-back card body, celebrating the lifetime practice-days count. */
export function welcomeCardCopy(practiceDays: number): { headline: string; body: string; cta: string } {
  return {
    headline: 'Welcome back',
    body: practiceDays > 0
      ? `You've shown up ${practiceDays} ${practiceDays === 1 ? 'day' : 'days'} so far. That doesn't go away. Want to make it ${practiceDays + 1}?`
      : `Today's a good day to begin. Just a few minutes, just you.`,
    cta: 'Pick up where we left off',
  };
}

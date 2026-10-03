// Deterministic welcome-back copy (spec §4). Pure functions, no LLM, no deps.
// Tone: good to see you, Peter kept your place, let's just begin.

/** Greeting line shown in PeterGreeting when a user returns after a gap. */
export function welcomeGreeting(firstName: string, daysAway: number): string {
  const name = firstName ? `, ${firstName}` : '';
  // Never imply Peter lost track of them: he keeps what they've shared.
  if (daysAway >= 14) {
    return `It's really good to see you again${name}. I remember where we left off, so there's nothing to catch up on. Let's pick up from there.`;
  }
  if (daysAway >= 7) {
    return `Welcome back${name}. I kept our place. Let's just begin.`;
  }
  // 3–6 days
  return `Hey${name}, good to see you. A few days is nothing. Let's ease back in together.`;
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

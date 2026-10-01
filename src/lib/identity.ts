// identity.ts — identity evidence (constitution v1.2 §11B). Pure logic.
// Sparq never tells users who they are. It counts only the steps the USER
// linked to the identity they named, and — after enough of them — asks
// whether that changes how they see themselves. Never declares it.

export const STEPS_BEFORE_ASKING = 3;
export const STEP_WINDOW_DAYS = 30;
export const DAYS_BETWEEN_ASKS = 14;

export type EvidenceRow = {
  direction: 'consistent' | 'inconsistent';
  evidence_type: string;
  created_at: string;
  asked_at?: string | null;
};

/**
 * Whether to ask the identity question now: at least three linked steps in
 * the last 30 days that came after the last time we asked, and not asked in
 * the last 14 days. `now` is injectable for tests.
 */
export function identityAskState(rows: EvidenceRow[], now = Date.now()): { steps: number; shouldAsk: boolean } {
  const windowStart = now - STEP_WINDOW_DAYS * 86_400_000;
  const lastAsked = rows
    .map(r => (r.asked_at ? Date.parse(r.asked_at) : 0))
    .reduce((a, b) => Math.max(a, b), 0);
  const steps = rows.filter(r =>
    r.direction === 'consistent'
    && r.evidence_type !== 'reflection'
    && Date.parse(r.created_at) >= Math.max(windowStart, lastAsked),
  ).length;
  const cooledDown = lastAsked === 0 || now - lastAsked >= DAYS_BETWEEN_ASKS * 86_400_000;
  return { steps, shouldAsk: steps >= STEPS_BEFORE_ASKING && cooledDown };
}

/** "someone who stays in the room" → "someone who stays in the room" (trim + no trailing dot). */
export function identityPhrase(line: string): string {
  return line.trim().replace(/[.!]+$/, '');
}

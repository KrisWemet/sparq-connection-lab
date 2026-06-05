/**
 * Dev-only prompt logger for Phase 23 manual verification.
 *
 * Phase 23 success criteria 1/2/3 are verified by inspecting the final
 * system/morning prompt strings sent to OpenRouter. This helper centralizes
 * that logging so it can be added at the assembly site in morning.ts,
 * session/start.ts, and chat.ts without scattering ad-hoc console.log calls.
 *
 * Gated on NODE_ENV !== 'production'. In production this is a no-op.
 *
 * Usage:
 *   import { logFinalPrompt } from '@/lib/server/dev-prompt-log';
 *   logFinalPrompt('peter/morning', systemPrompt, userPrompt);
 */

export function logFinalPrompt(
  label: string,
  systemPrompt: string,
  userPrompt?: string,
): void {
  if (process.env.NODE_ENV === 'production') return;

  // Single multi-line block per call to keep terminal output scannable
  // eslint-disable-next-line no-console
  console.log(
    `\n[Phase23 prompt-log] ${label}\n` +
    `--- system ---\n${systemPrompt}\n` +
    (userPrompt !== undefined ? `--- user ---\n${userPrompt}\n` : '') +
    `--- end ${label} ---\n`,
  );
}

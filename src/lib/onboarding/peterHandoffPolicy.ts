export const READY_TO_CLOSE_MARKER = '[[READY_TO_CLOSE]]';

export const ONBOARDING_MIN_CLOSE_EXCHANGES = 2;
export const ONBOARDING_TARGET_CLOSE_EXCHANGES = 3;
export const ONBOARDING_MAX_EXCHANGES = 3;

export interface OnboardingHandoffPolicy {
  allowClose: boolean;
  preferClose: boolean;
  forceClose: boolean;
}

const JOURNEY_HANDOFF_LINE = 'Let me show you where I think we start. 🦦';

export function getOnboardingHandoffPolicy(exchangeCount: number): OnboardingHandoffPolicy {
  return {
    allowClose: exchangeCount >= ONBOARDING_MIN_CLOSE_EXCHANGES,
    preferClose: exchangeCount >= ONBOARDING_TARGET_CLOSE_EXCHANGES,
    forceClose: exchangeCount >= ONBOARDING_MAX_EXCHANGES,
  };
}

export function resolveOnboardingShouldClose(exchangeCount: number, rawMessage: string): boolean {
  const policy = getOnboardingHandoffPolicy(exchangeCount);
  return policy.forceClose || (policy.allowClose && rawMessage.includes(READY_TO_CLOSE_MARKER));
}

export function normalizeOnboardingClosingMessage(rawMessage: string): string {
  const cleaned = rawMessage.replace(READY_TO_CLOSE_MARKER, '').trim();
  const lines = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const observationLine = lines.find((line) => line !== JOURNEY_HANDOFF_LINE) || cleaned;
  return `${observationLine}\n${JOURNEY_HANDOFF_LINE}`;
}

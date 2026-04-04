import { test, expect } from '@playwright/test';
import {
  getOnboardingHandoffPolicy,
  ONBOARDING_MAX_EXCHANGES,
  normalizeOnboardingClosingMessage,
  READY_TO_CLOSE_MARKER,
  resolveOnboardingShouldClose,
} from '@/lib/onboarding/peterHandoffPolicy';

test.describe('Onboarding handoff policy', () => {
  test('does not allow close on the opening exchange', async () => {
    expect(getOnboardingHandoffPolicy(1)).toEqual({
      allowClose: false,
      preferClose: false,
      forceClose: false,
    });
    expect(resolveOnboardingShouldClose(1, `Warm reply ${READY_TO_CLOSE_MARKER}`)).toBe(false);
  });

  test('allows close by the second exchange and force-closes by the third', async () => {
    expect(getOnboardingHandoffPolicy(2)).toEqual({
      allowClose: true,
      preferClose: false,
      forceClose: false,
    });
    expect(getOnboardingHandoffPolicy(3)).toEqual({
      allowClose: true,
      preferClose: true,
      forceClose: true,
    });
    expect(resolveOnboardingShouldClose(2, `Ready now ${READY_TO_CLOSE_MARKER}`)).toBe(true);
  });

  test('forces close at the max exchange even without a marker', async () => {
    expect(getOnboardingHandoffPolicy(ONBOARDING_MAX_EXCHANGES)).toEqual({
      allowClose: true,
      preferClose: true,
      forceClose: true,
    });
    expect(resolveOnboardingShouldClose(ONBOARDING_MAX_EXCHANGES, 'No marker but final turn')).toBe(true);
  });

  test('normalizes closing copy into the two-line journey handoff format', async () => {
    expect(
      normalizeOnboardingClosingMessage(
        `You care deeply, and you already know the direction.\n\n${READY_TO_CLOSE_MARKER}`
      )
    ).toBe(`You care deeply, and you already know the direction.\nLet me show you where I think we start. 🦦`);

    expect(
      normalizeOnboardingClosingMessage(
        `You are learning to stay soft without disappearing.\nLet me show you where I think we start. 🦦`
      )
    ).toBe(`You are learning to stay soft without disappearing.\nLet me show you where I think we start. 🦦`);
  });
});

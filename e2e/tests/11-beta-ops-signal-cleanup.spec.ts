import { test, expect } from '@playwright/test';
import { shouldStartLegacyJourney } from '@/lib/journeys/legacyStartPolicy';

test.describe('Beta ops signal cleanup', () => {
  test('starter journeys skip the legacy journey bootstrap path', async () => {
    expect(shouldStartLegacyJourney('building-trust')).toBe(false);
    expect(shouldStartLegacyJourney('staying-grounded')).toBe(false);
    expect(shouldStartLegacyJourney('communication')).toBe(true);
  });
});

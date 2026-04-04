import { test, expect } from '@playwright/test';
import { shouldReportPrimaryPathRouteError } from '@/lib/beta/primaryPath';

test.describe('Route change error noise cleanup', () => {
  test('suppresses the expected register redirect cancellation only', async () => {
    expect(
      shouldReportPrimaryPathRouteError(
        { cancelled: true },
        '/login?mode=register',
      )
    ).toBe(false);

    expect(
      shouldReportPrimaryPathRouteError(
        new Error('Route Cancelled'),
        '/login?mode=register',
      )
    ).toBe(false);

    expect(
      shouldReportPrimaryPathRouteError(
        new Error('Route Cancelled'),
        '/dashboard',
      )
    ).toBe(true);

    expect(
      shouldReportPrimaryPathRouteError(
        new Error('Chunk load failed'),
        '/login?mode=register',
      )
    ).toBe(true);
  });
});

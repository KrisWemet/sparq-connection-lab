import { test, expect } from '@playwright/test';

test.describe('Onboarding', () => {
  test('shows the consent gate first and keeps progress after refresh', async ({ page }) => {
    let hasConsent = false;

    await page.route('**/api/preferences', async (route) => {
      const method = route.request().method();

      if (method === 'PATCH') {
        hasConsent = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          consent: { has_consented: hasConsent },
          preferences: {},
        }),
      });
    });

    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isonboarded: false,
          psychological_profile: null,
        }),
      });
    });

    await page.goto('/onboarding');

    await expect(page.getByRole('heading', { name: 'Before we begin' })).toBeVisible();
    await page.getByRole('button', { name: "I agree, let's start" }).click();

    await expect(page.getByPlaceholder('Your first name...')).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByPlaceholder('Your first name...')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Before we begin' })).toHaveCount(0);
  });

  test('redirects completed users away from onboarding to dashboard', async ({ page }) => {
    await page.route('**/api/preferences', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          consent: { has_consented: true },
          preferences: {},
        }),
      });
    });

    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isonboarded: true,
          psychological_profile: null,
        }),
      });
    });

    await page.goto('/onboarding');

    await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
    await expect(page.getByText('SPARQ')).toBeVisible();
  });
});

import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const LIVE_ARTIFACT_DIR = path.join(process.cwd(), 'artifacts/live-beta/2026-03-31');

type EvidenceStep = {
  step: string;
  status: 'pass' | 'fail';
  note: string;
  screenshot?: string;
};

function sanitize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function capture(page: Page, evidence: EvidenceStep[], step: string, note: string) {
  const filename = `${Date.now()}-${sanitize(step)}.png`;
  const fullPath = path.join(LIVE_ARTIFACT_DIR, filename);
  await page.screenshot({ path: fullPath, fullPage: true });
  evidence.push({ step, status: 'pass', note, screenshot: fullPath });
}

async function fail(page: Page, evidence: EvidenceStep[], step: string, error: unknown) {
  const filename = `${Date.now()}-${sanitize(step)}-failed.png`;
  const fullPath = path.join(LIVE_ARTIFACT_DIR, filename);
  await page.screenshot({ path: fullPath, fullPage: true }).catch(() => {});
  evidence.push({
    step,
    status: 'fail',
    note: error instanceof Error ? error.message : String(error),
    screenshot: fullPath,
  });
}

async function completeFreshOnboardingToDashboard(
  page: Page,
  evidence: EvidenceStep[],
  email: string,
  password: string
) {
  await page.goto('/signup', { waitUntil: 'networkidle' });
  await page.waitForURL(/\/login(\?mode=register)?/, { timeout: 30_000 });
  await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 20_000 });

  await page.locator('input[name="name"]').fill('Live Playful User');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('button:has-text("I understand, create my account")')).toBeVisible({ timeout: 15_000 });
  await page.locator('button:has-text("I understand, create my account")').click();

  await page.waitForURL(/\/onboarding/, { timeout: 30_000 });
  await expect(page.locator('input[placeholder="Your first name..."]')).toBeVisible({ timeout: 15_000 });

  await page.locator('input[placeholder="Your first name..."]').fill('Avery');
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(1700);

  await page.locator('button:has-text("Under 25")').click();
  await page.locator('button:has-text("She / Her")').click();
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(1700);

  for (let i = 0; i < 24; i += 1) {
    if (await page.locator('input[placeholder="What should we call them?"]').isVisible().catch(() => false)) {
      await page.locator('input[placeholder="What should we call them?"]').fill('Taylor');
      await page.locator('button:has-text("Continue")').click();
      await page.waitForTimeout(1700);
      continue;
    }

    if (await page.locator('textarea[placeholder="Type anything that comes to mind..."]').isVisible().catch(() => false)) {
      await page.locator('textarea[placeholder="Type anything that comes to mind..."]').fill('I want us to feel lighter, kinder, and easier together.');
      await page.locator('button:has-text("Continue")').click();
      await page.waitForTimeout(1700);
      continue;
    }

    if (await page.locator('input[placeholder="Type your response..."]').isVisible().catch(() => false)) {
      break;
    }

    const questionButtons = await page.locator('button:visible').allTextContents();
    const answerText = questionButtons.find((text) => {
      const trimmed = text.trim();
      return trimmed && !trimmed.includes('Continue') && !trimmed.includes('Back') && !trimmed.includes("let's start");
    });

    if (answerText) {
      await page.locator(`button:has-text("${answerText.replace(/"/g, '\\"')}")`).first().click();
      await page.waitForTimeout(1700);
    }

    if (!(await page.url()).includes('/onboarding')) {
      break;
    }
  }

  await Promise.race([
    page.locator('input[placeholder="Type your response..."]').waitFor({ state: 'visible', timeout: 45_000 }),
    page.locator('text=Solo-first start').waitFor({ state: 'visible', timeout: 45_000 }),
  ]);

  if (!(await page.locator('text=Solo-first start').isVisible().catch(() => false))) {
    const replies = [
      'I want to be calmer and a little more playful at home.',
      'I do best when I slow down and say the true thing kindly.',
      'I want us to feel safe and a little lighter together.',
      'I want to repair faster and enjoy us more.',
      'I want our home to feel softer and easier.',
    ];

    for (const reply of replies) {
      if (await page.locator('text=Solo-first start').isVisible().catch(() => false)) break;
      const responseInput = page.locator('input[placeholder="Type your response..."]');
      if (!(await responseInput.isVisible().catch(() => false))) break;
      await responseInput.fill(reply);
      const sendButton = page.locator('button:has-text("→")');
      const peterTurn = page.waitForResponse((response) =>
        response.url().includes('/api/peter/onboarding') && response.request().method() === 'POST'
      );
      await sendButton.click();
      await peterTurn;
      await Promise.race([
        page.locator('text=Solo-first start').waitFor({ state: 'visible', timeout: 15_000 }),
        page.locator('input[placeholder="Type your response..."]').waitFor({ state: 'visible', timeout: 15_000 }),
      ]).catch(() => {});
    }
  }

  await expect(page.locator('text=Solo-first start')).toBeVisible({ timeout: 45_000 });
  await capture(page, evidence, 'journey-recommendation-live-playful', 'Reached the journey recommendation state in production.');

  const recommendationButton = page.getByRole('button', { name: /Recommended for you/i }).first();
  await expect(recommendationButton).toBeVisible({ timeout: 20_000 });
  await recommendationButton.scrollIntoViewIfNeeded();
  await recommendationButton.click({ force: true });
  await expect(page.locator("button:has-text(\"Let's start\")")).toBeVisible({ timeout: 15_000 });
  await page.locator("button:has-text(\"Let's start\")").click();

  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await capture(page, evidence, 'dashboard-live-playful', 'Dashboard loaded after onboarding for live playful verification.');
}

async function grantClipboard(context: BrowserContext, baseURL: string | undefined) {
  if (!baseURL?.startsWith('https://')) return;
  const origin = new URL(baseURL).origin;
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
}

test.describe('Live playful verification', () => {
  test.setTimeout(300_000);

  test('dashboard and daily-growth playful surfaces work in production', async ({ browser, baseURL }) => {
    if (!baseURL?.startsWith('https://')) {
      test.skip(true, 'This spec only runs against a live deployed base URL.');
    }

    fs.mkdirSync(LIVE_ARTIFACT_DIR, { recursive: true });

    const context = await browser.newContext();
    await grantClipboard(context, baseURL);
    const page = await context.newPage();
    const evidence: EvidenceStep[] = [];
    const email = `live-playful-${Date.now()}@sparq.app`;
    const password = 'LivePlayfulPass123!';

    try {
      await completeFreshOnboardingToDashboard(page, evidence, email, password);

      await expect(page.locator("text=Today's Spark")).toBeVisible({ timeout: 20_000 });
      await expect(page.locator('button:has-text("Try this")')).toBeVisible({ timeout: 15_000 });
      await capture(page, evidence, 'daily-spark-visible', 'Daily Spark is visible on the live dashboard.');

      const sparkCard = page.locator("text=Today's Spark").locator('..');
      const sparkPrompt = (await sparkCard.textContent()) || '';
      await page.locator('button:has-text("Try this")').click();
      await expect(page.locator('button:has-text("Doing this today")')).toBeVisible({ timeout: 10_000 });
      await capture(page, evidence, 'daily-spark-try', 'Daily Spark try interaction works in production.');

      await page.locator('button:has-text("Another one")').click();
      await expect(page.locator('button:has-text("Try this")')).toBeVisible({ timeout: 10_000 });
      await expect
        .poll(async () => (await sparkCard.textContent()) || '', { timeout: 10_000 })
        .not.toEqual(sparkPrompt);
      const updatedSparkPrompt = (await sparkCard.textContent()) || '';
      expect(updatedSparkPrompt).not.toEqual(sparkPrompt);
      await capture(page, evidence, 'daily-spark-swap', 'Daily Spark swap interaction changes the live prompt.');

      await page.locator('button:has-text("Copy text")').click();
      await expect(page.locator('button:has-text("Copied to send"), button:has-text("Sent")')).toBeVisible({ timeout: 10_000 });
      await capture(page, evidence, 'daily-spark-copy', 'Daily Spark copy interaction works in production.');

      await page.locator('button:has-text("Begin Today\'s Practice"), button:has-text("Resume Evening Reflection")').first().click();
      await page.waitForURL(/\/daily-growth/, { timeout: 30_000 });
      await expect(page.locator('button:has-text("Start Morning Story")')).toBeVisible({ timeout: 20_000 });

      await expect(page.locator('text=Favorite Us')).toBeVisible({ timeout: 20_000 });
      await capture(page, evidence, 'favorite-us-visible', 'Favorite Us is visible on the live daily-growth home.');

      await page.locator('textarea[placeholder="Write one small thing that felt good about us."]').fill('We felt easy together when we made dinner and cleaned up side by side.');
      await page.locator('button:has-text("Keep this note")').click();
      await expect(page.locator('button:has-text("Kept for today")')).toBeVisible({ timeout: 10_000 });
      await capture(page, evidence, 'favorite-us-save', 'Favorite Us keep interaction works in production.');

      await page.locator('button:has-text("Copy short note")').click();
      await expect(page.locator('button:has-text("Copied short note"), button:has-text("Sent")')).toBeVisible({ timeout: 10_000 });
      await capture(page, evidence, 'favorite-us-copy', 'Favorite Us copy interaction works in production.');

      fs.writeFileSync(
        path.join(LIVE_ARTIFACT_DIR, 'live-playful-surfaces.json'),
        JSON.stringify(
          {
            baseURL,
            email,
            capturedAt: new Date().toISOString(),
            evidence,
          },
          null,
          2,
        ),
      );
    } catch (error) {
      await fail(page, evidence, 'live-playful-surfaces', error);
      fs.writeFileSync(
        path.join(LIVE_ARTIFACT_DIR, 'live-playful-surfaces.json'),
        JSON.stringify(
          {
            baseURL,
            email,
            capturedAt: new Date().toISOString(),
            evidence,
          },
          null,
          2,
        ),
      );
      throw error;
    } finally {
      await context.close();
    }
  });

  test('playful endpoint outage stays fail-soft in production', async ({ browser, baseURL }) => {
    if (!baseURL?.startsWith('https://')) {
      test.skip(true, 'This spec only runs against a live deployed base URL.');
    }

    fs.mkdirSync(LIVE_ARTIFACT_DIR, { recursive: true });

    const context = await browser.newContext();
    const page = await context.newPage();
    const evidence: EvidenceStep[] = [];
    const email = `live-playful-outage-${Date.now()}@sparq.app`;
    const password = 'LivePlayfulPass123!';

    try {
      await completeFreshOnboardingToDashboard(page, evidence, email, password);

      await page.route('**/api/playful/today**', async (route) => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'playful endpoint unavailable' }),
        });
      });

      await page.goto('/dashboard', { waitUntil: 'networkidle' });
      await expect(page.locator('button:has-text("Begin Today\'s Practice"), button:has-text("Resume Evening Reflection")').first()).toBeVisible({ timeout: 20_000 });
      await expect(page.locator("text=Today's Spark")).not.toBeVisible();
      await capture(page, evidence, 'dashboard-fail-soft', 'Dashboard still loads and core CTA stays visible when the playful endpoint fails.');

      await page.goto('/daily-growth', { waitUntil: 'networkidle' });
      await expect(page.locator('button:has-text("Start Morning Story")')).toBeVisible({ timeout: 20_000 });
      await expect(page.locator('text=Favorite Us')).not.toBeVisible();
      await capture(page, evidence, 'daily-growth-fail-soft', 'Daily-growth still loads and the core home state remains intact when the playful endpoint fails.');

      fs.writeFileSync(
        path.join(LIVE_ARTIFACT_DIR, 'live-playful-fail-soft.json'),
        JSON.stringify(
          {
            baseURL,
            email,
            capturedAt: new Date().toISOString(),
            evidence,
          },
          null,
          2,
        ),
      );
    } catch (error) {
      await fail(page, evidence, 'live-playful-fail-soft', error);
      fs.writeFileSync(
        path.join(LIVE_ARTIFACT_DIR, 'live-playful-fail-soft.json'),
        JSON.stringify(
          {
            baseURL,
            email,
            capturedAt: new Date().toISOString(),
            evidence,
          },
          null,
          2,
        ),
      );
      throw error;
    } finally {
      await context.close();
    }
  });
});

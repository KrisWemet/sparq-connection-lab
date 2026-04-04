import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const LIVE_ARTIFACT_DIR = path.join(process.cwd(), 'artifacts/live-beta/2026-03-30');

test.describe('Live beta fallback verification', () => {
  test.setTimeout(240_000);

  test('login entry can create account and continue into the solo-first path', async ({ browser, baseURL }) => {
    if (!baseURL?.startsWith('https://')) {
      test.skip(true, 'This spec only runs against a live deployed base URL.');
    }

    fs.mkdirSync(LIVE_ARTIFACT_DIR, { recursive: true });

    const context = await browser.newContext();
    const page = await context.newPage();
    const email = `live-login-${Date.now()}@sparq.app`;
    const password = 'LiveBetaPass123!';

    async function shot(name: string) {
      const fullPath = path.join(LIVE_ARTIFACT_DIR, `${Date.now()}-${name}.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
      return fullPath;
    }

    try {
      await page.goto('/login?mode=register', { waitUntil: 'networkidle' });
      await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 20_000 });
      await shot('login-page');

      await page.locator('input[name="name"]').fill('Live Beta User');
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(password);
      await page.locator('button[type="submit"]').click();

      const consentButton = page.locator('button:has-text("I understand, create my account")');
      if (await consentButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await consentButton.click();
      }

      await page.waitForURL(/\/onboarding/, { timeout: 30_000 });
      await shot('login-create-account');
      await expect(page.locator('input[placeholder="Your first name..."]')).toBeVisible({ timeout: 20_000 });
      await shot('onboarding-questions');

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
          await page.locator('textarea[placeholder="Type anything that comes to mind..."]').fill('I want to stay calm, honest, and kind at home.');
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
      }

      await expect(page.locator('input[placeholder="Type your response..."]')).toBeVisible({ timeout: 45_000 });
      const replies = [
        'I want to be more steady when things feel tense.',
        'I usually do best when I slow down and say the true thing.',
        'I want home to feel softer and safer.',
        'I want to stay kind, even when I feel hurt.',
        'I want to repair faster and speak more clearly.',
      ];

      for (const reply of replies) {
        if (await page.locator('text=Solo-first start').isVisible().catch(() => false)) break;
        if (!(await page.url()).includes('/onboarding')) break;
        const responseInput = page.locator('input[placeholder="Type your response..."]');
        if (!(await responseInput.isVisible().catch(() => false))) break;
        await responseInput.fill(reply);
        const sendButton = page.locator('button:has-text("→")');
        if (!(await sendButton.isEnabled().catch(() => false))) break;
        await sendButton.click();
        await page.waitForTimeout(3000);
      }

      await expect(page.locator('text=Solo-first start')).toBeVisible({ timeout: 45_000 });
      const recommendationButton = page.getByRole('button', { name: /Recommended for you/i }).first();
      await expect(recommendationButton).toBeVisible({ timeout: 20_000 });
      await recommendationButton.scrollIntoViewIfNeeded();
      await recommendationButton.click({ force: true });
      await expect(page.locator("button:has-text(\"Let's start\")")).toBeVisible({ timeout: 15_000 });
      await page.locator("button:has-text(\"Let's start\")").click();
      await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
      await expect(page.locator("button:has-text(\"Begin Today's Practice\"), button:has-text(\"Resume Evening Reflection\")").first()).toBeVisible({ timeout: 20_000 });
      await shot('dashboard-after-login-create-account');

      await page.locator("button:has-text(\"Begin Today's Practice\"), button:has-text(\"Resume Evening Reflection\")").first().click();
      await page.waitForURL(/\/daily-growth/, { timeout: 30_000 });
      await expect(page.locator('button:has-text("Start Morning Story")')).toBeVisible({ timeout: 20_000 });
      await shot('live-daily-home');

      await page.locator('button:has-text("Start Morning Story")').click();
      await expect(page.locator("button:has-text(\"I'll do this today\")")).toBeVisible({ timeout: 30_000 });
      await shot('live-daily-morning');

      await page.locator("button:has-text(\"I'll do this today\")").click();
      await expect(page.locator("text=Next step: mark today's practice done")).toBeVisible({ timeout: 20_000 });
      await shot('live-daily-evening-entry');

      const holdButton = page.locator("button:has-text(\"Hold to mark today's step done\")");
      await holdButton.hover();
      await page.mouse.down();
      await page.waitForTimeout(3200);
      await page.mouse.up();

      await expect(page.locator('textarea[placeholder="How did it go today?"]')).toBeVisible({ timeout: 20_000 });
      await page.locator('textarea[placeholder="How did it go today?"]').fill('I slowed down and said what I needed more clearly.');
      await page.locator('form button[type="submit"]').click();
      await page.waitForTimeout(2500);

      await page.locator('textarea').fill('I felt calmer and less stuck in the conversation.');
      await page.locator('form button[type="submit"]').click();
      await expect(page.locator('button:has-text("Finish Day 1")')).toBeVisible({ timeout: 30_000 });
      await shot('live-daily-reflection-ready');

      await page.locator('button:has-text("Finish Day 1")').click();
      await expect(page.locator('text=Day 1 complete.')).toBeVisible({ timeout: 30_000 });
      await shot('live-daily-complete');
    } finally {
      await context.close();
    }
  });
});

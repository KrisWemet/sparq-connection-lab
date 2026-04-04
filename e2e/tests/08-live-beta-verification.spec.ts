import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const LIVE_ARTIFACT_DIR = path.join(process.cwd(), 'artifacts/live-beta/2026-03-30');

type EvidenceStep = {
  step: string;
  status: 'pass' | 'fail';
  note: string;
  screenshot?: string;
};

function sanitize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

test.describe('Live beta verification', () => {
  test.setTimeout(240_000);

  test('manual solo-first beta path works in production', async ({ browser, baseURL }) => {
    if (!baseURL?.startsWith('https://')) {
      test.skip(true, 'This spec only runs against a live deployed base URL.');
    }

    fs.mkdirSync(LIVE_ARTIFACT_DIR, { recursive: true });

    const context = await browser.newContext();
    const page = await context.newPage();
    const evidence: EvidenceStep[] = [];

    async function capture(step: string, note: string) {
      const filename = `${Date.now()}-${sanitize(step)}.png`;
      const fullPath = path.join(LIVE_ARTIFACT_DIR, filename);
      await page.screenshot({ path: fullPath, fullPage: true });
      evidence.push({ step, status: 'pass', note, screenshot: fullPath });
    }

    async function fail(step: string, error: unknown) {
      const filename = `${Date.now()}-${sanitize(step)}-failed.png`;
      const fullPath = path.join(LIVE_ARTIFACT_DIR, filename);
      await page.screenshot({ path: fullPath, fullPage: true }).catch(() => {});
      evidence.push({
        step,
        status: 'fail',
        note: error instanceof Error ? error.message : String(error),
        screenshot: fullPath,
      });
      fs.writeFileSync(
        path.join(LIVE_ARTIFACT_DIR, 'live-beta-evidence.json'),
        JSON.stringify(
          {
            baseURL,
            capturedAt: new Date().toISOString(),
            evidence,
          },
          null,
          2,
        ),
      );
      throw error;
    }

    const email = `live-beta-${Date.now()}@sparq.app`;
    const password = 'LiveBetaPass123!';

    try {
      await page.goto('/signup', { waitUntil: 'networkidle' });
      await page.waitForURL(/\/login(\?mode=register)?/, { timeout: 30_000 });
      await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 20_000 });
      await capture('signup-page', 'Signup route redirected to the live register experience.');

      await page.locator('input[name="name"]').fill('Live Beta User');
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(password);
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('button:has-text("I understand, create my account")')).toBeVisible({ timeout: 15_000 });
      await page.locator('button:has-text("I understand, create my account")').click();

      await page.waitForURL(/\/onboarding/, { timeout: 30_000 });
      await capture('signup-complete', 'Fresh account reached onboarding.');
      await expect(page.locator('input[placeholder="Your first name..."]')).toBeVisible({ timeout: 15_000 });
      await capture('consent-gate', 'Consent saved and question flow opened.');

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

        const optionButtons = page.locator('button').filter({ hasNot: page.locator('svg') });
        const questionButtons = await page.locator('button:visible').allTextContents();
        const answerText = questionButtons.find((text) => {
          const trimmed = text.trim();
          return trimmed && !trimmed.includes('Continue') && !trimmed.includes('Back') && !trimmed.includes("let's start");
        });

        if (answerText) {
          await page.locator(`button:has-text("${answerText.replace(/"/g, '\\"')}")`).first().click();
          await page.waitForTimeout(1700);
        } else if (await optionButtons.count()) {
          await optionButtons.first().click();
          await page.waitForTimeout(1700);
        }

        if (!(await page.url()).includes('/onboarding')) {
          break;
        }
      }

      await expect(page.locator('input[placeholder="Type your response..."]')).toBeVisible({ timeout: 45_000 });
      await capture('question-flow-complete', 'Reached live Peter onboarding session.');

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

      await expect(page.locator('text=Solo-first start')).toBeVisible({ timeout: 45_000 });
      await capture('journey-recommendation', 'Peter session completed and journey recommendation loaded.');

      const recommendationButton = page.getByRole('button', { name: /Recommended for you/i }).first();
      await expect(recommendationButton).toBeVisible({ timeout: 20_000 });
      await recommendationButton.scrollIntoViewIfNeeded();
      await recommendationButton.click({ force: true });
      await expect(page.locator("button:has-text(\"Let's start\")")).toBeVisible({ timeout: 15_000 });
      await capture('journey-detail', 'Journey detail page loaded with solo-first framing.');

      await page.locator("button:has-text(\"Let's start\")").click();
      await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
      await capture('dashboard', 'Dashboard loaded after onboarding completion.');

      const startButton = page.locator("button:has-text(\"Begin Today's Practice\"), button:has-text(\"Resume Evening Reflection\")").first();
      await expect(startButton).toBeVisible({ timeout: 20_000 });
      await startButton.click();

      await page.waitForURL(/\/daily-growth/, { timeout: 30_000 });
      await expect(page.locator('button:has-text("Start Morning Story")')).toBeVisible({ timeout: 20_000 });
      await capture('daily-home', 'Daily growth home state loaded.');

      await page.locator('button:has-text("Start Morning Story")').click();
      await expect(page.locator("button:has-text(\"I'll do this today\")")).toBeVisible({ timeout: 30_000 });
      await capture('daily-morning', 'Morning story and action loaded in production.');

      await page.locator("button:has-text(\"I'll do this today\")").click();
      await expect(page.locator("text=Next step: mark today's practice done")).toBeVisible({ timeout: 20_000 });
      await capture('daily-evening-entry', 'Evening reflection entry state loaded.');

      const holdButton = page.locator("button:has-text(\"Hold to mark today's step done\")");
      await holdButton.hover();
      await page.mouse.down();
      await page.waitForTimeout(3200);
      await page.mouse.up();

      await expect(page.locator('textarea[placeholder="How did it go today?"]')).toBeVisible({ timeout: 20_000 });
      await page.locator('textarea[placeholder="How did it go today?"]').fill('I slowed down and said the kinder version first.');
      await page.locator('form button[type="submit"]').click();
      await page.waitForTimeout(2500);

      await page.locator('textarea').fill('The talk stayed softer, and I felt more steady the whole time.');
      await page.locator('form button[type="submit"]').click();
      await expect(page.locator('button:has-text("Finish Day 1")')).toBeVisible({ timeout: 30_000 });
      await capture('daily-reflection', 'Evening reflection reached completion state.');

      await page.locator('button:has-text("Finish Day 1")').click();
      await expect(page.locator('text=Day 1 complete.')).toBeVisible({ timeout: 30_000 });
      await capture('daily-complete', 'Solo-first daily loop completed in production.');

      fs.writeFileSync(
        path.join(LIVE_ARTIFACT_DIR, 'live-beta-evidence.json'),
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
      await fail('live-beta-flow', error);
    } finally {
      await context.close();
    }
  });
});

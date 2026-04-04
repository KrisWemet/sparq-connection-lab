import { test, expect, type Page } from '@playwright/test';
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

async function finishOnboardingFromCurrentSession(
  page: Page,
  evidence: EvidenceStep[],
  firstName = 'Avery'
) {
  await expect(page.locator('input[placeholder="Your first name..."]')).toBeVisible({ timeout: 20_000 });
  await page.locator('input[placeholder="Your first name..."]').fill(firstName);
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
      await page.locator('textarea[placeholder="Type anything that comes to mind..."]').fill(
        'I want us to feel softer, steadier, and a little more playful at home.',
      );
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
      'I want to be calmer and kinder when home gets tense.',
      'I want to repair faster and enjoy us more.',
      'I want us to feel safe and a little lighter together.',
      'I want to slow down and say the true thing kindly.',
    ];

    for (const reply of replies) {
      if (await page.locator('text=Solo-first start').isVisible().catch(() => false)) break;
      const responseInput = page.locator('input[placeholder="Type your response..."]');
      if (!(await responseInput.isVisible().catch(() => false))) break;
      await responseInput.fill(reply);
      const peterTurn = page.waitForResponse((response) =>
        response.url().includes('/api/peter/onboarding') && response.request().method() === 'POST',
      );
      await page.locator('button:has-text("→")').click();
      await peterTurn;
      await Promise.race([
        page.locator('text=Solo-first start').waitFor({ state: 'visible', timeout: 15_000 }),
        page.locator('input[placeholder="Type your response..."]').waitFor({ state: 'visible', timeout: 15_000 }),
      ]).catch(() => {});
    }
  }

  await expect(page.locator('text=Solo-first start')).toBeVisible({ timeout: 45_000 });
  const recommendationButton = page.getByRole('button', { name: /Recommended for you/i }).first();
  await recommendationButton.click({ force: true });
  await expect(page.locator("button:has-text(\"Let's start\")")).toBeVisible({ timeout: 15_000 });
  await page.locator("button:has-text(\"Let's start\")").click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
}

async function loginExistingUserToDashboard(
  page: Page,
  evidence: EvidenceStep[],
  email: string,
  password: string,
  firstName = 'Avery'
) {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 20_000 });

  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL(/\/onboarding|\/dashboard/, { timeout: 30_000 });

  if ((await page.url()).includes('/dashboard')) {
    await capture(page, evidence, 'dashboard-login-direct', 'Existing cohort user reached dashboard directly.');
    return;
  }

  await finishOnboardingFromCurrentSession(page, evidence, firstName);
  await capture(page, evidence, 'dashboard-after-login-onboarding', 'Existing cohort user completed onboarding and reached dashboard.');
}

async function createFreshUserToDashboard(
  page: Page,
  evidence: EvidenceStep[],
  email: string,
  password: string,
) {
  await page.goto('/signup', { waitUntil: 'networkidle' });
  await page.waitForURL(/\/login(\?mode=register)?/, { timeout: 30_000 });
  await page.locator('input[name="name"]').fill('Post Cutoff User');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('button:has-text("I understand, create my account")')).toBeVisible({ timeout: 15_000 });
  await page.locator('button:has-text("I understand, create my account")').click();
  await page.waitForURL(/\/onboarding/, { timeout: 30_000 });
  await finishOnboardingFromCurrentSession(page, evidence, 'Jordan');
  await capture(page, evidence, 'dashboard-after-signup-onboarding', 'Fresh post-cutoff user completed onboarding and reached dashboard.');
}

test.describe('Live controlled beta review', () => {
  test.setTimeout(300_000);

  test('pre-cutoff cohort user still sees playful prompts and can submit playful feedback', async ({ browser, baseURL }) => {
    if (!baseURL?.startsWith('https://')) {
      test.skip(true, 'This spec only runs against a live deployed base URL.');
    }

    const cohortEmail = process.env.PHASE16_COHORT_EMAIL;
    const cohortPassword = process.env.PHASE16_COHORT_PASSWORD;
    if (!cohortEmail || !cohortPassword) {
      test.skip(true, 'Phase 16 cohort credentials were not provided.');
    }

    fs.mkdirSync(LIVE_ARTIFACT_DIR, { recursive: true });

    const context = await browser.newContext();
    const page = await context.newPage();
    const evidence: EvidenceStep[] = [];

    try {
      await loginExistingUserToDashboard(page, evidence, cohortEmail!, cohortPassword!, 'Casey');

      await expect(page.locator("text=Today's Spark")).toBeVisible({ timeout: 20_000 });
      await capture(page, evidence, 'cohort-dashboard-playful', 'Pre-cutoff cohort user still sees Daily Spark on dashboard.');

      await page.getByRole('button', { name: 'Beta feedback' }).first().click();
      await expect(page.locator('text=How did this page feel?')).toBeVisible({ timeout: 10_000 });
      await page.locator('button:has-text("4")').click();
      await page.locator('textarea').fill('Daily Spark felt warm and easy to ignore if I was busy. It did not get in the way.');
      await page.locator('button:has-text("Send feedback")').click();
      await expect(page.locator('text=Thanks. Your feedback was saved for the beta review.')).toBeVisible({ timeout: 10_000 });
      await page.locator('button:has-text("Done")').click();
      await capture(page, evidence, 'cohort-dashboard-feedback', 'Dashboard playful feedback submitted.');

      await page.locator('button:has-text("Begin Today\'s Practice"), button:has-text("Resume Evening Reflection")').first().click();
      await page.waitForURL(/\/daily-growth/, { timeout: 30_000 });
      await expect(page.locator('text=Favorite Us')).toBeVisible({ timeout: 20_000 });
      await capture(page, evidence, 'cohort-daily-playful', 'Pre-cutoff cohort user still sees Favorite Us on daily-growth home.');

      await page.getByRole('button', { name: 'Beta feedback' }).first().click();
      await expect(page.locator('text=How did this light note feel?')).toBeVisible({ timeout: 10_000 });
      await page.locator('button:has-text("4")').click();
      await page
        .getByRole('textbox', {
          name: 'Tell us if Favorite Us felt helpful, cheesy, distracting, confusing, or easy to skip.',
        })
        .fill('Favorite Us felt gentle and optional. It added warmth without changing the main daily step.');
      await page.locator('button:has-text("Send feedback")').click();
      await expect(page.locator('text=Thanks. Your feedback was saved for the beta review.')).toBeVisible({ timeout: 10_000 });
      await page.locator('button:has-text("Done")').click();
      await capture(page, evidence, 'cohort-daily-feedback', 'Daily playful feedback submitted.');

      fs.writeFileSync(
        path.join(LIVE_ARTIFACT_DIR, 'phase16-controlled-beta-cohort.json'),
        JSON.stringify({ baseURL, cohortEmail, capturedAt: new Date().toISOString(), evidence }, null, 2),
      );
    } catch (error) {
      await fail(page, evidence, 'phase16-cohort-flow', error);
      fs.writeFileSync(
        path.join(LIVE_ARTIFACT_DIR, 'phase16-controlled-beta-cohort.json'),
        JSON.stringify({ baseURL, cohortEmail, capturedAt: new Date().toISOString(), evidence }, null, 2),
      );
      throw error;
    } finally {
      await context.close();
    }
  });

  test('post-cutoff signup stays on the serious core without playful prompts', async ({ browser, baseURL }) => {
    if (!baseURL?.startsWith('https://')) {
      test.skip(true, 'This spec only runs against a live deployed base URL.');
    }

    fs.mkdirSync(LIVE_ARTIFACT_DIR, { recursive: true });

    const context = await browser.newContext();
    const page = await context.newPage();
    const evidence: EvidenceStep[] = [];
    const email = `phase16-post-cutoff-${Date.now()}@sparq.app`;
    const password = 'Phase16PostCutoff!123';

    try {
      await createFreshUserToDashboard(page, evidence, email, password);

      await expect(page.locator("text=Today's Spark")).not.toBeVisible();
      await capture(page, evidence, 'post-cutoff-dashboard-serious-core', 'Fresh post-cutoff signup reaches dashboard without Daily Spark.');

      await page.locator('button:has-text("Begin Today\'s Practice"), button:has-text("Resume Evening Reflection")').first().click();
      await page.waitForURL(/\/daily-growth/, { timeout: 30_000 });
      await expect(page.locator('button:has-text("Start Morning Story")')).toBeVisible({ timeout: 20_000 });
      await expect(page.locator('text=Favorite Us')).not.toBeVisible();
      await capture(page, evidence, 'post-cutoff-daily-serious-core', 'Fresh post-cutoff signup reaches daily-growth home without Favorite Us.');

      fs.writeFileSync(
        path.join(LIVE_ARTIFACT_DIR, 'phase16-post-cutoff-serious-core.json'),
        JSON.stringify({ baseURL, email, capturedAt: new Date().toISOString(), evidence }, null, 2),
      );
    } catch (error) {
      await fail(page, evidence, 'phase16-post-cutoff-flow', error);
      fs.writeFileSync(
        path.join(LIVE_ARTIFACT_DIR, 'phase16-post-cutoff-serious-core.json'),
        JSON.stringify({ baseURL, email, capturedAt: new Date().toISOString(), evidence }, null, 2),
      );
      throw error;
    } finally {
      await context.close();
    }
  });
});

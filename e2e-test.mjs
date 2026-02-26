import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'e2e-screenshots');
mkdirSync(screenshotsDir, { recursive: true });

const BASE_URL = 'http://localhost:3000';
const results = [];

function log(step, status, notes) {
  const entry = { step, status, notes };
  results.push(entry);
  console.log(`[${status.toUpperCase()}] ${step}`);
  if (notes) console.log(`  -> ${notes}`);
}

async function takeScreenshot(page, name) {
  const filePath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  Screenshot saved: ${name}.png`);
  return filePath;
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // ─── Step 1: Navigate to homepage ───────────────────────────────────────────
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await takeScreenshot(page, '01-homepage');

    const title = await page.title();
    const url = page.url();
    const h1 = await page.locator('h1').first().textContent().catch(() => null);
    const h2 = await page.locator('h2').first().textContent().catch(() => null);
    const bodyText = await page.locator('body').innerText();

    // Check for "Transform Your Relationship" or any heading
    const hasTransformHeading = bodyText.includes('Transform Your Relationship');
    const redirectedTo = url;

    log(
      'Step 1: Navigate to http://localhost:3000',
      hasTransformHeading || url.includes('/dashboard') || url.includes('/login') ? 'pass' : 'info',
      `URL: ${redirectedTo} | Title: "${title}" | h1: "${h1}" | h2: "${h2}" | Has "Transform Your Relationship": ${hasTransformHeading}`
    );
  } catch (err) {
    log('Step 1: Navigate to http://localhost:3000', 'fail', err.message);
    await takeScreenshot(page, '01-homepage-error');
  }

  // ─── Step 2: Click Login/Sign In button ─────────────────────────────────────
  try {
    // If we got redirected to login already, that's fine
    if (!page.url().includes('/login')) {
      // Look for login/sign in button or link
      const loginSelectors = [
        'a[href="/login"]',
        'button:has-text("Login")',
        'button:has-text("Sign In")',
        'a:has-text("Login")',
        'a:has-text("Sign In")',
        'a:has-text("Get Started")',
        'button:has-text("Get Started")',
      ];

      let clicked = false;
      for (const selector of loginSelectors) {
        const el = page.locator(selector).first();
        const count = await el.count();
        if (count > 0) {
          await el.click();
          clicked = true;
          log('Step 2: Click login button', 'pass', `Clicked selector: "${selector}"`);
          break;
        }
      }

      if (!clicked) {
        // Try navigating directly
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 10000 });
        log('Step 2: Navigate to /login directly', 'info', 'No login button found on homepage, navigated directly');
      }
    } else {
      log('Step 2: Already on /login (redirected)', 'pass', `URL: ${page.url()}`);
    }

    await page.waitForURL(/login|dashboard/, { timeout: 5000 }).catch(() => {});
    await takeScreenshot(page, '02-login-page');
    log('Step 2 result', 'info', `URL after step: ${page.url()}`);
  } catch (err) {
    log('Step 2: Click Login button', 'fail', err.message);
    await takeScreenshot(page, '02-login-error');
  }

  // ─── Step 3: Enter invalid credentials ──────────────────────────────────────
  try {
    // Make sure we're on the login page
    if (!page.url().includes('/login')) {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 10000 });
    }

    // Look for email and password fields
    await page.waitForSelector('input[type="email"], input[name="email"], input[placeholder*="email" i]', { timeout: 5000 });

    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill('chris@example.com');
    await passwordInput.fill('testpassword123');

    await takeScreenshot(page, '03-login-form-filled');

    // Submit form
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log In")').first();
    await submitBtn.click();

    // Wait for error message
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '03-login-error-response');

    // Look for error message
    const errorSelectors = [
      '[role="alert"]',
      '.error',
      '.text-red-500',
      '.text-red-600',
      '.text-destructive',
      '[data-sonner-toast]',
      'p:has-text("Invalid")',
      'p:has-text("incorrect")',
      'p:has-text("error")',
      'div:has-text("Invalid login credentials")',
    ];

    let errorText = null;
    for (const sel of errorSelectors) {
      const el = page.locator(sel).first();
      if (await el.count() > 0) {
        errorText = await el.textContent();
        break;
      }
    }

    // Also grab all visible text for context
    const bodyText = await page.locator('body').innerText();
    const hasError = bodyText.toLowerCase().includes('invalid') ||
                     bodyText.toLowerCase().includes('incorrect') ||
                     bodyText.toLowerCase().includes('error') ||
                     errorText !== null;

    log(
      'Step 3: Submit invalid credentials',
      'info',
      `Error element text: "${errorText}" | URL: ${page.url()} | Body contains error keyword: ${hasError}`
    );
  } catch (err) {
    log('Step 3: Submit invalid credentials', 'fail', err.message);
    await takeScreenshot(page, '03-login-error');
  }

  // ─── Step 4: Register new test account ──────────────────────────────────────
  try {
    if (!page.url().includes('/login')) {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 10000 });
    }

    // Look for "Register" / "Sign Up" toggle
    const registerToggleSelectors = [
      'button:has-text("Register")',
      'button:has-text("Sign Up")',
      'button:has-text("Create Account")',
      'a:has-text("Register")',
      'a:has-text("Sign Up")',
      'a:has-text("Create Account")',
      'span:has-text("Register")',
      'span:has-text("Sign Up")',
    ];

    let toggleClicked = false;
    for (const selector of registerToggleSelectors) {
      const el = page.locator(selector).first();
      if (await el.count() > 0) {
        await el.click();
        toggleClicked = true;
        log('Step 4: Switch to register mode', 'pass', `Clicked: "${selector}"`);
        break;
      }
    }

    if (!toggleClicked) {
      log('Step 4: Switch to register mode', 'info', 'No register toggle found, checking current form state');
    }

    await page.waitForTimeout(1000);
    await takeScreenshot(page, '04-register-form');

    // Fill in registration form
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="Name" i]').first();
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    if (await nameInput.count() > 0) {
      await nameInput.fill('Test User');
      log('Step 4: Fill name field', 'pass', 'Filled "Test User"');
    } else {
      log('Step 4: Fill name field', 'info', 'Name field not found');
    }

    await emailInput.fill('e2etest_sparq@mailinator.com');
    await passwordInput.fill('TestPass123!');

    await takeScreenshot(page, '04-register-form-filled');

    // Submit
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Wait for redirect or error
    await page.waitForTimeout(5000);
    await takeScreenshot(page, '04-register-response');

    const currentUrl = page.url();
    const bodyText = await page.locator('body').innerText();
    const registrationSuccess = currentUrl.includes('/dashboard') || currentUrl.includes('/onboarding');
    const hasRegError = bodyText.toLowerCase().includes('already') || bodyText.toLowerCase().includes('error');

    log(
      'Step 4: Submit registration form',
      registrationSuccess ? 'pass' : 'info',
      `URL after submit: ${currentUrl} | Success: ${registrationSuccess} | Body has error keyword: ${hasRegError}`
    );
  } catch (err) {
    log('Step 4: Register new test account', 'fail', err.message);
    await takeScreenshot(page, '04-register-error');
  }

  // ─── Step 5: Verify redirect to /dashboard ───────────────────────────────────
  try {
    // If not on dashboard yet, try navigating there
    if (!page.url().includes('/dashboard')) {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 10000 });
    }

    await page.waitForTimeout(2000);
    await takeScreenshot(page, '05-dashboard');

    const url = page.url();
    const onDashboard = url.includes('/dashboard');
    const bodyText = await page.locator('body').innerText();

    log(
      'Step 5: Verify redirect to /dashboard',
      onDashboard ? 'pass' : 'info',
      `URL: ${url} | On dashboard: ${onDashboard}`
    );
  } catch (err) {
    log('Step 5: Verify redirect to /dashboard', 'fail', err.message);
    await takeScreenshot(page, '05-dashboard-error');
  }

  // ─── Step 6: Verify dashboard content ────────────────────────────────────────
  try {
    if (!page.url().includes('/dashboard')) {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    const bodyText = await page.locator('body').innerText();
    const hasTodayQuestion = bodyText.includes("Today's Question") || bodyText.includes("Daily Question");
    const hasFeatureButtons = bodyText.includes('Answer Now') || bodyText.includes('Daily Growth') || bodyText.includes('Date Ideas');

    // Check for feature buttons
    const featureButtons = await page.locator('button, a').allTextContents();
    const buttonList = featureButtons.filter(t => t.trim().length > 0).join(', ');

    // Look for the 5 feature buttons mentioned in the task
    const expectedButtons = ['Answer Now', 'Daily Growth', 'Date Ideas', 'Start Journey', 'Skill Tree'];
    const foundButtons = expectedButtons.filter(btn => bodyText.includes(btn));

    await takeScreenshot(page, '06-dashboard-content');

    log(
      'Step 6: Verify dashboard content',
      hasTodayQuestion ? 'pass' : 'info',
      `Has "Today's Question": ${hasTodayQuestion} | Has feature buttons: ${hasFeatureButtons} | Found buttons: [${foundButtons.join(', ')}]`
    );

    // Log full dashboard text excerpt for context
    const excerpt = bodyText.substring(0, 500);
    log('Step 6: Dashboard text excerpt', 'info', excerpt.replace(/\n/g, ' | '));
  } catch (err) {
    log('Step 6: Verify dashboard content', 'fail', err.message);
    await takeScreenshot(page, '06-dashboard-error');
  }

  // ─── Step 7: Click "Answer Now" → /daily-questions ──────────────────────────
  try {
    const answerNowBtn = page.locator('button:has-text("Answer Now"), a:has-text("Answer Now")').first();
    if (await answerNowBtn.count() > 0) {
      await answerNowBtn.click();
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '07-daily-questions');

      const url = page.url();
      const bodyText = await page.locator('body').innerText();
      log(
        'Step 7: Click "Answer Now"',
        url.includes('/daily-questions') ? 'pass' : 'info',
        `URL: ${url} | Body excerpt: ${bodyText.substring(0, 200).replace(/\n/g, ' | ')}`
      );
    } else {
      log('Step 7: Click "Answer Now"', 'info', '"Answer Now" button not found on dashboard');
    }
  } catch (err) {
    log('Step 7: Click "Answer Now"', 'fail', err.message);
    await takeScreenshot(page, '07-daily-questions-error');
  }

  // ─── Step 8: Go back to dashboard, click "Daily Growth" ─────────────────────
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);

    const dailyGrowthBtn = page.locator('button:has-text("Daily Growth"), a:has-text("Daily Growth")').first();
    if (await dailyGrowthBtn.count() > 0) {
      await dailyGrowthBtn.click();
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '08-daily-growth');

      const url = page.url();
      const bodyText = await page.locator('body').innerText();
      log(
        'Step 8: Click "Daily Growth"',
        'info',
        `URL: ${url} | Body excerpt: ${bodyText.substring(0, 200).replace(/\n/g, ' | ')}`
      );
    } else {
      log('Step 8: Click "Daily Growth"', 'info', '"Daily Growth" button not found on dashboard');
      // List all clickable elements text for debugging
      const allText = await page.locator('button, a').allTextContents();
      log('Step 8: Available buttons/links', 'info', allText.filter(t => t.trim()).slice(0, 20).join(' | '));
    }
  } catch (err) {
    log('Step 8: Click "Daily Growth"', 'fail', err.message);
    await takeScreenshot(page, '08-daily-growth-error');
  }

  // ─── Final summary ─────────────────────────────────────────────────────────
  console.log('\n=== CONSOLE ERRORS CAPTURED ===');
  if (consoleErrors.length === 0) {
    console.log('No console errors detected.');
  } else {
    consoleErrors.forEach((e, i) => console.log(`  ${i+1}. ${e}`));
  }

  // Write results to file
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results,
    consoleErrors
  };
  writeFileSync(path.join(__dirname, 'e2e-results.json'), JSON.stringify(report, null, 2));
  console.log('\nResults saved to e2e-results.json');
  console.log(`Screenshots saved in: ${screenshotsDir}`);

  await browser.close();
  return report;
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

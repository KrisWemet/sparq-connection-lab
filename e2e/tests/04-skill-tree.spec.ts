import { test, expect } from '@playwright/test';
import { mockPeterRoutes } from '../helpers/mock-peter';
import { mockUserInsights, mockSkillProgress } from '../helpers/mock-supabase';

test.describe('Skill Tree', () => {
  test('shows locked gate when skill tree not unlocked', async ({ page }) => {
    await mockUserInsights(page, { onboarding_day: 5, skill_tree_unlocked: false });
    await mockSkillProgress(page, []);

    await page.goto('/skill-tree');

    await expect(page.locator('h1:has-text("Skill Tree Locked")')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('button:has-text("Continue with Peter")')).toBeVisible();

    // Progress bar exists
    await expect(page.locator('text=Day 5 of 14')).toBeVisible();
  });

  test('"Continue with Peter" routes to /daily-growth', async ({ page }) => {
    await mockUserInsights(page, { onboarding_day: 5, skill_tree_unlocked: false });
    await mockSkillProgress(page, []);

    await page.goto('/skill-tree');
    await page.locator('button:has-text("Continue with Peter")').click();
    await page.waitForURL('**/daily-growth', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/daily-growth/);
  });

  test('shows unlocked skill tree with 3 tracks', async ({ page }) => {
    await mockPeterRoutes(page);
    await mockUserInsights(page, { onboarding_day: 15, skill_tree_unlocked: true });
    await mockSkillProgress(page, []);

    await page.goto('/skill-tree');

    // Gate screen should NOT be visible
    await expect(page.locator('h1:has-text("Skill Tree Locked")')).not.toBeVisible();

    // All 3 tracks visible
    await expect(page.locator('text=Communication')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Conflict Resolution')).toBeVisible();
    await expect(page.locator('text=Intimacy')).toBeVisible();

    // Level 1 Basic is available (Start badge) in first track (Communication)
    await expect(page.locator('button:has-text("Level 1: Basic")').first()).toBeVisible();
    // Should show "Start" status badge
    await expect(page.locator('text=Start').first()).toBeVisible();
  });

  test('advanced and expert levels are locked when basic not complete', async ({ page }) => {
    await mockPeterRoutes(page);
    await mockUserInsights(page, { onboarding_day: 15, skill_tree_unlocked: true });
    await mockSkillProgress(page, []);

    await page.goto('/skill-tree');
    await expect(page.locator('text=Communication')).toBeVisible({ timeout: 10_000 });

    // Level 2 (Advanced) should be disabled (locked until Basic complete)
    const advancedButton = page.locator('button:has-text("Level 2: Advanced")').first();
    await expect(advancedButton).toBeDisabled();
  });

  test('completed levels show as done after finishing', async ({ page }) => {
    await mockPeterRoutes(page);
    // Pre-seed: basic communication already complete
    await mockUserInsights(page, { onboarding_day: 15, skill_tree_unlocked: true });
    await mockSkillProgress(page, [
      { track: 'communication', level: 'basic', completed_at: new Date().toISOString() },
    ]);

    await page.goto('/skill-tree');
    await expect(page.locator('text=Communication')).toBeVisible({ timeout: 10_000 });

    // Basic should show "Complete" badge
    const basicRow = page.locator('button:has-text("Level 1: Basic")').first();
    await expect(basicRow).toContainText('Complete');

    // Advanced should now be available (Start badge)
    const advancedRow = page.locator('button:has-text("Level 2: Advanced")').first();
    await expect(advancedRow).toContainText('Start');
  });

  test('clicking an available level opens the node panel', async ({ page }) => {
    await mockPeterRoutes(page);
    await mockUserInsights(page, { onboarding_day: 15, skill_tree_unlocked: true });
    await mockSkillProgress(page, []);

    await page.goto('/skill-tree');
    await expect(page.locator('button:has-text("Level 1: Basic")').first()).toBeVisible({ timeout: 10_000 });

    // Click the first available Basic level (Communication track)
    await page.locator('button:has-text("Level 1: Basic")').first().click();

    // Panel header appears
    await expect(
      page.locator('text=Communication — Basic')
    ).toBeVisible({ timeout: 8_000 });

    // Peter's story loads in the panel
    await expect(
      page.locator('text=Alex noticed Sam')
    ).toBeVisible({ timeout: 8_000 });

    // Chat input is ready in panel
    await expect(
      page.locator('textarea[placeholder="Share your reflection..."]')
    ).toBeVisible();
  });

  test('completing a level shows celebration', async ({ page }) => {
    await mockPeterRoutes(page);
    await mockUserInsights(page, { onboarding_day: 15, skill_tree_unlocked: true });
    await mockSkillProgress(page, []);

    await page.goto('/skill-tree');
    await expect(page.locator('button:has-text("Level 1: Basic")').first()).toBeVisible({ timeout: 10_000 });

    // Open the node panel
    await page.locator('button:has-text("Level 1: Basic")').first().click();
    await expect(page.locator('text=Communication — Basic')).toBeVisible({ timeout: 8_000 });

    // Wait for Peter's opening story to load
    await expect(page.locator('text=Alex noticed Sam')).toBeVisible({ timeout: 8_000 });

    // Send a reflection message
    const textarea = page.locator('textarea[placeholder="Share your reflection..."]');
    await textarea.fill('We tried sitting together without phones. It was surprisingly peaceful.');
    await page.locator('form button[type="submit"]').click();

    // After Peter responds, "Complete Basic Level" button appears
    await expect(
      page.locator('button:has-text("Complete Basic Level")')
    ).toBeVisible({ timeout: 10_000 });

    // Click complete
    await page.locator('button:has-text("Complete Basic Level")').click();

    // Celebration shown
    await expect(page.locator('text=Level complete!')).toBeVisible({ timeout: 8_000 });
  });
});

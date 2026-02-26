import type { Page } from '@playwright/test';

const PETER_CHAT_RESPONSE = "Thanks for sharing that with me 🦦 I hear you, and that takes real courage to say out loud.";
const PETER_MORNING_STORY = `Alex noticed Sam had been quieter than usual all day. Instead of asking "what's wrong?", Alex simply sat down next to Sam and said, "I'm here whenever you're ready."\n\nToday's Action: Find one moment today to sit with your partner in silence — no phones, no fixing. Just be present.`;
const PETER_ANALYZE_INSIGHTS = {
  attachment_style: 'secure',
  love_language: 'time',
  conflict_style: 'validating',
  emotional_state: 'neutral',
};

export async function mockPeterRoutes(page: Page) {
  await page.route('/api/peter/chat', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: PETER_CHAT_RESPONSE }),
    });
  });

  await page.route('/api/peter/morning', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ story: PETER_MORNING_STORY }),
    });
  });

  await page.route('/api/peter/analyze', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ insights: PETER_ANALYZE_INSIGHTS }),
    });
  });
}

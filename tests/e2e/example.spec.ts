import { test, expect } from '@playwright/test';

test('homepage has expected title', async ({ page }) => {
  await page.goto('/');
  // Checking for basic title to ensure page loaded
  await expect(page).toHaveTitle(/چاپخانه/);
});

import { test, expect } from '@playwright/test';

/**
 * Smoke coverage for the public routes.
 *
 * Deliberately read-only: no account creation, no orders, no writes. The
 * order-placement flow needs a seeded price list and a test account, so it is
 * not covered here.
 */

const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/templates',
  '/portfolio',
  '/about',
  '/guide',
  '/faq',
  '/contact',
  '/cart',
  '/track',
  '/login',
];

test.describe('public routes', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} renders without console or network errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on('console', (m) => {
        if (m.type() === 'error') consoleErrors.push(m.text());
      });
      page.on('pageerror', (e) => pageErrors.push(String(e)));

      const response = await page.goto(route);
      expect(response?.status(), `HTTP status for ${route}`).toBeLessThan(400);

      // Every page must expose the main landmark the skip link targets.
      await expect(page.locator('#main-content')).toBeAttached();

      // Exactly one h1 per page.
      await expect(page.locator('h1')).toHaveCount(1);

      expect(pageErrors, `uncaught exceptions on ${route}`).toEqual([]);
      expect(consoleErrors, `console errors on ${route}`).toEqual([]);
    });
  }
});

test.describe('accessibility basics', () => {
  test('skip link is the first focusable element and moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skip = page.locator('a.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
  });

  test('keyboard focus is always visible', async ({ page }) => {
    await page.goto('/');

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      const hasRing = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return true; // nothing focused; not a failure
        const cs = getComputedStyle(el);
        return (
          (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
          cs.boxShadow !== 'none'
        );
      });

      const description = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 30)}"` : 'none';
      });

      expect(hasRing, `no focus indicator on ${description}`).toBe(true);
    }
  });

  test('mobile menu toggle exposes its expanded state', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const toggle = page.getByRole('button', { name: /باز کردن منو/ });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(page.getByRole('button', { name: /بستن منو/ })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-menu')).toBeVisible();
  });

  test('no horizontal overflow at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of ['/', '/products', '/contact', '/track']) {
      await page.goto(route);
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        return de.scrollWidth - de.clientWidth;
      });
      expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('private routes', () => {
  const PROTECTED = ['/orders', '/invoices', '/files', '/proofs', '/design', '/wallet', '/b2b'];

  for (const route of PROTECTED) {
    test(`${route} redirects an anonymous visitor to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  test('/production redirects an anonymous visitor to the admin login', async ({ page }) => {
    await page.goto('/production');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe('order tracking', () => {
  test('reports a not-found order instead of failing', async ({ page }) => {
    await page.goto('/track');

    await page.getByLabel('شماره سفارش').fill('ORD-DOES-NOT-EXIST');
    await page.getByRole('button', { name: /استعلام وضعیت/ }).click();

    await expect(page.getByText(/سفارشی با این شماره یافت نشد/)).toBeVisible();
  });
});

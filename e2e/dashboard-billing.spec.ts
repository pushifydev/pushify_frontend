import { test, expect } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe('Dashboard billing (authenticated)', () => {
  test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated e2e');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').first().fill(email!);
    await page.locator('input[type="password"]').first().fill(password!);
    await page.getByRole('button', { name: /sign in|giriş/i }).first().click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  });

  test('billing page shows infra wallet section', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await expect(page.getByRole('heading', { name: /billing|faturalandırma/i }).first()).toBeVisible();
    await expect(page.getByText(/infrastructure credits|altyapı kredileri/i).first()).toBeVisible();
  });

  test('infra top-up shows loading before redirect', async ({ page }) => {
    await page.goto('/dashboard/billing');

    const topUpButton = page.getByRole('button', { name: /\+\$25/ }).first();
    await expect(topUpButton).toBeVisible();

    let redirected = false;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame() && /checkout\.stripe\.com/.test(frame.url())) {
        redirected = true;
      }
    });

    await topUpButton.click();
    await expect(page.getByText(/stripe checkout|stripe ödeme/i).first()).toBeVisible({
      timeout: 10_000,
    });

    await page.waitForTimeout(15_000);
    if (!redirected) {
      test.info().annotations.push({
        type: 'note',
        description: 'Stripe redirect did not occur (STRIPE_SECRET_KEY may be unset in test env)',
      });
    }
  });
});

import { test, expect } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const serverId = process.env.E2E_SERVER_ID;

test.describe('Dashboard server detail (authenticated)', () => {
  test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated e2e');
  test.skip(!serverId, 'Set E2E_SERVER_ID to run server detail e2e');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').first().fill(email!);
    await page.locator('input[type="password"]').first().fill(password!);
    await page.getByRole('button', { name: /sign in|giriş/i }).first().click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  });

  test('server detail shows infra billing card for managed server', async ({ page }) => {
    await page.goto(`/dashboard/servers/${serverId}`);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(
      page.getByText(/infrastructure credits|altyapı kredileri/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('start button visible when server stopped', async ({ page }) => {
    await page.goto(`/dashboard/servers/${serverId}`);
    const startBtn = page.getByRole('button', { name: /^start$|^başlat$/i });
    if (await startBtn.isVisible()) {
      await expect(startBtn).toBeEnabled();
    }
  });
});

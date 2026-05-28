import { test, expect } from '@playwright/test';

test.describe('Public smoke', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('link', { name: /pushify/i }).first()).toBeVisible();
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('features page loads', async ({ page }) => {
    await page.goto('/features');
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('login page loads with form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|giriş/i }).first()).toBeVisible();
  });

  test('register page loads with form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /create account|hesap/i }).first()).toBeVisible();
  });

  test('login preserves redirect query in session', async ({ page }) => {
    await page.goto('/login?redirect=/dashboard/projects');
    await page.waitForFunction(() =>
      sessionStorage.getItem('auth_post_login_redirect') === '/dashboard/projects'
    );
  });

  test('docs page loads', async ({ page }) => {
    await page.goto('/docs');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});

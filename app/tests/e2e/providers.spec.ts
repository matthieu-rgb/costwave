import { test, expect } from '@playwright/test';

test.describe('Phase 3 E2E', () => {
  test('user can access landing and signup page', async ({ page }) => {
    // Navigate to landing
    await page.goto('/en');
    await expect(page).toHaveTitle(/costwave/i);

    // Navigate to signup
    await page.goto('/en/signup');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#name')).toBeVisible();

    // Verify signup form is functional (inputs accept text)
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await expect(page.locator('#name')).toHaveValue('Test User');
    await expect(page.locator('#email')).toHaveValue('test@example.com');
  });
});

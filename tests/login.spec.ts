import { test, expect } from '@playwright/test';

test('has title and can login', async ({ page }) => {
    await page.goto('/login');

    // Expected title based on index.html: "Sinau Cafe Point of Sale System"
    await expect(page).toHaveTitle(/Sinau Cafe/i);

    await page.fill('#email', 'cashier.pusat@test.com');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');

    // Verify critical element on dashboard
    await expect(page.locator('text=Sinau Cafe').first()).toBeVisible();
});

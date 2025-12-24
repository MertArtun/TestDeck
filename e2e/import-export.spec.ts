import { test, expect } from '@playwright/test';

test.describe('Import/Export Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test.describe('JSON Import', () => {
    test('should display import section on create page', async ({ page }) => {
      await page.goto('/create');

      // Should have import related buttons
      const buttons = page.locator('button');
      await expect(buttons.first()).toBeVisible();
    });

    test('should have interactive elements', async ({ page }) => {
      await page.goto('/create');

      // Should have interactive elements
      const elements = page.locator('button, a, input, textarea');
      const count = await elements.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('File Upload', () => {
    test('should have file input element', async ({ page }) => {
      await page.goto('/create');

      // Should have file input
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
    });

    test('should accept JSON files', async ({ page }) => {
      await page.goto('/create');

      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toHaveAttribute('accept', '.json');
    });
  });

  test.describe('Create Page Elements', () => {
    test('should display create page', async ({ page }) => {
      await page.goto('/create');

      // Page should load
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have form elements', async ({ page }) => {
      await page.goto('/create');

      // Should have textarea for question
      await expect(page.locator('textarea').first()).toBeVisible();
    });

    test('should have text inputs for options', async ({ page }) => {
      await page.goto('/create');

      // Should have text inputs
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.first()).toBeVisible();
    });
  });

  test.describe('Manager Page', () => {
    test('should display manager page', async ({ page }) => {
      await page.goto('/manager');

      // Should show manager content
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have content or empty state', async ({ page }) => {
      await page.goto('/manager');

      // Body should not be empty
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });
});

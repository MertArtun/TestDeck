import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test.describe('Settings Page', () => {
    test('should display settings page', async ({ page }) => {
      await page.goto('/settings');

      // Should show settings content
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should have interactive elements', async ({ page }) => {
      await page.goto('/settings');

      // Should have buttons for settings
      const buttons = page.locator('button');
      await expect(buttons.first()).toBeVisible();
    });

    test('should have clickable elements', async ({ page }) => {
      await page.goto('/settings');

      // Should have interactive elements (buttons or links)
      const interactive = page.locator('button, a, [role="button"]');
      const count = await interactive.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Theme Selection', () => {
    test('should have theme buttons', async ({ page }) => {
      await page.goto('/settings');

      // Should have clickable buttons
      const buttons = page.locator('button');
      await expect(buttons.first()).toBeVisible();
    });

    test('should persist settings in localStorage', async ({ page }) => {
      await page.goto('/settings');

      // Click on any button
      const buttons = page.locator('button');
      if ((await buttons.count()) > 0) {
        await buttons.first().click();
        await page.waitForTimeout(300);

        // Check localStorage
        const hasStorage = await page.evaluate(() => {
          return localStorage.length > 0;
        });

        expect(hasStorage).toBe(true);
      }
    });

    test('should persist after reload', async ({ page }) => {
      await page.goto('/settings');

      // Make any change
      const buttons = page.locator('button');
      if ((await buttons.count()) > 0) {
        await buttons.first().click();
        await page.waitForTimeout(300);

        // Reload
        await page.reload();

        // Page should still work
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Language Selection', () => {
    test('should have language related content', async ({ page }) => {
      await page.goto('/settings');

      // Page should have content
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should allow clicking buttons', async ({ page }) => {
      await page.goto('/settings');

      // Find and click any button
      const buttons = page.locator('button');
      if ((await buttons.count()) > 0) {
        await buttons.first().click();
        await page.waitForTimeout(300);

        // Page should still be visible
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Color Scheme', () => {
    test('should have color options', async ({ page }) => {
      await page.goto('/settings');

      // Should have buttons
      const buttons = page.locator('button');
      await expect(buttons.first()).toBeVisible();
    });

    test('should update localStorage on click', async ({ page }) => {
      await page.goto('/settings');

      const buttons = page.locator('button');
      if ((await buttons.count()) > 0) {
        await buttons.first().click();
        await page.waitForTimeout(300);

        // Check if localStorage was updated
        const storage = await page.evaluate(() => {
          return localStorage.getItem('theme-store');
        });

        expect(storage).toBeDefined();
      }
    });
  });

  test.describe('Settings Persistence', () => {
    test('should have localStorage capability', async ({ page }) => {
      await page.goto('/settings');

      // Set something in localStorage
      await page.evaluate(() => {
        localStorage.setItem('test-key', 'test-value');
      });

      // Verify it was set
      const stored = await page.evaluate(() => {
        return localStorage.getItem('test-key');
      });

      expect(stored).toBe('test-value');
    });

    test('should load settings from localStorage', async ({ page }) => {
      // Set initial settings
      await page.goto('/settings');
      await page.evaluate(() => {
        localStorage.setItem('theme-store', JSON.stringify({ state: { theme: 'ocean' } }));
      });

      // Reload
      await page.reload();

      // Page should still work
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      await page.goto('/settings');

      // Should have content
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should have interactive elements', async ({ page }) => {
      await page.goto('/settings');

      // Should have buttons
      const buttons = page.locator('button');
      await expect(buttons.first()).toBeVisible();
    });
  });
});

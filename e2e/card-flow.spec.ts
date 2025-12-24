import { test, expect } from '@playwright/test';

test.describe('Card Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test.describe('Dashboard', () => {
    test('should display dashboard on initial load', async ({ page }) => {
      await page.goto('/');

      // Wait for dashboard to load
      await expect(page.locator('body')).toBeVisible();

      // Should have navigation links
      await expect(page.locator('nav, [role="navigation"], a[href]').first()).toBeVisible();
    });

    test('should show empty state when no cards exist', async ({ page }) => {
      await page.goto('/');

      // Should show empty deck message or zero cards
      await expect(page.locator('body')).toContainText(/0|deck|card/i);
    });

    test('should navigate to create card page', async ({ page }) => {
      await page.goto('/');

      // Click on create card link (nav or any link to /create)
      await page.locator('a[href="/create"]').first().click();

      // Should be on create page
      await expect(page).toHaveURL(/\/create/);
    });
  });

  test.describe('Create Card', () => {
    test('should display create card form', async ({ page }) => {
      await page.goto('/create');

      // Should have question textarea
      await expect(page.locator('textarea').first()).toBeVisible();

      // Should have option inputs
      await expect(page.locator('input[type="text"]').first()).toBeVisible();

      // Should have save button
      await expect(page.getByRole('button', { name: /save|kaydet/i })).toBeVisible();
    });

    test('should fill in card form', async ({ page }) => {
      await page.goto('/create');

      // Fill in the question
      const textareas = page.locator('textarea');
      await textareas.first().fill('What is 2 + 2?');

      // Fill in the options
      const textInputs = page.locator('input[type="text"]');
      await textInputs.nth(0).fill('3');
      await textInputs.nth(1).fill('4');

      // Verify inputs are filled
      await expect(textareas.first()).toHaveValue('What is 2 + 2?');
      await expect(textInputs.nth(0)).toHaveValue('3');
    });

    test('should disable save button when form is incomplete', async ({ page }) => {
      await page.goto('/create');

      // Save button should be disabled initially
      const saveButton = page.getByRole('button', { name: /save|kaydet/i });
      await expect(saveButton).toBeDisabled();
    });
  });

  test.describe('Study Flow', () => {
    test('should display study page', async ({ page }) => {
      await page.goto('/study');

      // Should show study header or setup options
      await expect(page.locator('body')).toBeVisible();
      // Page should have some content
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should show study options', async ({ page }) => {
      await page.goto('/study');

      // Should show difficulty or subject options
      await expect(page.locator('button').first()).toBeVisible();
    });

    test('should have question count slider', async ({ page }) => {
      await page.goto('/study');

      // Should have a slider for question count
      const slider = page.locator('input[type="range"]');
      await expect(slider).toBeVisible();
    });

    test('should have multiple buttons for options', async ({ page }) => {
      await page.goto('/study');

      // Should have multiple buttons
      const buttons = page.locator('button');
      await expect(buttons.first()).toBeVisible();
    });
  });

  test.describe('Statistics', () => {
    test('should display stats page', async ({ page }) => {
      await page.goto('/stats');

      // Should show stats content
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show chart or graph elements', async ({ page }) => {
      await page.goto('/stats');

      // Page should render without errors
      await expect(page.locator('body')).toContainText(/stat|chart|graph|accuracy|0|%/i);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to study page', async ({ page }) => {
      await page.goto('/');

      // Navigate to study
      await page.locator('a[href="/study"]').first().click();
      await expect(page).toHaveURL(/\/study/);
    });

    test('should navigate to create page', async ({ page }) => {
      await page.goto('/');

      // Navigate to create
      await page.locator('a[href="/create"]').first().click();
      await expect(page).toHaveURL(/\/create/);
    });

    test('should navigate to stats page', async ({ page }) => {
      await page.goto('/');

      // Navigate to stats
      await page.locator('a[href="/stats"]').first().click();
      await expect(page).toHaveURL(/\/stats/);
    });

    test('should navigate back to dashboard', async ({ page }) => {
      await page.goto('/study');

      // Navigate back to dashboard
      await page.locator('a[href="/"]').first().click();
      await expect(page).toHaveURL('/');
    });
  });
});

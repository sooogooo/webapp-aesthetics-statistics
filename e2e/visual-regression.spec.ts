import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Visual Regression Testing
 *
 * Captures screenshots of key pages and components to detect visual regressions.
 * Screenshots are stored in e2e/screenshots/ and compared on subsequent runs.
 *
 * Run with: npm run test:e2e:visual
 * Update baselines with: npm run test:e2e:visual:update
 */

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('homepage layout - desktop', async ({ page }) => {
    // Wait for content to fully load
    await page.waitForTimeout(2000);

    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('homepage layout - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Take screenshot
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('sidebar navigation - desktop', async ({ page }) => {
    // Focus on sidebar
    const sidebar = page.locator('[role="navigation"]').first();
    await sidebar.waitFor({ state: 'visible', timeout: 5000 });

    await expect(sidebar).toHaveScreenshot('sidebar-desktop.png', {
      animations: 'disabled',
    });
  });

  test('distribution chart - normal distribution', async ({ page }) => {
    // Click on normal distribution if available
    const normalDist = page.locator('text="正态分布"').first();

    if (await normalDist.isVisible({ timeout: 3000 }).catch(() => false)) {
      await normalDist.click();

      // Wait for chart to render
      await page.waitForTimeout(2000);

      // Find the chart container
      const chartContainer = page.locator('canvas, svg, [data-testid="chart"]').first();

      if (await chartContainer.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(chartContainer).toHaveScreenshot('chart-normal-distribution.png', {
          animations: 'disabled',
        });
      }
    }
  });

  test('learning paths section', async ({ page }) => {
    // Navigate to learning paths
    const learningPathsBtn = page.getByRole('button', { name: '学习路径' });

    if (await learningPathsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await learningPathsBtn.click();

      // Wait for content
      await page.waitForTimeout(2000);

      // Take screenshot
      await expect(page).toHaveScreenshot('learning-paths-section.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('A/B test calculator', async ({ page }) => {
    // Navigate to A/B test calculator
    const abTestBtn = page.getByRole('button', { name: 'A/B测试' });

    if (await abTestBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await abTestBtn.click();

      // Wait for calculator to load
      await page.waitForTimeout(2000);

      // Take screenshot
      await expect(page).toHaveScreenshot('ab-test-calculator.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('settings modal', async ({ page }) => {
    // Open settings if button exists
    const settingsBtn = page.locator('[aria-label*="设置"], button:has-text("设置")').first();

    if (await settingsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await settingsBtn.click();

      // Wait for modal
      await page.waitForTimeout(1000);

      // Take screenshot of modal
      const modal = page.locator('[role="dialog"]').first();

      if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(modal).toHaveScreenshot('settings-modal.png', {
          animations: 'disabled',
        });
      }
    }
  });

  test('dark mode theme', async ({ page }) => {
    // Try to find theme toggle
    const themeToggle = page
      .locator('[aria-label*="主题"], [aria-label*="dark"], button:has-text("主题")')
      .first();

    if (await themeToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Toggle to dark mode
      await themeToggle.click();
      await page.waitForTimeout(1000);

      // Take screenshot in dark mode
      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
});

test.describe('Component Visual Tests', () => {
  test('header component', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header').first();
    await expect(header).toHaveScreenshot('header-component.png', {
      animations: 'disabled',
    });
  });

  test('footer component', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer').first();

    if (await footer.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(footer).toHaveScreenshot('footer-component.png', {
        animations: 'disabled',
      });
    }
  });
});

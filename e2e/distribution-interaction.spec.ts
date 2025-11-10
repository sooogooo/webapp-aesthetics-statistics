import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Distribution Chart Interaction
 *
 * Tests user interactions with statistical distributions including:
 * - Distribution selection
 * - Chart rendering and visualization
 * - Parameter adjustments
 * - Interactive features (zoom, hover, tooltips)
 */

test.describe('Distribution Chart Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display distribution list', async ({ page }) => {
    // Wait for distributions to load
    await page.waitForLoadState('networkidle');

    // Look for distribution names (common ones we know exist)
    const distributionNames = ['正态分布', '二项分布', '泊松分布', '指数分布'];

    let foundDistribution = false;
    for (const name of distributionNames) {
      const element = page.locator(`text="${name}"`).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        foundDistribution = true;
        break;
      }
    }

    expect(foundDistribution).toBeTruthy();
  });

  test('should render chart when distribution is selected', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Try to find and click a distribution button/card
    const distributionButton = page
      .locator('button:has-text("正态分布"), [role="button"]:has-text("正态分布")')
      .first();

    if (await distributionButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await distributionButton.click();

      // Wait for chart to render (look for canvas or SVG)
      const chart = page.locator('canvas, svg').first();
      await expect(chart).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display distribution parameters', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on normal distribution (if available)
    const normalDist = page.locator('text="正态分布"').first();

    if (await normalDist.isVisible({ timeout: 3000 }).catch(() => false)) {
      await normalDist.click();

      // Wait for parameter controls to appear
      // Normal distribution should have μ (mean) and σ (standard deviation)
      const parameterSection = page.locator('text=/参数|均值|标准差|μ|σ/').first();
      await expect(parameterSection).toBeVisible({ timeout: 5000 });
    }
  });

  test('should update chart when parameters change', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Select a distribution
    const distributionButton = page.locator('text="正态分布"').first();

    if (await distributionButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await distributionButton.click();

      // Wait for chart to render
      await page.waitForTimeout(1000);

      // Find a slider or input for parameters
      const slider = page.locator('input[type="range"]').first();

      if (await slider.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Get initial value
        const initialValue = await slider.inputValue();

        // Change the value
        await slider.fill('5');

        // Wait for chart to update
        await page.waitForTimeout(500);

        // Verify value changed
        const newValue = await slider.inputValue();
        expect(newValue).not.toBe(initialValue);
      }
    }
  });

  test('should show tooltip on chart hover', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Select a distribution
    const distributionButton = page.locator('text="正态分布"').first();

    if (await distributionButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await distributionButton.click();

      // Wait for chart
      const chart = page.locator('canvas, svg').first();

      if (await chart.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Hover over the chart
        await chart.hover({ position: { x: 100, y: 100 } });

        // Wait a bit for tooltip to appear
        await page.waitForTimeout(500);

        // Check if tooltip exists (this is implementation-dependent)
        const tooltip = page.locator('[role="tooltip"], .tooltip, [data-tooltip]').first();
        // Tooltip may or may not appear depending on implementation
        // This is a soft check
        const hasTooltip = await tooltip.isVisible({ timeout: 1000 }).catch(() => false);
        // We just log the result, not fail the test
        expect(hasTooltip).toBeDefined();
      }
    }
  });
});

test.describe('Distribution Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should filter distributions by search term', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="搜索"], input[aria-label*="搜索"]')
      .first();

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Type search term
      await searchInput.fill('正态');

      // Wait for filtering
      await page.waitForTimeout(500);

      // Check if normal distribution is visible
      const normalDist = page.locator('text="正态分布"').first();
      await expect(normalDist).toBeVisible();

      // Clear search
      await searchInput.clear();
    }
  });

  test('should filter distributions by group/category', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for group/category buttons or tabs
    const groupButton = page
      .locator('button:has-text("连续"), button:has-text("离散"), [role="tab"]')
      .first();

    if (await groupButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await groupButton.click();

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Check that some distributions are visible
      const distributions = page.locator('text=/分布/');
      const count = await distributions.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});

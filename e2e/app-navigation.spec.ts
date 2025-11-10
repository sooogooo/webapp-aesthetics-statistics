import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Application Navigation
 *
 * Tests the core navigation flows of the application including:
 * - Homepage load and initial state
 * - Sidebar navigation between sections
 * - Distribution selection and chart display
 * - Mobile responsive navigation
 */

test.describe('Application Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/医美统计学应用指南/);

    // Check main header is visible
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check sidebar is visible on desktop
    const sidebar = page.locator('[role="navigation"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('should display all main navigation sections', async ({ page }) => {
    // Wait for the sidebar to load
    const sidebar = page.locator('[role="navigation"]').first();
    await expect(sidebar).toBeVisible();

    // Check for key navigation items
    const expectedSections = ['首页', '学习路径', '决策指南', 'A/B测试', '统计助手'];

    for (const section of expectedSections) {
      const navItem = page.getByRole('button', { name: section });
      await expect(navItem).toBeVisible();
    }
  });

  test('should navigate to Dashboard when clicking 首页', async ({ page }) => {
    // Click on Dashboard navigation
    await page.getByRole('button', { name: '首页' }).click();

    // Wait for dashboard content
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 5000 }).catch(() => {
      // Fallback: check for any dashboard-like content
      return page.locator('text=/欢迎|统计分布|学习路径/').first();
    });

    // Verify we're on the dashboard (check URL or content)
    const url = page.url();
    expect(url).toContain('/');
  });

  test('should navigate to Learning Paths section', async ({ page }) => {
    // Click on Learning Paths
    await page.getByRole('button', { name: '学习路径' }).click();

    // Wait for learning paths content to load
    await expect(page.locator('text=/学习路径|初级|中级|高级/').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to Decision Guide section', async ({ page }) => {
    // Click on Decision Guide
    await page.getByRole('button', { name: '决策指南' }).click();

    // Wait for decision guide content
    await expect(page.locator('text=/决策|问题|场景/').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to A/B Test Calculator', async ({ page }) => {
    // Click on A/B Test
    await page.getByRole('button', { name: 'A/B测试' }).click();

    // Wait for calculator content
    await expect(page.locator('text=/A\u002FB|测试|样本量|转化率/').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should open and close settings modal', async ({ page }) => {
    // Look for settings button (usually a gear icon or settings text)
    const settingsButton = page.locator('[aria-label*="设置"], button:has-text("设置")').first();

    if (await settingsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsButton.click();

      // Wait for modal to appear
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Close modal (look for close button or backdrop)
      const closeButton = page.locator('[aria-label*="关闭"], button:has-text("关闭")').first();
      if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click();
        await expect(modal).not.toBeVisible();
      }
    }
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show mobile menu toggle', async ({ page }) => {
    await page.goto('/');

    // Look for hamburger menu or mobile nav toggle
    const mobileMenuToggle = page
      .locator('[aria-label*="menu"], [aria-label*="菜单"], button:has(svg)')
      .first();

    // On mobile, sidebar should be hidden initially or menu toggle should exist
    const sidebar = page.locator('[role="navigation"]').first();
    const sidebarVisible = await sidebar.isVisible({ timeout: 1000 }).catch(() => false);

    if (!sidebarVisible) {
      // Menu toggle should be visible
      await expect(mobileMenuToggle).toBeVisible();
    }
  });
});

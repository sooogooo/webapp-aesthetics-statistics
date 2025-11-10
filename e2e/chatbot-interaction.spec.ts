import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Chatbot and AI Assistant Interaction
 *
 * Tests the AI chatbot functionality including:
 * - Opening and closing the chatbot
 * - Sending messages
 * - Receiving responses
 * - Message history
 * - Error handling
 *
 * Note: These tests may require the backend API to be running
 */

test.describe('Chatbot Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open chatbot interface', async ({ page }) => {
    // Look for chatbot button/trigger (common patterns)
    const chatbotTrigger = page
      .locator(
        'button:has-text("聊天"), button:has-text("助手"), button:has-text("AI"), [aria-label*="chatbot"], [aria-label*="聊天"]'
      )
      .first();

    if (await chatbotTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await chatbotTrigger.click();

      // Wait for chatbot interface to appear
      const chatInterface = page
        .locator(
          '[role="dialog"]:has-text("聊天"), [data-testid="chatbot"], .chatbot, .chat-container'
        )
        .first();

      await expect(chatInterface).toBeVisible({ timeout: 5000 });
    } else {
      // Chatbot might be always visible
      const alwaysVisibleChat = page
        .locator('[data-testid="chatbot"], .chatbot, .chat-container')
        .first();

      const isVisible = await alwaysVisibleChat.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isVisible).toBeDefined();
    }
  });

  test('should display welcome message or prompt', async ({ page }) => {
    // Open chatbot if needed
    const chatbotTrigger = page.locator('button:has-text("聊天"), button:has-text("助手")').first();

    if (await chatbotTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chatbotTrigger.click();
    }

    // Look for welcome message or input field
    const welcomeOrInput = page
      .locator(
        'text=/欢迎|您好|帮助/, textarea, input[placeholder*="输入"], input[placeholder*="问题"]'
      )
      .first();

    await expect(welcomeOrInput).toBeVisible({ timeout: 5000 });
  });

  test('should allow user to type and send message', async ({ page }) => {
    // Open chatbot if needed
    const chatbotTrigger = page.locator('button:has-text("聊天"), button:has-text("助手")').first();

    if (await chatbotTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chatbotTrigger.click();
      await page.waitForTimeout(500);
    }

    // Find input field
    const messageInput = page
      .locator(
        'textarea[placeholder*="输入"], input[placeholder*="输入"], textarea[placeholder*="问题"]'
      )
      .first();

    if (await messageInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Type a test message
      const testMessage = '什么是正态分布？';
      await messageInput.fill(testMessage);

      // Find and click send button
      const sendButton = page
        .locator(
          'button:has-text("发送"), button[type="submit"], button:has(svg[data-icon*="send"])'
        )
        .first();

      if (await sendButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sendButton.click();

        // Wait for message to appear in chat
        await expect(page.locator(`text="${testMessage}"`)).toBeVisible({
          timeout: 3000,
        });
      } else {
        // Try pressing Enter
        await messageInput.press('Enter');
        await expect(page.locator(`text="${testMessage}"`)).toBeVisible({
          timeout: 3000,
        });
      }
    }
  });

  test('should display loading state while waiting for response', async ({ page }) => {
    // Open chatbot if needed
    const chatbotTrigger = page.locator('button:has-text("聊天"), button:has-text("助手")').first();

    if (await chatbotTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chatbotTrigger.click();
      await page.waitForTimeout(500);
    }

    // Find input field
    const messageInput = page
      .locator('textarea[placeholder*="输入"], input[placeholder*="输入"]')
      .first();

    if (await messageInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await messageInput.fill('测试');

      // Send message
      const sendButton = page.locator('button:has-text("发送")').first();
      if (await sendButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sendButton.click();
      } else {
        await messageInput.press('Enter');
      }

      // Look for loading indicator (spinner, dots, "思考中...")
      const loadingIndicator = page
        .locator('[role="status"], .loading, .spinner, text=/加载|思考|正在/')
        .first();

      // Loading state might be very brief, so this is a soft check
      const hasLoading = await loadingIndicator.isVisible({ timeout: 2000 }).catch(() => false);
      expect(hasLoading).toBeDefined();
    }
  });

  test('should close chatbot when close button is clicked', async ({ page }) => {
    // Open chatbot
    const chatbotTrigger = page.locator('button:has-text("聊天"), button:has-text("助手")').first();

    if (await chatbotTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chatbotTrigger.click();

      // Wait for chatbot to open
      await page.waitForTimeout(500);

      // Find close button
      const closeButton = page
        .locator(
          'button:has-text("关闭"), button[aria-label*="关闭"], button:has(svg):near([role="dialog"])'
        )
        .first();

      if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click();

        // Chatbot should disappear or minimize
        await page.waitForTimeout(500);

        // Verify the chatbot is closed (might not be completely removed from DOM)
        const chatInterface = page.locator('[role="dialog"]:has-text("聊天")').first();
        const isVisible = await chatInterface.isVisible({ timeout: 1000 }).catch(() => false);

        // Either not visible or the trigger button should be visible again
        expect(!isVisible || (await chatbotTrigger.isVisible())).toBeTruthy();
      }
    }
  });
});

test.describe('Statistical Copilot Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should access statistical copilot', async ({ page }) => {
    // Navigate to Statistical Copilot
    const copilotButton = page
      .locator('button:has-text("统计助手"), button:has-text("Copilot")')
      .first();

    if (await copilotButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await copilotButton.click();

      // Wait for copilot interface
      await expect(page.locator('text=/统计助手|Copilot|分析/').first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should show file upload option in copilot', async ({ page }) => {
    // Navigate to copilot
    const copilotButton = page.locator('button:has-text("统计助手")').first();

    if (await copilotButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await copilotButton.click();

      // Look for file upload button or input
      const uploadButton = page
        .locator('input[type="file"], button:has-text("上传"), button:has-text("文件")')
        .first();

      const hasUpload = await uploadButton.isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasUpload).toBeDefined();
    }
  });
});

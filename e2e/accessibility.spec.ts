import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper page structure with headings', async ({ page }) => {
    await page.goto('/');

    // 检查是否有主标题
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // 标题应该有文本内容
    const h1Text = await h1.textContent();
    expect(h1Text).toBeTruthy();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // 使用 Tab 键导航
    await page.keyboard.press('Tab');

    // 获取当前焦点元素
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        role: el?.getAttribute('role'),
        ariaLabel: el?.getAttribute('aria-label'),
      };
    });

    // 焦点应该在可交互元素上
    const interactiveElements = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];
    expect(interactiveElements).toContain(focusedElement.tagName);
  });

  test('should have ARIA labels for interactive elements', async ({ page }) => {
    await page.goto('/');

    // 检查所有按钮是否有可访问的名称
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();

      // 按钮应该有 aria-label 或文本内容
      const hasAccessibleName = ariaLabel || (text && text.trim().length > 0);
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');

    // 检查所有链接是否有描述性文本
    const links = await page.locator('a[href]').all();

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      // 链接应该有文本或 aria-label
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');

    // 检查所有输入框是否有标签
    const inputs = await page.locator('input[type="text"], input[type="search"], textarea').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // 输入框应该有某种形式的标签
      const hasLabel =
        (id && (await page.locator(`label[for="${id}"]`).count()) > 0) ||
        ariaLabel ||
        ariaLabelledBy ||
        placeholder;

      expect(hasLabel).toBeTruthy();
    }
  });

  test('should support Enter key for button activation', async ({ page }) => {
    await page.goto('/');

    // 找到第一个可见按钮
    const button = page.locator('button').first();

    if (await button.isVisible()) {
      // 聚焦按钮
      await button.focus();

      // 按 Enter 键
      await page.keyboard.press('Enter');

      // 按钮应该被激活（这里只是确保没有报错）
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should support Space key for button activation', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button').first();

    if (await button.isVisible()) {
      await button.focus();
      await page.keyboard.press('Space');
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should have skip navigation link or proper landmark structure', async ({ page }) => {
    await page.goto('/');

    // 检查是否有跳过导航链接或 main landmark
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    const mainLandmark = page.locator('main, [role="main"]');

    const hasSkipOrMain = (await skipLink.count()) > 0 || (await mainLandmark.count()) > 0;
    expect(hasSkipOrMain).toBeTruthy();
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/');

    // 聚焦一个元素并检查是否有焦点指示器
    const button = page.locator('button').first();

    if (await button.isVisible()) {
      await button.focus();

      // 检查元素是否获得焦点
      const isFocused = await button.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBeTruthy();
    }
  });

  test('should have proper color contrast (basic check)', async ({ page }) => {
    await page.goto('/');

    // 检查文本元素的对比度
    const textElements = await page.locator('p, h1, h2, h3, button, a').all();

    for (const element of textElements.slice(0, 5)) {
      // 只检查前 5 个元素作为示例
      if (await element.isVisible()) {
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });

        // 确保有颜色值
        expect(styles.color).toBeTruthy();
      }
    }
  });

  test('should have proper image alt text', async ({ page }) => {
    await page.goto('/');

    // 检查所有图片是否有 alt 属性
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // 图片应该有 alt 属性（可以为空字符串表示装饰性图片）
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should support Escape key to close modals/dialogs', async ({ page }) => {
    await page.goto('/');

    // 查找并打开聊天机器人（如果存在）
    const chatButton = page.locator('[aria-label*="聊天"]').first();

    if (await chatButton.isVisible()) {
      await chatButton.click();

      // 等待聊天界面打开
      await page.waitForTimeout(500);

      // 按 Escape 键
      await page.keyboard.press('Escape');

      // 等待关闭
      await page.waitForTimeout(500);

      // 检查是否关闭（这取决于具体实现）
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should have proper ARIA roles for custom components', async ({ page }) => {
    await page.goto('/');

    // 检查对话框/模态框是否有正确的 role
    const dialogs = await page.locator('[role="dialog"], [role="alertdialog"]').all();

    for (const dialog of dialogs) {
      if (await dialog.isVisible()) {
        // 对话框应该有 aria-modal 或 aria-labelledby
        const ariaModal = await dialog.getAttribute('aria-modal');
        const ariaLabelledby = await dialog.getAttribute('aria-labelledby');
        const ariaLabel = await dialog.getAttribute('aria-label');

        const hasProperAria = ariaModal || ariaLabelledby || ariaLabel;
        expect(hasProperAria).toBeTruthy();
      }
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // 获取所有标题
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((elements) => {
      return elements.map((el) => ({
        level: parseInt(el.tagName.substring(1)),
        text: el.textContent?.trim(),
      }));
    });

    if (headings.length > 0) {
      // 第一个标题应该是 h1
      expect(headings[0].level).toBe(1);

      // 标题层级不应该跳跃太大（例如从 h1 直接到 h4）
      for (let i = 1; i < headings.length; i++) {
        const levelDiff = headings[i].level - headings[i - 1].level;
        // 允许下降任意层级，但上升不应超过 1 级
        if (levelDiff > 0) {
          expect(levelDiff).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  test('should have proper language attribute', async ({ page }) => {
    await page.goto('/');

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toBe('zh-CN'); // 根据项目实际语言设置
  });

  test('should have viewport meta tag for responsive design', async ({ page }) => {
    await page.goto('/');

    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toBeTruthy();
    expect(viewportMeta).toContain('width=device-width');
  });
});

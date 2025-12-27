# 项目优化 TODO List

**更新日期**: 2025-12-27
**当前状态**: 代码质量优秀，测试覆盖达标
**整体完成度**: 95%

---

## 📊 当前项目健康度

| 维度                   | 评分 | 状态                       | 目标         |
| ---------------------- | ---- | -------------------------- | ------------ |
| 🔒 安全性              | A-   | 4 个低风险漏洞（开发依赖） | A (接受现状) |
| 📝 代码质量            | A    | 0 错误, 1 警告             | A+ (0 警告)  |
| ⚛️ React 合规性        | A+   | 0 警告                     | A+           |
| 🎯 TypeScript 类型安全 | A+   | 0 any 类型                 | A+           |
| 🧪 测试覆盖率          | A    | 89.65% 分支覆盖            | A+ (90%+)    |
| 📦 依赖健康度          | B    | 7 个过时依赖               | A (< 3 个)   |
| ⚡ 构建性能            | A    | 13.28s                     | A            |

**总体评分**: A (目标 A+)

---

## 🎯 优化任务分类

### ✅ 已完成 (Phase 1-6)

- ✅ P0 紧急修复：Dashboard useState, Sidebar 组件创建, useMemo 不纯函数
- ✅ P1 高优先级：React Hooks 合规性, TypeScript any 类型消除
- ✅ 测试覆盖率提升：75.86% → 89.65%
- ✅ 代码质量提升：102 个问题 → 1 个警告

---

## 🔥 P0 - 立即处理（本周）

### 1. 清理未使用的导入

**优先级**: 🔴 P0
**预计时间**: 2 分钟
**影响**: 低 - 代码整洁度

**问题**:

```typescript
// hooks/useLocalStorage.test.ts:2
import { renderHook, act, waitFor } from '@testing-library/react';
// ❌ waitFor 未使用
```

**修复**:

```typescript
import { renderHook, act } from '@testing-library/react';
```

**文件**: `hooks/useLocalStorage.test.ts:2`

---

## 🟡 P1 - 高优先级（本月）

### 2. 依赖更新 - Patch 版本（安全）

**优先级**: 🟠 P1
**预计时间**: 15 分钟
**风险**: 低
**影响**: 安全和 bug 修复

**推荐更新**:

```bash
# Patch 版本更新（低风险）
npm update @typescript-eslint/eslint-plugin  # 8.50.0 → 8.50.1
npm update @typescript-eslint/parser         # 8.50.0 → 8.50.1
```

**验证步骤**:

```bash
npm update
npm run test:run    # 确保测试通过
npm run build       # 确保构建成功
npm run lint        # 确保无新增警告
```

**收益**: 获取最新 bug 修复和小改进

---

### 3. 测试覆盖率最后冲刺（89.65% → 90%+）

**优先级**: 🟠 P1
**预计时间**: 2-3 小时
**影响**: 中 - 代码可靠性

**目标**: 分支覆盖率 89.65% → 90%+

**策略 A: 改进现有测试**

- `hooks/useLocalStorage.ts` - 补充边缘用例
  - 测试 window.addEventListener/removeEventListener 分支
  - 测试多标签页同步场景

**策略 B: 新增组件测试**（可选）

1. `components/Dashboard.test.tsx`
   - KPI 数据计算逻辑
   - 模型推荐算法
   - 导航交互

2. `components/DistributionChart.test.tsx`
   - 图表交互逻辑
   - 场景切换
   - 参数更新

**验收标准**:

- [ ] 分支覆盖率 ≥ 90%
- [ ] 语句覆盖率保持 > 92%
- [ ] 所有新测试通过

**注意**: 这是可选优化，当前 89.65% 已达标

---

### 4. 脚本文件 ESLint 配置优化

**优先级**: 🟠 P1
**预计时间**: 10 分钟
**影响**: 低 - 消除警告

**问题**:

```
ESLintEnvWarning: /* eslint-env */ comments are no longer recognized
with flat config and will be reported as errors as of v10.0.0
Found in scripts/split-distributions.js
```

**解决方案 A**: 使用 TypeScript 重写

```bash
mv scripts/split-distributions.js scripts/split-distributions.ts
# 添加适当的类型定义
```

**解决方案 B**: 使用 /_ global _/ 注释

```javascript
// scripts/split-distributions.js
/* global process, console, require, __dirname */
```

**解决方案 C**: 在 eslint.config.js 中配置

```javascript
// 为 scripts/ 目录添加 Node.js globals
{
  files: ['scripts/**/*.js'],
  languageOptions: {
    globals: {
      ...require('globals').node
    }
  }
}
```

**推荐**: 解决方案 C（最符合 ESLint 9 扁平配置规范）

---

## 🟢 P2 - 中优先级（本季度）

### 5. 依赖更新 - Minor 版本

**优先级**: 🟡 P2
**预计时间**: 1 小时
**风险**: 低-中
**影响**: 功能改进和性能提升

**推荐更新**:

```bash
# Minor 版本更新（低-中风险）
npm install -D typescript@5.9.3              # 5.8.3 → 5.9.3
```

**测试清单**:

- [ ] `npm run lint` - 检查类型错误
- [ ] `npm run test:run` - 所有测试通过
- [ ] `npm run build` - 构建成功
- [ ] 手动测试关键功能

**收益**: 获取 TypeScript 5.9 的新特性和性能改进

---

### 6. 依赖更新 - Major 版本（谨慎）

**优先级**: 🟡 P2
**预计时间**: 4-8 小时
**风险**: 高
**影响**: 重要功能更新

#### 6.1 @google/genai: 0.14.0 → 1.34.0 ⭐ 重要

**破坏性变更可能性**: 🔴 高
**影响范围**:

- `components/Chatbot.tsx`
- `components/StatisticalCopilot.tsx`
- `components/AiDesigner.tsx`
- `api/index.js`

**实施步骤**:

1. 阅读 [发布说明](https://github.com/google/generative-ai-js/releases)
2. 检查 API 变更和破坏性变更
3. 创建新分支进行更新
4. 更新代码适配新 API
5. 全面测试所有 AI 功能：
   - [ ] Chatbot 对话功能
   - [ ] Statistical Copilot 文件分析
   - [ ] AI Designer 图像生成
   - [ ] 错误处理和降级
6. 检查后端 API 兼容性
7. 性能对比测试

**回滚计划**: 如遇到严重问题，使用 `npm install @google/genai@0.14.0` 回滚

---

#### 6.2 Vite: 6.4.1 → 7.3.0 ⭐ 重要

**破坏性变更可能性**: 🟠 中高
**影响范围**: 构建配置和开发体验

**实施步骤**:

1. 阅读 [Vite 7 迁移指南](https://vitejs.dev/guide/migration.html)
2. 检查 `vite.config.ts` 是否需要更新
3. 创建新分支进行更新
4. 验证所有构建功能：
   - [ ] `npm run dev` - 开发服务器正常
   - [ ] HMR (Hot Module Replacement) 工作
   - [ ] `npm run build` - 生产构建成功
   - [ ] `npm run preview` - 预览正常
   - [ ] Bundle 分析 (`npm run build:analyze`)
5. 性能对比：
   - [ ] 构建时间
   - [ ] Bundle 大小
   - [ ] 开发服务器启动速度

**预期收益**: Vite 7 带来更快的构建速度和更好的优化

---

#### 6.3 react-markdown: 9.1.0 → 10.1.0

**破坏性变更可能性**: 🟠 中
**影响范围**: `components/IntelligentArticle.tsx`

**实施步骤**:

1. 阅读 [变更日志](https://github.com/remarkjs/react-markdown/releases)
2. 更新依赖
3. 测试所有 Markdown 渲染功能
4. 检查样式和格式是否正确

---

#### 6.4 @types/node: 22.19.3 → 25.0.3

**破坏性变更可能性**: 🟡 低-中
**影响范围**: TypeScript 类型定义

**注意**: 这可能需要 Node.js 版本升级
**建议**: 等待 Node.js 环境升级后再更新

---

### 7. 性能优化 - Bundle 大小优化

**优先级**: 🟡 P2
**预计时间**: 4-6 小时
**影响**: 中 - 加载性能

**当前状态**:

```
chart-vendor: 171.55 kB (gzip: 59.95 kB)  - 可优化
markdown-vendor: 117.71 kB (gzip: 36.22 kB) - 可优化
index: 224.44 kB (gzip: 70.08 kB) - 可优化
```

**优化策略**:

#### 7.1 Chart.js Tree-shaking

```typescript
// 当前（components/DistributionChart.tsx）
import { Chart } from 'chart.js/auto'; // ❌ 导入所有

// 优化后
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'; // ✅ 按需导入

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);
```

**预期收益**: chart-vendor 减少 20-30%

---

#### 7.2 代码分割优化

```typescript
// vite.config.ts - 优化 manualChunks
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'chart-vendor': ['chart.js', 'react-chartjs-2'],
  'markdown-vendor': ['react-markdown'],

  // 新增：分离 Google Gemini SDK
  'gemini-vendor': ['@google/genai'],

  // 新增：按路由分割
  'dashboard': ['./components/Dashboard'],
  'copilot': ['./components/StatisticalCopilot'],
  'designer': ['./components/AiDesigner'],
}
```

---

#### 7.3 使用 lazy loading

```typescript
// App.tsx - 路由级别懒加载
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const StatisticalCopilot = lazy(() => import('./components/StatisticalCopilot'));
const AiDesigner = lazy(() => import('./components/AiDesigner'));
const ContentDisplay = lazy(() => import('./components/ContentDisplay'));

// 使用 Suspense 包裹
<Suspense fallback={<LoadingSpinner />}>
  {currentPage === 'dashboard' && <Dashboard />}
</Suspense>
```

**预期收益**:

- 初始加载减少 40-50%
- 首屏时间 < 1.5s
- Lighthouse Performance > 90

---

### 8. E2E 测试扩展

**优先级**: 🟡 P2
**预计时间**: 6-8 小时
**影响**: 高 - 端到端质量保证

**当前状态**: 已有 34+ Playwright 测试

**扩展场景**:

#### 8.1 错误场景测试

```typescript
// e2e/error-handling.spec.ts
test('handles API failures gracefully', async ({ page }) => {
  // Mock API 失败
  await page.route('**/api/chat', (route) => route.abort());

  await page.goto('/');
  await page.click('[aria-label="打开聊天机器人"]');
  await page.fill('textarea', 'Hello');
  await page.click('button:has-text("发送")');

  // 验证错误提示
  await expect(page.locator('.error-message')).toBeVisible();
});

test('handles network timeout', async ({ page }) => {
  await page.route('**/api/*', (route) => route.abort('timedout'));
  // 测试超时处理...
});
```

---

#### 8.2 无障碍测试

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';

test('keyboard navigation works', async ({ page }) => {
  await page.goto('/');

  // Tab 导航
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('aria-label');

  // Enter 激活
  await page.keyboard.press('Enter');
  // 验证导航...
});

test('has proper ARIA labels', async ({ page }) => {
  await page.goto('/');

  const buttons = page.locator('button');
  for (const button of await buttons.all()) {
    const label = await button.getAttribute('aria-label');
    const text = await button.textContent();
    expect(label || text).toBeTruthy();
  }
});
```

---

#### 8.3 跨浏览器测试

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

**验收标准**:

- [ ] 错误场景测试覆盖 API 失败、网络超时、无效输入
- [ ] 键盘导航测试通过
- [ ] 所有交互元素有 ARIA 标签
- [ ] 跨浏览器测试通过（Chrome, Firefox, Safari）

---

### 9. API 后端优化

**优先级**: 🟡 P2
**预计时间**: 4-5 小时
**影响**: 中 - 安全和质量

**当前问题**:

- `api/` 目录缺少 `package-lock.json`
- 缺少后端测试
- 缺少输入验证
- 缺少日志系统

**改进清单**:

#### 9.1 生成 package-lock.json

```bash
cd api
npm install --package-lock-only
git add package-lock.json
```

---

#### 9.2 添加输入验证

```javascript
// api/index.js - 使用 Joi 验证
const Joi = require('joi');

const chatSchema = Joi.object({
  message: Joi.string().required().max(2000),
  systemInstruction: Joi.string().optional().max(500),
});

app.post('/api/chat', async (req, res) => {
  const { error } = chatSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  // 处理请求...
});
```

---

#### 9.3 添加结构化日志

```javascript
// api/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
```

---

#### 9.4 添加健康检查端点

```javascript
// api/index.js
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});
```

---

#### 9.5 添加后端测试

```javascript
// api/index.test.js
const request = require('supertest');
const app = require('./index');

describe('POST /api/chat', () => {
  it('should return AI response', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'Hello' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('text');
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/chat').send({ message: '' });

    expect(res.statusCode).toBe(400);
  });
});
```

**依赖安装**:

```bash
cd api
npm install --save-dev jest supertest
npm install joi winston
```

---

## 🔵 P3 - 低优先级（长期）

### 10. 性能监控和分析

**优先级**: 🟢 P3
**预计时间**: 6-8 小时
**影响**: 中 - 生产环境可观测性

**实施方案**:

#### 10.1 Web Vitals 监控

```bash
npm install web-vitals
```

```typescript
// src/reportWebVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
}

// 在 main.tsx 中使用
reportWebVitals((metric) => {
  console.log(metric);
  // 可选：发送到分析服务
});
```

---

#### 10.2 错误追踪（Sentry）

```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

#### 10.3 性能分析（Google Analytics 4）

```typescript
// src/analytics.ts
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('YOUR_GA_MEASUREMENT_ID');
};

export const logPageView = (page: string) => {
  ReactGA.send({ hitType: 'pageview', page });
};

export const logEvent = (category: string, action: string) => {
  ReactGA.event({ category, action });
};
```

**目标指标**:

- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
- TTFB (Time to First Byte) < 600ms

---

### 11. PWA 实现（渐进式 Web 应用）

**优先级**: 🟢 P3
**预计时间**: 8-10 小时
**影响**: 高 - 用户体验

**功能规划**:

#### 11.1 Service Worker

```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: '美学统计洞察',
        short_name: '统计洞察',
        description: '概率分布与医美行业应用教育平台',
        theme_color: '#10b981',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
});
```

---

#### 11.2 离线功能

```typescript
// src/hooks/useOfflineDetection.ts
import { useState, useEffect } from 'react';

export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

**验收标准**:

- [ ] PWA Lighthouse 得分 > 90
- [ ] 可安装到主屏幕
- [ ] 基本离线功能可用
- [ ] Service Worker 正确缓存静态资源

---

### 12. 无障碍性（A11y）增强

**优先级**: 🟢 P3
**预计时间**: 6-8 小时
**影响**: 高 - 包容性和合规性

**改进清单**:

#### 12.1 添加 ESLint a11y 插件

```bash
npm install -D eslint-plugin-jsx-a11y
```

```javascript
// eslint.config.js
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];
```

---

#### 12.2 ARIA 属性改进

```typescript
// 示例：改进 Chatbot 按钮
<button
  aria-label="打开 AI 聊天助手"
  aria-expanded={isOpen}
  aria-controls="chatbot-panel"
  aria-haspopup="dialog"
  onClick={toggleChatbot}
>
  <span className="material-symbols-outlined" aria-hidden="true">
    chat
  </span>
</button>

// 聊天面板
<div
  id="chatbot-panel"
  role="dialog"
  aria-modal="true"
  aria-labelledby="chatbot-title"
>
  <h2 id="chatbot-title">AI 聊天助手</h2>
  {/* 内容 */}
</div>
```

---

#### 12.3 键盘导航

```typescript
// 添加键盘快捷键
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl/Cmd + K: 打开聊天
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleChatbot();
    }

    // Esc: 关闭聊天
    if (e.key === 'Escape' && isOpen) {
      toggleChatbot();
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [isOpen]);
```

---

#### 12.4 颜色对比度检查

```bash
# 使用工具检查对比度
npm install -D @axe-core/playwright
```

```typescript
// e2e/accessibility.spec.ts
import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

**目标**:

- [ ] Lighthouse Accessibility > 95
- [ ] WCAG 2.1 AA 合规
- [ ] 所有交互元素键盘可访问
- [ ] 颜色对比度 ≥ 4.5:1

---

### 13. 国际化（i18n）准备

**优先级**: 🟢 P3
**预计时间**: 10-15 小时
**影响**: 高 - 全球化能力

**实施方案**:

#### 13.1 安装 i18n 库

```bash
npm install react-i18next i18next
```

---

#### 13.2 配置

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS },
    },
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

---

#### 13.3 使用示例

```typescript
// components/Dashboard.tsx
import { useTranslation } from 'react-i18next';

export function Dashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.description')}</p>
    </div>
  );
}
```

```json
// src/i18n/locales/zh-CN.json
{
  "dashboard": {
    "title": "决策仪表盘",
    "description": "选择适合您项目的概率分布模型"
  }
}
```

```json
// src/i18n/locales/en-US.json
{
  "dashboard": {
    "title": "Decision Dashboard",
    "description": "Choose the right probability distribution for your project"
  }
}
```

**需要翻译的内容**:

- [ ] UI 文本（按钮、标签、提示）
- [ ] 错误消息
- [ ] 表单验证消息
- [ ] 帮助文档
- [ ] 数据内容（可选，工作量大）

---

### 14. 文档完善

**优先级**: 🟢 P3
**预计时间**: 4-6 小时
**影响**: 中 - 开发者体验

**需要添加的文档**:

#### 14.1 API 文档

```markdown
## docs/API.md

# API 文档

## 环境变量

### 前端 (.env.local)

- `VITE_API_URL`: 后端 API 地址（开发环境: http://localhost:3001）

### 后端 (api/.env)

- `GEMINI_API_KEY`: Google Gemini API 密钥
- `PORT`: 服务端口（默认: 3001）
- `NODE_ENV`: 环境（development/production）

## API 端点

### POST /api/chat

聊天消息接口

**请求体**:
\`\`\`json
{
"message": "string (required, max 2000)",
"systemInstruction": "string (optional, max 500)"
}
\`\`\`

**响应**:
\`\`\`json
{
"text": "AI response text",
"timestamp": 1234567890
}
\`\`\`
```

---

#### 14.2 组件文档

````typescript
/**
 * Dashboard 组件
 *
 * 主仪表盘页面，显示所有概率分布模型的分类和概览
 *
 * @component
 * @example
 * ```tsx
 * <Dashboard
 *   distributions={distributionsData}
 *   setCurrentPage={handlePageChange}
 *   setSelectedId={handleSelectModel}
 * />
 * ```
 *
 * @param {Distribution[]} distributions - 分布模型数据数组
 * @param {(page: Page) => void} setCurrentPage - 页面切换回调
 * @param {(id: number) => void} setSelectedId - 模型选择回调
 */
export function Dashboard({ distributions, setCurrentPage, setSelectedId }: DashboardProps) {
  // ...
}
````

---

#### 14.3 架构决策记录（ADR）

```markdown
## docs/architecture/ADR-001-vite-build-tool.md

# ADR 001: 使用 Vite 作为构建工具

## 状态

已接受

## 上下文

项目需要快速的开发体验和优化的生产构建。考虑了 Create React App、Webpack、Vite 等方案。

## 决策

选择 Vite 作为构建工具

## 理由

1. 极快的 HMR（热模块替换）
2. 原生 ES 模块支持
3. 优化的生产构建（Rollup）
4. 简单的配置
5. 优秀的 TypeScript 支持

## 后果

### 优势

- 开发体验极佳
- 构建速度快
- Bundle 大小优化

### 劣势

- 需要单独配置环境变量
- 某些旧浏览器可能需要额外 polyfill
```

---

#### 14.4 贡献指南

```markdown
## CONTRIBUTING.md

# 贡献指南

## 开发流程

### 1. 环境准备

\`\`\`bash

# 克隆仓库

git clone <repository-url>
cd webapp-aesthetics-statistics

# 安装依赖

npm install
cd api && npm install && cd ..

# 配置环境变量

cp .env.example .env.local

# 编辑 .env.local 添加 GEMINI_API_KEY

\`\`\`

### 2. 开发

\`\`\`bash

# 启动前端（终端 1）

npm run dev

# 启动后端（终端 2）

cd api && npm run dev
\`\`\`

### 3. 提交前检查

\`\`\`bash

# 运行测试

npm run test:run

# 检查代码风格

npm run lint

# 格式化代码

npm run format

# 运行构建

npm run build
\`\`\`

### 4. 提交规范

遵循 Conventional Commits：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

### 5. Pull Request

1. Fork 仓库
2. 创建功能分支
3. 提交代码
4. 创建 PR
5. 等待 review
   \`\`\`
```

---

### 15. CI/CD 增强

**优先级**: 🟢 P3
**预计时间**: 4-6 小时
**影响**: 中 - 部署质量

**GitHub Actions 工作流**:

#### 15.1 性能基准测试

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        run: npx @lhci/cli@latest autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

#### 15.2 安全审计

```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * 1' # 每周一
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

#### 15.3 依赖更新自动化

```yaml
# .github/workflows/dependency-update.yml
name: Dependency Update Check

on:
  schedule:
    - cron: '0 0 1 * *' # 每月 1 号

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check for outdated dependencies
        run: |
          npm outdated > outdated.txt || true
          cat outdated.txt

      - name: Create issue if updates available
        if: success()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '📦 依赖更新提醒',
              body: '检测到可用的依赖更新，请查看并更新。'
            })
```

---

## 📊 优化优先级总览

### 本周完成（P0）

1. ✅ 清理未使用的导入 (2 分钟)

**总时间**: 2 分钟

### 本月完成（P1）

2. ⬜ Patch 版本依赖更新 (15 分钟)
3. ⬜ 测试覆盖率冲刺 90%+ (2-3 小时) - 可选
4. ⬜ 脚本 ESLint 配置优化 (10 分钟)

**总时间**: ~3.5 小时

### 本季度完成（P2）

5. ⬜ Minor 版本依赖更新 (1 小时)
6. ⬜ Major 版本依赖更新 (4-8 小时)
7. ⬜ Bundle 大小优化 (4-6 小时)
8. ⬜ E2E 测试扩展 (6-8 小时)
9. ⬜ API 后端优化 (4-5 小时)

**总时间**: ~20-30 小时

### 长期规划（P3）

10. ⬜ 性能监控和分析 (6-8 小时)
11. ⬜ PWA 实现 (8-10 小时)
12. ⬜ 无障碍性增强 (6-8 小时)
13. ⬜ 国际化准备 (10-15 小时)
14. ⬜ 文档完善 (4-6 小时)
15. ⬜ CI/CD 增强 (4-6 小时)

**总时间**: ~40-55 小时

---

## 🎯 预期成果

### 完成 P0-P1 后:

- ✅ ESLint 问题: 1 → 0
- ✅ 代码质量评分: A → A+
- ✅ 测试覆盖率: 89.65% → 90%+ (可选)
- ✅ 依赖健康度: B → B+

### 完成 P0-P2 后:

- ✅ 依赖健康度: B → A
- ✅ 性能评分: A → A+
- ✅ Bundle 大小: 减少 20-30%
- ✅ E2E 测试覆盖: 全面覆盖错误和无障碍场景
- ✅ 后端代码质量: B → A

### 完成 P0-P3 后:

- ✅ 生产就绪度: 95% → 99%
- ✅ 可访问性: WCAG 2.1 AA 合规
- ✅ 国际化: 支持多语言
- ✅ 可观测性: 完整的监控和错误追踪
- ✅ PWA: 可安装、离线支持

---

## 📅 建议实施时间表

### Week 1（本周）

- Day 1: P0 任务（清理未使用导入）
- Day 2-3: P1 任务（依赖更新、ESLint 配置）
- Day 4-5: P1 任务（测试覆盖率提升） - 可选

### Month 1-2（本季度）

- Week 2-3: P2 依赖更新（Minor 和 Major 版本）
- Week 4-5: P2 性能优化（Bundle 优化、代码分割）
- Week 6: P2 E2E 测试扩展
- Week 7: P2 后端优化

### Quarter 1-2（长期）

- 根据业务需求和资源选择 P3 任务实施
- 建议优先级: PWA > 性能监控 > 无障碍性 > 国际化

---

## 🔄 持续改进建议

### 每周任务:

- [ ] 运行 `npm audit` 检查安全漏洞
- [ ] 运行 `npm outdated` 检查依赖更新
- [ ] 审查代码质量和测试覆盖率
- [ ] 监控性能指标

### 每月任务:

- [ ] 更新 patch 和 minor 版本依赖
- [ ] 性能审计（Lighthouse CI）
- [ ] 代码审查和重构
- [ ] 更新文档

### 每季度任务:

- [ ] 评估 major 版本依赖更新
- [ ] 架构审查
- [ ] 安全审计
- [ ] 用户反馈整合

---

**文档生成时间**: 2025-12-27
**下次审计建议**: 2026-01-27

**当前项目状态**: 🎉 代码质量优秀，已达到 A 级标准
**下一目标**: A+ 级标准（完成 P0-P1 任务）

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

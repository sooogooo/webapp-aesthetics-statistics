# 项目优化路线图 (Phase 7+)

## 📋 项目审核总结

**审核日期**: 2025-11-19
**当前版本**: Phase 6 完成
**生产就绪度**: 98%

### 🔍 发现的主要问题

#### 1. 安全漏洞 (高优先级) 🔴
- **7 个 npm 安全漏洞** (4 低, 2 中, 1 高)
  - `dompurify < 3.2.4` - XSS 漏洞 (中等)
  - `jspdf <= 3.0.1` - 依赖 dompurify (中等)
  - `js-yaml < 3.14.2` - 原型污染 (中等)
  - `tmp <= 0.2.3` - 任意文件写入 (低/高)
  - `@lhci/cli` - 依赖有漏洞的 inquirer 和 tmp

#### 2. 代码质量问题 (中优先级) 🟡
- **148 个 ESLint 问题** (44 错误, 104 警告)
  - **React Hooks 规则违反**:
    - `Dashboard.tsx`: useMemo 中使用 Math.random() (5个错误)
    - `ABTestCalculator.tsx`: useEffect 中直接调用 setState
    - 缺少依赖项: 多个组件
  - **TypeScript 类型问题**:
    - 100+ 个 `any` 类型使用
    - 未使用的变量和导入: App.tsx, ContentDisplay.tsx 等
  - **Node.js 脚本问题**:
    - `scripts/split-distributions.js`: 9个 console/process 未定义错误

#### 3. 过时的依赖 (中优先级) 🟡
- **12 个主要依赖过时**:
  - `@google/genai`: 0.14.0 → 1.30.0 (主要版本)
  - `vite`: 6.4.1 → 7.2.2 (主要版本)
  - `react-markdown`: 9.1.0 → 10.1.0 (主要版本)
  - `@types/node`: 22.19.0 → 24.10.1 (主要版本)
  - `typescript`: 5.8.3 → 5.9.3 (小版本)
  - 其他: vitest, @vitest/* 等

#### 4. 测试覆盖缺口 (低优先级) 🟢
- **分支覆盖率**: 75.86% (目标: 85%+)
- **缺少测试的组件**:
  - Dashboard, ContentDisplay, Chatbot
  - DecisionGuide, LearningPaths, StatisticalCopilot
  - 所有 data/ 目录下的文件
- **E2E 测试**: 已有 34+ 测试，但可继续扩展

#### 5. 性能优化机会 (低优先级) 🟢
- **Bundle 大小**:
  - `chart-vendor`: 168KB (可优化)
  - `index`: 224KB (可进一步分割)
  - `markdown-vendor`: 118KB (考虑替代方案)
- **图片优化**: 未实现
- **Service Worker**: 未实现 (PWA)

#### 6. 后端代码问题 (低优先级) 🟢
- 缺少 `package-lock.json`
- 未进行安全审计
- 缺少单元测试

---

## 🎯 优化计划 (按优先级)

### P0 - 关键 (立即修复) 🔴

#### 任务 1: 修复安全漏洞
**预计时间**: 2-3 小时
**影响**: 高

**步骤**:
1. 升级 jspdf 到 3.0.3 (包含 dompurify 3.2.4+)
2. 修复 js-yaml 到 4.1.1+
3. 评估是否需要 @lhci/cli 或寻找替代方案
4. 运行 `npm audit fix` 自动修复低风险漏洞
5. 测试所有修复以确保无破坏性变更

**验收标准**:
- [ ] `npm audit` 显示 0 漏洞
- [ ] 所有现有功能正常工作
- [ ] PDF 导出功能正常

---

### P1 - 高优先级 (本周内) 🟡

#### 任务 2: 修复 React Hooks 错误
**预计时间**: 4-6 小时
**影响**: 高 (性能和稳定性)

**问题文件**:
- `components/Dashboard.tsx`: Math.random() 在 useMemo 中
- `components/ABTestCalculator.tsx`: setState 在 useEffect 中

**解决方案**:
1. **Dashboard.tsx**:
   - 将随机数生成移到 useState 初始化
   - 使用 useRef 存储随机值
   - 或在组件外部生成静态数据

2. **ABTestCalculator.tsx**:
   - 将 `runSimulation` 函数改为 useCallback
   - 正确设置依赖数组
   - 或使用 useMemo 替代 useEffect

**验收标准**:
- [ ] 0 个 react-hooks/purity 错误
- [ ] 0 个 react-hooks/set-state-in-effect 错误
- [ ] 0 个 react-hooks/exhaustive-deps 错误
- [ ] 组件功能不变

---

#### 任务 3: 消除 TypeScript `any` 类型
**预计时间**: 6-8 小时
**影响**: 中 (类型安全)

**策略**:
1. **data/chartData.ts** (最多 any 使用):
   - 定义 ChartDataset, ChartOptions 等接口
   - 使用 Chart.js 提供的类型

2. **data/mockData.ts**:
   - 为每个 case 块定义类型
   - 修复 lexical declaration 错误

3. **hooks/useChartInteraction.ts**:
   - 使用 Chart.js 提供的 Event 类型

4. **其他组件**:
   - 为事件处理器使用 React 事件类型
   - 为 API 响应定义接口

**验收标准**:
- [ ] 减少 80% 以上的 `any` 使用
- [ ] 关键路径代码 100% 类型安全
- [ ] ESLint 警告减少到 < 20 个

---

#### 任务 4: 清理未使用的代码
**预计时间**: 2-3 小时
**影响**: 中 (代码清洁度)

**清理项**:
1. **App.tsx**:
   - 删除未使用的 getDistributionIndex, loadDistribution, DistributionIndexEntry

2. **ContentDisplay.tsx**:
   - 删除未使用的 Page 导入

3. **ABTestCalculator.tsx**:
   - 删除或使用 simulations, bWins 变量

4. **scripts/split-distributions.js**:
   - 添加 ESLint 环境配置或使用 TypeScript 重写

**验收标准**:
- [ ] 0 个 no-unused-vars 警告
- [ ] Build 成功且体积减小

---

### P2 - 中优先级 (本月内) 🟢

#### 任务 5: 升级主要依赖
**预计时间**: 4-6 小时
**影响**: 中 (功能和性能)

**分阶段升级**:

**阶段 1: 开发工具** (低风险)
- typescript: 5.8.3 → 5.9.3
- vitest: 4.0.8 → 4.0.10
- @vitest/coverage-v8, @vitest/ui: 同步升级
- @typescript-eslint/*: 8.46.3 → 8.47.0
- @vitejs/plugin-react: 5.1.0 → 5.1.1

**阶段 2: 构建工具** (中风险)
- vite: 6.4.1 → 7.2.2
  - 阅读 [Vite 7 迁移指南](https://vitejs.dev/guide/migration.html)
  - 测试所有构建配置
  - 验证 HMR 和开发服务器

**阶段 3: 运行时库** (高风险)
- @google/genai: 0.14.0 → 1.30.0
  - **重要**: 这是主要版本更新，API 可能有破坏性变更
  - 阅读 [发布说明](https://github.com/google/generative-ai-js/releases)
  - 更新所有 API 调用
  - 全面测试 AI 功能

- react-markdown: 9.1.0 → 10.1.0
  - 检查 [变更日志](https://github.com/remarkjs/react-markdown/releases)
  - 测试所有 Markdown 渲染

**阶段 4: 类型定义**
- @types/node: 22.19.0 → 24.10.1

**验收标准**:
- [ ] 所有依赖升级完成
- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 手动测试所有功能

---

#### 任务 6: 扩展测试覆盖
**预计时间**: 8-10 小时
**影响**: 中 (质量保证)

**目标**:
- 总体覆盖率: 92.15% → 95%+
- 分支覆盖率: 75.86% → 85%+

**新增测试**:

1. **Dashboard.test.tsx**:
   - KPI 数据计算
   - 模型推荐逻辑
   - 导航交互

2. **ContentDisplay.test.tsx**:
   - 内容渲染
   - 图表集成
   - 参数更新

3. **Chatbot.test.tsx**:
   - 消息发送/接收
   - 历史管理
   - 错误处理

4. **DecisionGuide.test.tsx**:
   - 决策树导航
   - 推荐逻辑

5. **E2E 测试扩展**:
   - 错误场景 (网络失败, API 错误)
   - 无障碍测试 (键盘导航, 屏幕阅读器)
   - 跨浏览器测试 (Firefox, Safari)

**验收标准**:
- [ ] 分支覆盖率 ≥ 85%
- [ ] 所有关键组件有测试
- [ ] E2E 测试覆盖错误场景

---

#### 任务 7: 后端代码优化
**预计时间**: 4-5 小时
**影响**: 中 (安全和质量)

**改进项**:

1. **生成 package-lock.json**:
   ```bash
   cd api && npm install --package-lock-only
   ```

2. **添加后端测试**:
   - API 路由测试 (Jest + Supertest)
   - Rate limiting 测试
   - 错误处理测试

3. **添加输入验证**:
   - 使用 Joi 或 Zod 验证请求
   - 防止注入攻击

4. **添加日志系统**:
   - Winston 或 Pino
   - 结构化日志
   - 错误追踪

5. **健康检查端点**:
   - `/health` 端点
   - 数据库连接检查 (如适用)

**验收标准**:
- [ ] package-lock.json 存在
- [ ] 后端测试覆盖率 > 80%
- [ ] 输入验证实现
- [ ] 日志系统配置

---

### P3 - 低优先级 (选做) 🟢

#### 任务 8: Bundle 优化
**预计时间**: 6-8 小时
**影响**: 低 (性能)

**优化策略**:

1. **Chart.js 优化**:
   - Tree-shaking: 只导入需要的图表类型
   - 考虑 Chart.js 替代方案 (recharts, visx)

2. **Markdown 渲染优化**:
   - 替代 react-markdown (markdown-it?)
   - 或实现自定义 Markdown 解析器

3. **图片优化**:
   - 使用 WebP 格式
   - 响应式图片
   - 懒加载

4. **字体优化**:
   - 字体子集化
   - Font loading 策略

**验收标准**:
- [ ] 主 bundle < 200KB
- [ ] vendor chunks < 150KB 各
- [ ] Lighthouse Performance > 90

---

#### 任务 9: PWA 实现
**预计时间**: 8-10 小时
**影响**: 低 (用户体验)

**功能**:

1. **Service Worker**:
   - 使用 Workbox
   - 缓存策略 (Cache First, Network First)
   - 离线支持

2. **Web App Manifest**:
   - 图标 (多种尺寸)
   - 主题颜色
   - 启动画面

3. **离线功能**:
   - 离线查看已访问的分布
   - 离线数据缓存
   - 同步策略

**验收标准**:
- [ ] PWA Lighthouse 得分 > 90
- [ ] 可安装到主屏幕
- [ ] 基本离线功能

---

#### 任务 10: 监控和分析
**预计时间**: 6-8 小时
**影响**: 低 (运维)

**实现**:

1. **错误追踪**:
   - Sentry 集成
   - 源码映射上传
   - 错误分组和通知

2. **性能监控**:
   - Web Vitals 报告
   - 自定义性能指标
   - RUM (Real User Monitoring)

3. **用户分析**:
   - Google Analytics 4
   - 事件追踪
   - 转化漏斗

4. **日志聚合**:
   - 前端日志收集
   - 与后端日志关联
   - 日志搜索和查询

**验收标准**:
- [ ] Sentry 配置完成
- [ ] 性能数据可视化
- [ ] 用户行为追踪

---

#### 任务 11: 国际化 (i18n)
**预计时间**: 10-12 小时
**影响**: 低 (市场扩展)

**实现**:

1. **i18n 框架**:
   - react-i18next
   - 语言检测
   - 懒加载翻译

2. **翻译内容**:
   - 英文翻译
   - 其他语言 (可选)
   - RTL 支持

3. **数据国际化**:
   - 日期/时间格式
   - 数字格式
   - 货币

**验收标准**:
- [ ] 支持中英文切换
- [ ] 所有 UI 文本可翻译
- [ ] 数据格式本地化

---

#### 任务 12: 无障碍增强
**预计时间**: 6-8 小时
**影响**: 低 (包容性)

**改进**:

1. **ARIA 属性**:
   - 角色和标签
   - 实时区域
   - 状态和属性

2. **键盘导航**:
   - Tab 顺序
   - 快捷键
   - Focus 管理

3. **屏幕阅读器**:
   - 语义化 HTML
   - 替代文本
   - 可读的错误消息

4. **对比度和可读性**:
   - WCAG AAA 对比度
   - 字体大小调整
   - 高对比度模式

**验收标准**:
- [ ] Lighthouse Accessibility > 95
- [ ] WCAG 2.1 AA 合规
- [ ] 键盘完全可操作

---

## 📅 建议实施时间表

### 第 1 周: P0 任务 (关键)
- **Day 1-2**: 修复安全漏洞 (任务 1)
- **Day 3-5**: 修复 React Hooks 错误 (任务 2)

### 第 2 周: P1 任务 (高优先级)
- **Day 1-3**: 消除 TypeScript any 类型 (任务 3)
- **Day 4**: 清理未使用的代码 (任务 4)
- **Day 5**: 代码审查和测试

### 第 3-4 周: P1 任务 (高优先级)
- **Week 3**: 升级主要依赖 (任务 5)
- **Week 4 Day 1-4**: 扩展测试覆盖 (任务 6)
- **Week 4 Day 5**: 后端代码优化 (任务 7)

### 第 5+ 周: P3 任务 (选做)
- 根据业务需求和资源选择实施

---

## 🎯 成功指标

### Phase 7 完成标准:
- [ ] **安全**: 0 npm 安全漏洞
- [ ] **代码质量**: < 20 ESLint 警告, 0 错误
- [ ] **测试覆盖**: 分支覆盖率 ≥ 85%
- [ ] **依赖**: 所有关键依赖更新到最新稳定版
- [ ] **性能**: Lighthouse Performance > 85
- [ ] **可维护性**: 技术债务显著减少

### 最终目标 (100% 生产就绪):
- [ ] **安全**: 企业级安全标准
- [ ] **性能**: Core Web Vitals 全部通过
- [ ] **质量**: 零 ESLint 错误, 95%+ 测试覆盖
- [ ] **可访问性**: WCAG 2.1 AA 合规
- [ ] **监控**: 完整的错误追踪和性能监控
- [ ] **文档**: 完整的 API 文档和用户指南

---

## 📊 预期影响

### 技术指标:
- **安全评分**: C → A+
- **代码质量**: B → A
- **测试覆盖**: 93.75% (行) → 95%+, 75.86% (分支) → 85%+
- **性能评分**: 85 → 90+
- **Bundle 大小**: -15-20%

### 业务价值:
- **用户体验**: 更快、更流畅、更可靠
- **开发效率**: 更少 bug, 更快迭代
- **安全性**: 减少安全风险
- **可扩展性**: 更容易添加新功能
- **团队协作**: 更好的代码质量和文档

---

## 🔄 持续改进

### 每周任务:
- [ ] 运行 `npm audit` 并修复新漏洞
- [ ] 检查依赖更新 (`npm outdated`)
- [ ] 审查 Lighthouse CI 报告
- [ ] 监控错误追踪 (Sentry)

### 每月任务:
- [ ] 性能审计和优化
- [ ] 代码审查和重构
- [ ] 更新文档
- [ ] 技术债务评估

### 每季度任务:
- [ ] 主要依赖升级
- [ ] 架构审查
- [ ] 安全审计
- [ ] 用户反馈整合

---

**最后更新**: 2025-11-19
**下次审核**: 2025-12-19 (完成 P0-P1 任务后)

# API Server

安全的后端 API 代理服务，用于保护 Gemini API 密钥并实现请求频率限制。

## 设置

1. 安装依赖：
```bash
cd api
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，添加你的 GEMINI_API_KEY
```

3. 启动服务器：
```bash
# 开发模式（支持热重载）
npm run dev

# 生产模式
npm start
```

## API 端点

### POST /api/chat
聊天对话接口

请求体：
```json
{
  "message": "用户消息",
  "systemInstruction": "系统指令（可选）",
  "chatHistory": [] // 聊天历史（可选）
}
```

### POST /api/generate-image
图片生成接口

请求体：
```json
{
  "prompt": "图片描述提示词"
}
```

### POST /api/analyze-file
文件分析接口

请求体：
```json
{
  "fileContent": "文件内容",
  "fileName": "文件名（可选）",
  "prompt": "分析要求",
  "systemInstruction": "系统指令（可选）"
}
```

## 频率限制

- 全局：100 请求/15分钟
- 聊天/图片生成：20 请求/分钟

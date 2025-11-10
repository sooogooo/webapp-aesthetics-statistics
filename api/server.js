import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: '../.env.local' });

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: '请求过于频繁，请稍后再试'
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  message: '聊天消息发送过快，请稍后再试'
});

app.use('/api/', limiter);

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

if (!process.env.GEMINI_API_KEY) {
  console.error('⚠️  GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { message, systemInstruction, chatHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '消息内容无效' });
    }

    // Create chat instance
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction || '你是一位专业的AI助教'
      }
    });

    // Restore chat history if provided
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        if (msg.role === 'user') {
          // Send message without waiting for response to restore history
          chat.sendMessage({ message: msg.text }).catch(() => {});
        }
      }
    }

    // Send current message
    const response = await chat.sendMessage({ message });

    res.json({
      text: response.text,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: '处理消息时出错',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Image generation endpoint
app.post('/api/generate-image', chatLimiter, async (req, res) => {
  try {
    const { prompt, aspectRatio, referenceImage } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: '提示词无效' });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({ error: '提示词过长（最多2000字符）' });
    }

    let base64ImageBytes;

    if (referenceImage) {
      // Reference image mode using gemini-2.5-flash-image
      const generationPrompt = `Generate a new image of: "${prompt}". Use the provided image as strong inspiration for the overall style, color palette, and composition. The new image should be professional, elegant, and suitable for a medical aesthetics clinic, evoking feelings of trust and beauty with soft, natural lighting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: referenceImage.base64,
                mimeType: referenceImage.mimeType
              }
            },
            { text: generationPrompt },
          ],
        },
        config: {
          responseModalities: ['IMAGE'],
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
      if (imagePart?.inlineData) {
        base64ImageBytes = imagePart.inlineData.data;
      } else {
        throw new Error("AI did not return an image. It might have refused the request.");
      }
    } else {
      // Text-to-image mode using imagen-4.0
      const fullPrompt = `md_prompt: A professional, minimalist, elegant, clean, high-end image for a medical aesthetics clinic. ${prompt}. The image should evoke feelings of trust, science, and beauty. Use soft, natural lighting.`;

      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio || '1:1',
        },
      });

      base64ImageBytes = response.generatedImages[0].image.imageBytes;
    }

    res.json({
      imageData: base64ImageBytes,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: '生成图片时出错',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// File analysis endpoint (for StatisticalCopilot)
app.post('/api/analyze-file', chatLimiter, async (req, res) => {
  try {
    const { fileContent, fileName, prompt, systemInstruction } = req.body;

    if (!fileContent || !prompt) {
      return res.status(400).json({ error: '文件内容或提示词缺失' });
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction || '你是一位专业的数据分析师'
      }
    });

    const fullPrompt = `文件名: ${fileName || '未知'}\n\n文件内容:\n${fileContent}\n\n用户问题: ${prompt}`;

    const response = await chat.sendMessage({ message: fullPrompt });

    res.json({
      text: response.text,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('File analysis error:', error);
    res.status(500).json({
      error: '分析文件时出错',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: '服务器内部错误',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: '端点不存在' });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from: ${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}`);
});

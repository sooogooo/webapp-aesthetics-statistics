/**
 * API Service Layer
 * Centralized API calls to backend proxy server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ChatRequest {
  message: string;
  systemInstruction?: string;
  chatHistory?: Array<{ role: string; text: string }>;
}

interface ChatResponse {
  text: string;
  timestamp: number;
}

interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  referenceImage?: {
    base64: string;
    mimeType: string;
  };
}

interface ImageGenerationResponse {
  imageData: string;
  timestamp: number;
}

interface FileAnalysisRequest {
  fileContent: string;
  fileName?: string;
  prompt: string;
  systemInstruction?: string;
}

interface ApiError {
  error: string;
  details?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a chat message
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: '网络请求失败',
      }));
      throw new Error(error.error || '发送消息失败');
    }

    return response.json();
  }

  /**
   * Generate an image from a prompt
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: '网络请求失败',
      }));
      throw new Error(error.error || '生成图片失败');
    }

    return response.json();
  }

  /**
   * Analyze a file with AI
   */
  async analyzeFile(request: FileAnalysisRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/analyze-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: '网络请求失败',
      }));
      throw new Error(error.error || '分析文件失败');
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);

    if (!response.ok) {
      throw new Error('API 服务不可用');
    }

    return response.json();
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type {
  ChatRequest,
  ChatResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
  FileAnalysisRequest,
  ApiError,
};

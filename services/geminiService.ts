import type { Type } from '@google/genai';

interface GenerateContentParams {
  model: string;
  contents: any;
  config?: {
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: {
      type: typeof Type;
      properties?: Record<string, any>;
      items?: any;
    };
    responseModalities?: any[];
  };
}

interface GenerateImagesParams {
  model: string;
  prompt: string;
  config?: {
    numberOfImages?: number;
    outputMimeType?: string;
    aspectRatio?: string;
  };
}

interface ChatParams {
  model: string;
  config?: {
    systemInstruction?: string;
  };
  message: string;
}

class GeminiService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-proxy`;
    this.headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  async generateContent(params: GenerateContentParams) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        action: 'generateContent',
        params,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate content');
    }

    return await response.json();
  }

  async generateImages(params: GenerateImagesParams) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        action: 'generateImages',
        params,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate images');
    }

    return await response.json();
  }

  async chat(params: ChatParams) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        action: 'chat',
        params,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Chat request failed');
    }

    return await response.json();
  }
}

export const geminiService = new GeminiService();

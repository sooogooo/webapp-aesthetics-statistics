import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from './api';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('chat', () => {
    it('should send a chat message successfully', async () => {
      const mockResponse = {
        text: 'AI response',
        timestamp: Date.now(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.chat({
        message: 'Hello',
        systemInstruction: 'You are helpful',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should throw error on failed request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed' }),
      });

      await expect(apiService.chat({ message: 'Hello' })).rejects.toThrow();
    });
  });

  describe('generateImage', () => {
    it('should generate image successfully', async () => {
      const mockResponse = {
        imageData: 'base64data',
        timestamp: Date.now(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.generateImage({
        prompt: 'A beautiful scene',
        aspectRatio: '1:1',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when image generation fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Image generation failed' }),
      });

      await expect(
        apiService.generateImage({ prompt: 'test', aspectRatio: '1:1' })
      ).rejects.toThrow('Image generation failed');
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Network error');
        },
      });

      await expect(
        apiService.generateImage({ prompt: 'test', aspectRatio: '1:1' })
      ).rejects.toThrow('网络请求失败');
    });
  });

  describe('analyzeFile', () => {
    it('should analyze file successfully', async () => {
      const mockResponse = {
        text: 'Analysis result',
        timestamp: Date.now(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.analyzeFile({
        fileContent: 'file content',
        fileName: 'test.txt',
        prompt: 'Analyze this',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when file analysis fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Analysis failed' }),
      });

      await expect(
        apiService.analyzeFile({
          fileContent: 'content',
          fileName: 'test.txt',
          prompt: 'test',
        })
      ).rejects.toThrow('Analysis failed');
    });

    it('should handle network errors during file analysis', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Network error');
        },
      });

      await expect(
        apiService.analyzeFile({
          fileContent: 'content',
          fileName: 'test.txt',
          prompt: 'test',
        })
      ).rejects.toThrow('网络请求失败');
    });
  });

  describe('healthCheck', () => {
    it('should check API health', async () => {
      const mockResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.healthCheck();

      expect(result.status).toBe('ok');
    });

    it('should throw error when health check fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      await expect(apiService.healthCheck()).rejects.toThrow('API 服务不可用');
    });
  });
});

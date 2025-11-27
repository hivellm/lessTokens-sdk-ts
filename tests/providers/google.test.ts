/**
 * Tests for Google provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleProvider } from '../../src/providers/google.js';
import { ErrorCodes } from '../../src/errors.js';
import type { LLMConfig } from '../../src/types.js';

// Mock Google GenAI SDK
const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();
const mockModels = {
  generateContent: mockGenerateContent,
  generateContentStream: mockGenerateContentStream,
};
const mockClient = {
  models: mockModels,
};

vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    constructor() {
      return mockClient;
    }
  }
  return {
    GoogleGenAI: MockGoogleGenAI,
  };
});

describe('GoogleProvider', () => {
  let provider: GoogleProvider;

  beforeEach(() => {
    provider = new GoogleProvider('test-key');
    vi.clearAllMocks();
  });

  describe('chat', () => {
    it('should send chat completion request', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Hello, world!' }],
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
        },
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
      };

      const result = await provider.chat([{ role: 'user', content: 'Hello' }], config);

      expect(result.content).toBe('Hello, world!');
      expect(result.usage.promptTokens).toBe(10);
      expect(result.usage.completionTokens).toBe(5);
      expect(result.usage.totalTokens).toBe(15);
      expect(result.metadata?.provider).toBe('google');
    });

    it('should convert messages to Google format', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'test' }] } }],
        usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0 },
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
      };

      await provider.chat(
        [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi' },
          { role: 'user', content: 'How are you?' },
        ],
        config
      );

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: [
            { role: 'user', parts: [{ text: 'Hello' }] },
            { role: 'model', parts: [{ text: 'Hi' }] },
            { role: 'user', parts: [{ text: 'How are you?' }] },
          ],
        })
      );
    });

    it('should pass through configuration options', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'test' }] } }],
        usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0 },
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        maxTokens: 100,
        topP: 0.9,
        topK: 40,
        customOption: 'value',
      };

      await provider.chat([{ role: 'user', content: 'test' }], config);

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            temperature: 0.7,
            maxOutputTokens: 100,
            topP: 0.9,
            topK: 40,
            customOption: 'value',
          }),
        })
      );
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        candidates: [],
        usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0 },
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
      };

      const result = await provider.chat([{ role: 'user', content: 'test' }], config);
      expect(result.content).toBe('');
    });

    it('should throw error on API failure', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API error'));

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
      };

      await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
        code: ErrorCodes.LLM_API_ERROR,
      });
    });
  });

  describe('chatStream', () => {
    it('should stream chat completion', async () => {
      const mockChunks = [
        { candidates: [{ content: { parts: [{ text: 'Hello' }] } }] },
        { candidates: [{ content: { parts: [{ text: ', ' }] } }] },
        { candidates: [{ content: { parts: [{ text: 'world!' }] } }] },
      ];

      const asyncGenerator = async function* () {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      };

      mockGenerateContentStream.mockResolvedValueOnce(asyncGenerator());

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
      };

      const stream = await provider.chatStream([{ role: 'user', content: 'Hello' }], config);
      const chunks: string[] = [];
      let finalChunk: any;

      for await (const chunk of stream) {
        if (chunk.done) {
          finalChunk = chunk;
        } else {
          chunks.push(chunk.content);
        }
      }

      expect(chunks.join('')).toBe('Hello, world!');
      expect(finalChunk).toBeDefined();
      expect(finalChunk.done).toBe(true);
    });

    it('should handle chunks with direct text property', async () => {
      const mockChunks = [{ text: 'Hello' }, { text: ' world!' }];

      const asyncGenerator = async function* () {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      };

      mockGenerateContentStream.mockResolvedValueOnce(asyncGenerator());

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
      };

      const stream = await provider.chatStream([{ role: 'user', content: 'Hello' }], config);
      const chunks: string[] = [];

      for await (const chunk of stream) {
        if (!chunk.done) {
          chunks.push(chunk.content);
        }
      }

      expect(chunks.join('')).toBe('Hello world!');
    });
  });
});


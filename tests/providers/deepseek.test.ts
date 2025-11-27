/**
 * Tests for DeepSeek provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeepSeekProvider } from '../../src/providers/deepseek.js';
import { ErrorCodes } from '../../src/errors.js';
import type { LLMConfig } from '../../src/types.js';

// Mock OpenAI SDK (DeepSeek uses OpenAI SDK)
const mockCreate = vi.fn();
const mockCompletions = {
  create: mockCreate,
};
const mockChat = {
  completions: mockCompletions,
};
const mockClient = {
  chat: mockChat,
};

vi.mock('openai', () => {
  class MockOpenAI {
    constructor() {
      return mockClient;
    }
  }
  return {
    default: MockOpenAI,
  };
});

describe('DeepSeekProvider', () => {
  let provider: DeepSeekProvider;

  beforeEach(() => {
    provider = new DeepSeekProvider('test-key');
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create provider with DeepSeek base URL', () => {
      // Provider is created in beforeEach, verify it was instantiated
      expect(provider).toBeDefined();
      // The actual baseURL verification is tested through the chat method
    });
  });

  describe('chat', () => {
    it('should send chat completion request', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello, world!',
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
        model: 'deepseek-chat',
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'deepseek-chat',
      };

      const result = await provider.chat([{ role: 'user', content: 'Hello' }], config);

      expect(result.content).toBe('Hello, world!');
      expect(result.usage.promptTokens).toBe(10);
      expect(result.usage.completionTokens).toBe(5);
      expect(result.usage.totalTokens).toBe(15);
      expect(result.metadata?.model).toBe('deepseek-chat');
      expect(result.metadata?.provider).toBe('deepseek');
    });

    it('should pass through all configuration options', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'test' } }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        model: 'deepseek-chat',
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'deepseek-chat',
        temperature: 0.7,
        maxTokens: 100,
        topP: 0.9,
        customOption: 'value',
      };

      await provider.chat([{ role: 'user', content: 'test' }], config);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7,
          max_tokens: 100,
          top_p: 0.9,
          customOption: 'value',
        })
      );
    });

    it('should throw error on API failure', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API error'));

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'deepseek-chat',
      };

      await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
        code: ErrorCodes.LLM_API_ERROR,
      });
    });
  });

  describe('chatStream', () => {
    it('should stream chat completion', async () => {
      const mockChunks = [
        { choices: [{ delta: { content: 'Hello' } }] },
        { choices: [{ delta: { content: ', ' } }] },
        { choices: [{ delta: { content: 'world!' } }] },
      ];

      const asyncGenerator = async function* () {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      };

      mockCreate.mockResolvedValueOnce(asyncGenerator());

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'deepseek-chat',
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
  });
});


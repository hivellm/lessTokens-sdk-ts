/**
 * Tests for OpenAI provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from '../../src/providers/openai.js';
import { ErrorCodes } from '../../src/errors.js';
import type { LLMConfig } from '../../src/types.js';

// Create a mock OpenAI client
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

// Mock OpenAI SDK
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

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider('test-key');
    vi.clearAllMocks();
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
        model: 'gpt-4',
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gpt-4',
      };

      const result = await provider.chat([{ role: 'user', content: 'Hello' }], config);

      expect(result.content).toBe('Hello, world!');
      expect(result.usage.promptTokens).toBe(10);
      expect(result.usage.completionTokens).toBe(5);
      expect(result.usage.totalTokens).toBe(15);
      expect(result.metadata?.model).toBe('gpt-4');
      expect(result.metadata?.provider).toBe('openai');
    });

    it('should pass through all configuration options', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'test' } }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        model: 'gpt-4',
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 100,
        topP: 0.9,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        stop: ['stop'],
        customOption: 'value',
      };

      await provider.chat([{ role: 'user', content: 'test' }], config);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7,
          max_tokens: 100,
          top_p: 0.9,
          frequency_penalty: 0.5,
          presence_penalty: 0.5,
          stop: ['stop'],
          customOption: 'value',
        })
      );
    });

    it('should throw error on API failure', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API error'));

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gpt-4',
      };

      await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
        code: ErrorCodes.LLM_API_ERROR,
      });
    });

    it('should throw error when no response', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        model: 'gpt-4',
      });

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gpt-4',
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
        model: 'gpt-4',
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


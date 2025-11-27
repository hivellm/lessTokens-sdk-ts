/**
 * Tests for Anthropic provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicProvider } from '../../src/providers/anthropic.js';
import { ErrorCodes } from '../../src/errors.js';
import type { LLMConfig } from '../../src/types.js';

// Mock Anthropic SDK
const mockCreate = vi.fn();
const mockStream = vi.fn();
const mockMessages = {
  create: mockCreate,
  stream: mockStream,
};
const mockClient = {
  messages: mockMessages,
};

vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    constructor() {
      return mockClient;
    }
  }
  return {
    default: MockAnthropic,
  };
});

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    provider = new AnthropicProvider('test-key');
    vi.clearAllMocks();
  });

  describe('chat', () => {
    it('should send chat completion request', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Hello, world!',
          },
        ],
        usage: {
          input_tokens: 10,
          output_tokens: 5,
        },
        model: 'claude-3-opus-20240229',
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229',
      };

      const result = await provider.chat([{ role: 'user', content: 'Hello' }], config);

      expect(result.content).toBe('Hello, world!');
      expect(result.usage.promptTokens).toBe(10);
      expect(result.usage.completionTokens).toBe(5);
      expect(result.usage.totalTokens).toBe(15);
      expect(result.metadata?.model).toBe('claude-3-opus-20240229');
      expect(result.metadata?.provider).toBe('anthropic');
    });

    it('should convert system messages to user messages', async () => {
      const mockResponse = {
        content: [{ type: 'text', text: 'Response' }],
        usage: { input_tokens: 0, output_tokens: 0 },
        model: 'claude-3-opus-20240229',
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229',
      };

      await provider.chat(
        [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello' },
        ],
        config
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: 'You are a helpful assistant' }),
            expect.objectContaining({ role: 'user', content: 'Hello' }),
          ]),
        })
      );
    });

    it('should pass through configuration options', async () => {
      const mockResponse = {
        content: [{ type: 'text', text: 'test' }],
        usage: { input_tokens: 0, output_tokens: 0 },
        model: 'claude-3-opus-20240229',
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229',
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
        model: 'claude-3-opus-20240229',
      };

      await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
        code: ErrorCodes.LLM_API_ERROR,
      });
    });

    it('should handle empty content', async () => {
      const mockResponse = {
        content: [],
        usage: { input_tokens: 0, output_tokens: 0 },
        model: 'claude-3-opus-20240229',
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229',
      };

      const result = await provider.chat([{ role: 'user', content: 'test' }], config);
      expect(result.content).toBe('');
    });
  });

  describe('chatStream', () => {
    it('should stream chat completion', async () => {
      const mockEvents = [
        { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } },
        { type: 'content_block_delta', delta: { type: 'text_delta', text: ', ' } },
        { type: 'content_block_delta', delta: { type: 'text_delta', text: 'world!' } },
        { type: 'message_stop' },
      ];

      const asyncGenerator = async function* () {
        for (const event of mockEvents) {
          yield event;
        }
      };

      const mockStreamInstance = {
        [Symbol.asyncIterator]: asyncGenerator,
        finalMessage: vi.fn().mockResolvedValue({
          usage: { input_tokens: 10, output_tokens: 5 },
        }),
      };

      mockStream.mockResolvedValueOnce(mockStreamInstance);

      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229',
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
      expect(finalChunk.usage).toBeDefined();
    });
  });
});


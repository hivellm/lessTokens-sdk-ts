/**
 * Final message handling tests for Anthropic provider to improve branch coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicProvider } from '../../src/providers/anthropic.js';
import type { LLMConfig } from '../../src/types.js';

// Mock Anthropic SDK
const mockStream = vi.fn();
const mockMessages = {
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

describe('AnthropicProvider Stream Final Message', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    provider = new AnthropicProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle stream with finalMessage having usage with undefined values', async () => {
    const mockEvents = [
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } },
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
        usage: {
          input_tokens: undefined,
          output_tokens: undefined,
        },
      }),
    };

    mockStream.mockResolvedValueOnce(mockStreamInstance);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    };

    const stream = await provider.chatStream([{ role: 'user', content: 'Hello' }], config);
    const chunks: any[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
    const finalChunk = chunks[chunks.length - 1];
    expect(finalChunk.done).toBe(true);
    expect(finalChunk.usage).toBeDefined();
    expect(finalChunk.usage.promptTokens).toBe(0);
    expect(finalChunk.usage.completionTokens).toBe(0);
  });

  it('should handle stream with finalMessage having partial usage (input_tokens only)', async () => {
    const mockEvents = [
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } },
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
        usage: {
          input_tokens: 10,
          // output_tokens missing
        },
      }),
    };

    mockStream.mockResolvedValueOnce(mockStreamInstance);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    };

    const stream = await provider.chatStream([{ role: 'user', content: 'Hello' }], config);
    const chunks: any[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const finalChunk = chunks[chunks.length - 1];
    expect(finalChunk.done).toBe(true);
    expect(finalChunk.usage.promptTokens).toBe(10);
    expect(finalChunk.usage.completionTokens).toBe(0);
  });

  it('should handle stream with finalMessage having partial usage (output_tokens only)', async () => {
    const mockEvents = [
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } },
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
        usage: {
          // input_tokens missing
          output_tokens: 5,
        },
      }),
    };

    mockStream.mockResolvedValueOnce(mockStreamInstance);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    };

    const stream = await provider.chatStream([{ role: 'user', content: 'Hello' }], config);
    const chunks: any[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const finalChunk = chunks[chunks.length - 1];
    expect(finalChunk.done).toBe(true);
    expect(finalChunk.usage.promptTokens).toBe(0);
    expect(finalChunk.usage.completionTokens).toBe(5);
  });
});


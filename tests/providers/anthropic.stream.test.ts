/**
 * Edge case tests for Anthropic provider streaming
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

describe('AnthropicProvider Streaming Edge Cases', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    provider = new AnthropicProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle stream with message_stop but no finalMessage usage', async () => {
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
        // No usage property
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
  });

  it('should handle stream without message_stop event', async () => {
    const mockEvents = [
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } },
      { type: 'content_block_delta', delta: { type: 'text_delta', text: ' world' } },
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
    const chunks: any[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
  });
});


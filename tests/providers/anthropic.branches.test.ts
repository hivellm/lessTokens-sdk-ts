/**
 * Branch coverage tests for Anthropic provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicProvider } from '../../src/providers/anthropic.js';
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

describe('AnthropicProvider Branch Coverage', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    provider = new AnthropicProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle response with partial usage (input_tokens only)', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Response' }],
      usage: {
        input_tokens: 10,
        // output_tokens missing
      },
      model: 'claude-3-opus-20240229',
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    };

    const result = await provider.chat([{ role: 'user', content: 'test' }], config);

    expect(result.usage.promptTokens).toBe(10);
    expect(result.usage.completionTokens).toBe(0);
  });

  it('should handle response with partial usage (output_tokens only)', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Response' }],
      usage: {
        // input_tokens missing
        output_tokens: 5,
      },
      model: 'claude-3-opus-20240229',
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    };

    const result = await provider.chat([{ role: 'user', content: 'test' }], config);

    expect(result.usage.promptTokens).toBe(0);
    expect(result.usage.completionTokens).toBe(5);
  });

  it('should handle stream with finalMessage usage undefined', async () => {
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
        usage: undefined, // Explicitly undefined
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
});

/**
 * System message handling tests for Anthropic provider to improve branch coverage
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

describe('AnthropicProvider System Message Handling', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    provider = new AnthropicProvider('test-key');
    vi.clearAllMocks();
  });

  it('should convert system message to user message in chat', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Response' }],
      usage: { input_tokens: 10, output_tokens: 5 },
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
        ]),
      })
    );
  });

  it('should convert system message to user message in chatStream', async () => {
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
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
    };

    mockStream.mockResolvedValueOnce(mockStreamInstance);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    };

    await provider.chatStream(
      [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
      ],
      config
    );

    expect(mockStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'You are a helpful assistant' }),
        ]),
      })
    );
  });
});


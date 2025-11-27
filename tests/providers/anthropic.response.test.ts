/**
 * Edge case tests for Anthropic provider response handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicProvider } from '../../src/providers/anthropic.js';
import type { LLMConfig } from '../../src/types.js';

// Mock Anthropic SDK
const mockCreate = vi.fn();
const mockMessages = {
  create: mockCreate,
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

describe('AnthropicProvider Response Edge Cases', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    provider = new AnthropicProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle response with non-text content', async () => {
    const mockResponse = {
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: 'base64data',
          },
        },
        {
          type: 'text',
          text: 'Text response',
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

    const result = await provider.chat([{ role: 'user', content: 'test' }], config);

    expect(result.content).toBe('Text response');
  });

  it('should handle response with only non-text content', async () => {
    const mockResponse = {
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: 'base64data',
          },
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

    const result = await provider.chat([{ role: 'user', content: 'test' }], config);

    expect(result.content).toBe('');
  });
});


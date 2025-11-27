/**
 * Error handling tests for Anthropic provider to improve branch coverage
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

describe('AnthropicProvider Error Handling', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    provider = new AnthropicProvider('test-key');
    vi.clearAllMocks();
  });

  it('should re-throw LessTokensError from chat', async () => {
    const { createError, ErrorCodes: EC } = await import('../../src/errors.js');
    const customError = createError(EC.INVALID_API_KEY, 'Custom error');

    mockCreate.mockRejectedValueOnce(customError);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    };

    await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.INVALID_API_KEY,
    });
  });

  it('should handle non-Error exception in chat', async () => {
    mockCreate.mockRejectedValueOnce('string error');

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    };

    await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });

  it('should handle error in chatStream', async () => {
    mockStream.mockRejectedValueOnce(new Error('Stream error'));

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    };

    await expect(provider.chatStream([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });

  it('should handle non-Error exception in chatStream', async () => {
    mockStream.mockRejectedValueOnce('string error');

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    };

    await expect(provider.chatStream([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });
});


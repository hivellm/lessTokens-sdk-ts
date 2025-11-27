/**
 * Error handling tests for OpenAI provider to improve branch coverage
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

describe('OpenAIProvider Error Handling', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider('test-key');
    vi.clearAllMocks();
  });

  it('should re-throw LessTokensError from chat', async () => {
    const { createError, ErrorCodes: EC } = await import('../../src/errors.js');
    const customError = createError(EC.INVALID_API_KEY, 'Custom error');

    mockCreate.mockRejectedValueOnce(customError);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gpt-4',
    };

    await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.INVALID_API_KEY,
    });
  });

  it('should handle non-Error exception in chat', async () => {
    mockCreate.mockRejectedValueOnce('string error');

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gpt-4',
    };

    await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });

  it('should handle error in chatStream', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Stream error'));

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gpt-4',
    };

    await expect(provider.chatStream([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });

  it('should handle non-Error exception in chatStream', async () => {
    mockCreate.mockRejectedValueOnce('string error');

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gpt-4',
    };

    await expect(provider.chatStream([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });
});


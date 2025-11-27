/**
 * Choice handling tests for OpenAI provider to improve branch coverage
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

describe('OpenAIProvider Choice Handling', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle response with no choices', async () => {
    const mockResponse = {
      choices: [],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      model: 'gpt-4',
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gpt-4',
    };

    await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });

  it('should handle response with choice but no message', async () => {
    const mockResponse = {
      choices: [{}],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      model: 'gpt-4',
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gpt-4',
    };

    await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });
});


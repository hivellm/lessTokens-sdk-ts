/**
 * Tests for SDK processPrompt edge cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensSDK } from '../src/sdk.js';
import type { ProcessPromptOptions } from '../src/types.js';
import { createMockFetchResponse, createMockCompressionResponse } from './utils/helpers.js';

global.fetch = vi.fn();

// Mock providers
const mockProviderInstance = {
  chat: vi.fn().mockResolvedValue({
    content: 'Response from LLM',
    usage: {
      promptTokens: 50,
      completionTokens: 20,
      totalTokens: 70,
    },
    metadata: {
      model: 'gpt-4',
      provider: 'openai',
      timestamp: new Date().toISOString(),
    },
  }),
};

vi.mock('../src/providers/openai.js', () => ({
  OpenAIProvider: class {
    constructor() {
      return mockProviderInstance;
    }
  },
}));

describe('LessTokensSDK processPrompt Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle zero original tokens (savings = 0)', async () => {
    const sdk = new LessTokensSDK({
      apiKey: 'test-key',
      provider: 'openai',
    });

    // Test case: originalTokens = 0, should result in savings = 0
    const mockCompression = createMockCompressionResponse('original', 'compressed', 0, 0);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

    const options: ProcessPromptOptions = {
      prompt: 'original',
      llmConfig: {
        apiKey: 'llm-key',
        model: 'gpt-4',
      },
    };

    const result = await sdk.processPrompt(options);

    expect(result.usage.savings).toBe(0);
    expect(result.usage.compressedTokens).toBe(0);
  });

  it('should handle compression with no savings', async () => {
    const sdk = new LessTokensSDK({
      apiKey: 'test-key',
      provider: 'openai',
    });

    // Test case: compressedTokens = originalTokens (no savings)
    const mockCompression = createMockCompressionResponse('original', 'compressed', 100, 100);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

    const options: ProcessPromptOptions = {
      prompt: 'original',
      llmConfig: {
        apiKey: 'llm-key',
        model: 'gpt-4',
      },
    };

    const result = await sdk.processPrompt(options);

    expect(result.usage.savings).toBe(0);
    expect(result.usage.compressedTokens).toBe(100);
  });
});


/**
 * Tests for SDK streaming edge cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensSDK } from '../src/sdk.js';
import type { ProcessPromptOptions } from '../src/types.js';
import { createMockFetchResponse, createMockCompressionResponse } from './utils/helpers.js';

global.fetch = vi.fn();

// Mock providers
const mockChatStreamNoUsage = vi.fn().mockImplementation(async function* () {
  yield { content: 'Response', done: false };
  yield { content: ' from', done: false };
  yield { content: ' LLM', done: false };
  // Test case 1: Stream ends with done=true but no usage
  yield { content: '', done: true };
});

const mockProviderInstance = {
  chatStream: mockChatStreamNoUsage,
};

vi.mock('../src/providers/openai.js', () => ({
  OpenAIProvider: class {
    constructor() {
      return mockProviderInstance;
    }
  },
}));

describe('LessTokensSDK Streaming Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle stream without usage info', async () => {
    const sdk = new LessTokensSDK({
      apiKey: 'test-key',
      provider: 'openai',
    });

    const mockCompression = createMockCompressionResponse('original', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

    const options: ProcessPromptOptions = {
      prompt: 'original',
      llmConfig: {
        apiKey: 'llm-key',
        model: 'gpt-4',
      },
    };

    const stream = await sdk.processPromptStream(options);
    const chunks: any[] = [];
    let finalChunk: any;

    for await (const chunk of stream) {
      if (chunk.done) {
        finalChunk = chunk;
      } else {
        chunks.push(chunk);
      }
    }

    expect(chunks.length).toBeGreaterThan(0);
    expect(finalChunk).toBeDefined();
    expect(finalChunk.done).toBe(true);
    expect(finalChunk.usage).toBeDefined();
    expect(finalChunk.usage.compressedTokens).toBe(50);
  });

  it('should handle stream with zero original tokens', async () => {
    const sdk = new LessTokensSDK({
      apiKey: 'test-key',
      provider: 'openai',
    });

    // Test case: originalTokens = 0
    const mockCompression = createMockCompressionResponse('original', 'compressed', 0, 0);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

    const options: ProcessPromptOptions = {
      prompt: 'original',
      llmConfig: {
        apiKey: 'llm-key',
        model: 'gpt-4',
      },
    };

    const stream = await sdk.processPromptStream(options);
    const chunks: any[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // Should have final chunk with savings = 0
    const finalChunk = chunks[chunks.length - 1];
    expect(finalChunk.done).toBe(true);
    if (finalChunk.usage) {
      expect(finalChunk.usage.savings).toBe(0);
    }
  });
});


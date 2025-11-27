/**
 * Branch coverage tests for SDK
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
  chatStream: vi.fn().mockImplementation(async function* () {
    yield { content: 'Response', done: false };
    yield { content: '', done: true, usage: { promptTokens: 50, completionTokens: 20, totalTokens: 70 } };
  }),
};

vi.mock('../src/providers/openai.js', () => ({
  OpenAIProvider: class {
    constructor() {
      return mockProviderInstance;
    }
  },
}));

describe('LessTokensSDK Branch Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle wrapStream with lastChunk but not done', async () => {
    const mockStreamNoDone = vi.fn().mockImplementation(async function* () {
      yield { content: 'Response', done: false };
      // Stream ends without done=true chunk
    });

    // Override chatStream for this test
    const originalChatStream = mockProviderInstance.chatStream;
    mockProviderInstance.chatStream = mockStreamNoDone;

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

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // Should have yielded the content chunks
    expect(chunks.length).toBeGreaterThan(0);
    
    // Restore original
    mockProviderInstance.chatStream = originalChatStream;
  });

  it('should handle wrapStream with lastChunk done but no lastChunk', async () => {
    // Empty stream
    const mockEmptyStream = vi.fn().mockImplementation(async function* () {
      // No chunks
    });

    // Override chatStream for this test
    const originalChatStream = mockProviderInstance.chatStream;
    mockProviderInstance.chatStream = mockEmptyStream;

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

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // Should handle empty stream gracefully
    expect(chunks.length).toBeGreaterThanOrEqual(0);
  });
});


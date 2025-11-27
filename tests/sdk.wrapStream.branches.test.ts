/**
 * Branch coverage tests for SDK wrapStream method
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensSDK } from '../src/sdk.js';
import type { ProcessPromptOptions } from '../src/types.js';
import { createMockFetchResponse, createMockCompressionResponse } from './utils/helpers.js';

global.fetch = vi.fn();

// Mock providers
const mockChatStreamWithUsage = vi.fn().mockImplementation(async function* () {
  yield { content: 'Response', done: false };
  yield { 
    content: '', 
    done: true, 
    usage: { promptTokens: 50, completionTokens: 20, totalTokens: 70 } 
  };
});

const mockChatStreamWithoutUsage = vi.fn().mockImplementation(async function* () {
  yield { content: 'Response', done: false };
  yield { content: '', done: true }; // No usage
});

const mockChatStreamNoDone = vi.fn().mockImplementation(async function* () {
  yield { content: 'Response', done: false };
  // Stream ends without done=true
});

const mockProviderInstance = {
  chat: vi.fn(),
  chatStream: mockChatStreamWithUsage,
};

vi.mock('../src/providers/openai.js', () => ({
  OpenAIProvider: class {
    constructor() {
      return mockProviderInstance;
    }
  },
}));

describe('LessTokensSDK wrapStream Branch Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle stream with usage in final chunk (originalTokens > 0)', async () => {
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

    const finalChunk = chunks[chunks.length - 1];
    expect(finalChunk.done).toBe(true);
    expect(finalChunk.usage).toBeDefined();
    expect(finalChunk.usage.compressedTokens).toBe(50);
    expect(finalChunk.usage.savings).toBeGreaterThan(0);
  });

  it('should handle stream with usage in final chunk (originalTokens = 0)', async () => {
    const sdk = new LessTokensSDK({
      apiKey: 'test-key',
      provider: 'openai',
    });

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

    const finalChunk = chunks[chunks.length - 1];
    expect(finalChunk.done).toBe(true);
    if (finalChunk.usage) {
      expect(finalChunk.usage.savings).toBe(0);
    }
  });

  it('should handle stream without usage in final chunk (originalTokens > 0)', async () => {
    // Override chatStream for this test
    Object.assign(mockProviderInstance, {
      chatStream: mockChatStreamWithoutUsage,
    });

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

    const finalChunk = chunks[chunks.length - 1];
    expect(finalChunk.done).toBe(true);
    expect(finalChunk.usage).toBeDefined();
    expect(finalChunk.usage.compressedTokens).toBe(50);
  });

  it('should handle stream without usage in final chunk (originalTokens = 0)', async () => {
    // Override chatStream for this test
    Object.assign(mockProviderInstance, {
      chatStream: mockChatStreamWithoutUsage,
    });

    const sdk = new LessTokensSDK({
      apiKey: 'test-key',
      provider: 'openai',
    });

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

    const finalChunk = chunks[chunks.length - 1];
    expect(finalChunk.done).toBe(true);
    if (finalChunk.usage) {
      expect(finalChunk.usage.savings).toBe(0);
    }
  });

  it('should handle stream without lastChunk', async () => {
    // Override chatStream for this test
    Object.assign(mockProviderInstance, {
      chatStream: mockChatStreamNoDone,
    });

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

    // Should have yielded content chunks
    expect(chunks.length).toBeGreaterThan(0);
  });
});


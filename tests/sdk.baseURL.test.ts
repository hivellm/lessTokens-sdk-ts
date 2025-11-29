/**
 * Tests for SDK baseURL handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensSDK } from '../src/sdk.js';
import { createMockFetchResponse, createMockCompressionResponse } from './utils/helpers.js';

// Mock fetch
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
    yield { content: ' from', done: false };
    yield { content: ' LLM', done: false };
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

describe('LessTokensSDK baseURL handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle baseURL as string in processPrompt', async () => {
    const sdk = new LessTokensSDK({
      apiKey: 'test-key',
      provider: 'openai',
    });

    const mockCompression = createMockCompressionResponse('original', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

    const options = {
      prompt: 'original',
      llmConfig: {
        apiKey: 'llm-key',
        model: 'gpt-4',
        baseURL: 'https://custom-api.com', // String baseURL
      },
    };

    await sdk.processPrompt(options);

    expect(mockProviderInstance.chat).toHaveBeenCalled();
  });

  it('should handle baseURL as undefined in processPrompt', async () => {
    const sdk = new LessTokensSDK({
      apiKey: 'test-key',
      provider: 'openai',
    });

    const mockCompression = createMockCompressionResponse('original', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

    const options = {
      prompt: 'original',
      llmConfig: {
        apiKey: 'llm-key',
        model: 'gpt-4',
        // baseURL not provided (undefined)
      },
    };

    await sdk.processPrompt(options);

    expect(mockProviderInstance.chat).toHaveBeenCalled();
  });

  it('should handle baseURL as string in processPromptStream', async () => {
    const sdk = new LessTokensSDK({
      apiKey: 'test-key',
      provider: 'openai',
    });

    const mockCompression = createMockCompressionResponse('original', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

    const options = {
      prompt: 'original',
      llmConfig: {
        apiKey: 'llm-key',
        model: 'gpt-4',
        baseURL: 'https://custom-api.com', // String baseURL
      },
    };

    const stream = await sdk.processPromptStream(options);

    // Consume stream
    for await (const _chunk of stream) {
      // Just consume
    }

    expect(mockProviderInstance.chatStream).toHaveBeenCalled();
  });

  it('should handle baseURL as undefined in processPromptStream', async () => {
    const sdk = new LessTokensSDK({
      apiKey: 'test-key',
      provider: 'openai',
    });

    const mockCompression = createMockCompressionResponse('original', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

    const options = {
      prompt: 'original',
      llmConfig: {
        apiKey: 'llm-key',
        model: 'gpt-4',
        // baseURL not provided (undefined)
      },
    };

    const stream = await sdk.processPromptStream(options);

    // Consume stream
    for await (const _chunk of stream) {
      // Just consume
    }

    expect(mockProviderInstance.chatStream).toHaveBeenCalled();
  });
});




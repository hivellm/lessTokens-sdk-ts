/**
 * Tests for SDK messages array handling
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

describe('LessTokensSDK Messages Array', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processPrompt with messages', () => {
    it('should include messages array when provided', async () => {
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
        },
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello!' },
        ],
      };

      await sdk.processPrompt(options);

      // Verify that chat was called with messages array
      expect(mockProviderInstance.chat).toHaveBeenCalledWith(
        expect.arrayContaining([
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello!' },
          { role: 'user', content: 'compressed' },
        ]),
        expect.any(Object)
      );
    });

    it('should handle empty messages array', async () => {
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
        },
        messages: [],
      };

      await sdk.processPrompt(options);

      // Should only have the compressed prompt message
      expect(mockProviderInstance.chat).toHaveBeenCalledWith(
        [{ role: 'user', content: 'compressed' }],
        expect.any(Object)
      );
    });
  });

  describe('processPromptStream with messages', () => {
    it('should include messages array when provided in stream', async () => {
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
        },
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello!' },
        ],
      };

      const stream = await sdk.processPromptStream(options);
      
      // Consume stream
      for await (const _chunk of stream) {
        // Just consume
      }

      // Verify that chatStream was called with messages array
      expect(mockProviderInstance.chatStream).toHaveBeenCalledWith(
        expect.arrayContaining([
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello!' },
          { role: 'user', content: 'compressed' },
        ]),
        expect.any(Object)
      );
    });

    it('should handle empty messages array in stream', async () => {
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
        },
        messages: [],
      };

      const stream = await sdk.processPromptStream(options);
      
      // Consume stream
      for await (const _chunk of stream) {
        // Just consume
      }

      // Should only have the compressed prompt message
      expect(mockProviderInstance.chatStream).toHaveBeenCalledWith(
        [{ role: 'user', content: 'compressed' }],
        expect.any(Object)
      );
    });
  });
});



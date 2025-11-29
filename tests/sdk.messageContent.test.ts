/**
 * Tests for SDK messageContent handling (function vs string)
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

describe('LessTokensSDK messageContent handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processPrompt with messageContent', () => {
    it('should use messageContent as function', async () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });

      const mockCompression = createMockCompressionResponse('original', 'compressed', 100, 50);
      vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

      const messageContentFn = vi.fn((compressed) => {
        return `Custom: ${compressed.compressed}`;
      });

      const options = {
        prompt: 'original',
        llmConfig: {
          apiKey: 'llm-key',
          model: 'gpt-4',
        },
        messageContent: messageContentFn,
      };

      await sdk.processPrompt(options);

      expect(messageContentFn).toHaveBeenCalledWith(mockCompression);
      expect(mockProviderInstance.chat).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Custom: compressed' }],
        expect.any(Object)
      );
    });

    it('should use messageContent as string', async () => {
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
        messageContent: 'Custom static content',
      };

      await sdk.processPrompt(options);

      expect(mockProviderInstance.chat).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Custom static content' }],
        expect.any(Object)
      );
    });

    it('should use default compressed content when messageContent is undefined', async () => {
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
        // messageContent not provided
      };

      await sdk.processPrompt(options);

      expect(mockProviderInstance.chat).toHaveBeenCalledWith(
        [{ role: 'user', content: 'compressed' }],
        expect.any(Object)
      );
    });
  });

  describe('processPromptStream with messageContent', () => {
    it('should use messageContent as function in stream', async () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });

      const mockCompression = createMockCompressionResponse('original', 'compressed', 100, 50);
      vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

      const messageContentFn = vi.fn((compressed) => {
        return `Custom: ${compressed.compressed}`;
      });

      const options = {
        prompt: 'original',
        llmConfig: {
          apiKey: 'llm-key',
          model: 'gpt-4',
        },
        messageContent: messageContentFn,
      };

      const stream = await sdk.processPromptStream(options);
      
      // Consume stream
      for await (const _chunk of stream) {
        // Just consume
      }

      expect(messageContentFn).toHaveBeenCalledWith(mockCompression);
      expect(mockProviderInstance.chatStream).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Custom: compressed' }],
        expect.any(Object)
      );
    });

    it('should use messageContent as string in stream', async () => {
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
        messageContent: 'Custom static content',
      };

      const stream = await sdk.processPromptStream(options);
      
      // Consume stream
      for await (const _chunk of stream) {
        // Just consume
      }

      expect(mockProviderInstance.chatStream).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Custom static content' }],
        expect.any(Object)
      );
    });

    it('should use default compressed content when messageContent is undefined in stream', async () => {
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
        // messageContent not provided
      };

      const stream = await sdk.processPromptStream(options);
      
      // Consume stream
      for await (const _chunk of stream) {
        // Just consume
      }

      expect(mockProviderInstance.chatStream).toHaveBeenCalledWith(
        [{ role: 'user', content: 'compressed' }],
        expect.any(Object)
      );
    });
  });
});




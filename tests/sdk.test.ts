/**
 * Tests for LessTokensSDK
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensSDK } from '../src/sdk.js';
import { ErrorCodes } from '../src/errors.js';
import type { ProcessPromptOptions } from '../src/types.js';
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

describe('LessTokensSDK', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create SDK with valid config', () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });
      expect(sdk).toBeInstanceOf(LessTokensSDK);
    });

    it('should throw error for invalid config', () => {
      expect(() => {
        new LessTokensSDK({
          apiKey: '',
          provider: 'openai',
        } as any);
      }).toThrow();
    });
  });

  describe('processPrompt', () => {
    it('should process prompt successfully', async () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });

      const mockCompression = createMockCompressionResponse('original prompt', 'compressed prompt', 100, 50);
      vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

      const options: ProcessPromptOptions = {
        prompt: 'original prompt',
        llmConfig: {
          apiKey: 'llm-key',
          model: 'gpt-4',
        },
      };

      const result = await sdk.processPrompt(options);

      expect(result.content).toBe('Response from LLM');
      expect(result.usage.compressedTokens).toBe(50);
      expect(result.usage.savings).toBeDefined();
      expect(result.metadata?.compressionRatio).toBeDefined();
    });

    it('should throw error for invalid options', async () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });

      await expect(
        sdk.processPrompt({
          prompt: '',
          llmConfig: {
            apiKey: 'llm-key',
            model: 'gpt-4',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('processPromptStream', () => {
    it('should stream prompt processing', async () => {
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
      const chunks: string[] = [];
      let finalChunk: any;

      for await (const chunk of stream) {
        if (chunk.done) {
          finalChunk = chunk;
        } else {
          chunks.push(chunk.content);
        }
      }

      expect(chunks.join('')).toBe('Response from LLM');
      expect(finalChunk).toBeDefined();
      expect(finalChunk.done).toBe(true);
      expect(finalChunk.usage).toBeDefined();
      expect(finalChunk.usage.compressedTokens).toBe(50);
    });
  });

  describe('compressPrompt', () => {
    it('should compress prompt only', async () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });

      const mockCompression = createMockCompressionResponse('original', 'compressed', 100, 50);
      vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockCompression));

      const result = await sdk.compressPrompt('original');

      expect(result.compressed).toBe('compressed');
      expect(result.originalTokens).toBe(100);
      expect(result.compressedTokens).toBe(50);
      expect(result.savings).toBe(50);
    });

    it('should throw error for invalid prompt', async () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });

      await expect(sdk.compressPrompt('')).rejects.toThrow();
    });
  });
});

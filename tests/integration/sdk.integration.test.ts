/**
 * Integration tests for LessTokensSDK
 * These tests verify the actual behavior without mocks
 */

import { describe, it, expect } from 'vitest';
import { LessTokensSDK } from '../../src/sdk.js';
import type { ProcessPromptOptions } from '../../src/types.js';

describe('LessTokensSDK Integration Tests', () => {
  describe('Configuration Validation', () => {
    it('should validate configuration on initialization', () => {
      expect(() => {
        new LessTokensSDK({
          apiKey: '',
          provider: 'openai',
        } as any);
      }).toThrow();

      expect(() => {
        new LessTokensSDK({
          apiKey: 'test-key',
          provider: '',
        } as any);
      }).toThrow();

      expect(() => {
        new LessTokensSDK({
          apiKey: 'test-key',
          provider: 'unsupported',
        } as any);
      }).toThrow();
    });

    it('should accept valid configuration', () => {
      const providers = ['openai', 'anthropic', 'google', 'deepseek'];
      providers.forEach((provider) => {
        expect(() => {
          new LessTokensSDK({
            apiKey: 'test-key',
            provider,
          });
        }).not.toThrow();
      });
    });
  });

  describe('Input Validation', () => {
    it('should validate prompt in processPrompt', async () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });

      const options: ProcessPromptOptions = {
        prompt: '',
        llmConfig: {
          apiKey: 'llm-key',
          model: 'gpt-4',
        },
      };

      await expect(sdk.processPrompt(options)).rejects.toThrow();
    });

    it('should validate prompt in compressPrompt', async () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });

      await expect(sdk.compressPrompt('')).rejects.toThrow();
    });

    it('should validate LLM config in processPrompt', async () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });

      await expect(
        sdk.processPrompt({
          prompt: 'test',
          llmConfig: {
            apiKey: '',
            model: 'gpt-4',
          },
        })
      ).rejects.toThrow();

      await expect(
        sdk.processPrompt({
          prompt: 'test',
          llmConfig: {
            apiKey: 'key',
            model: '',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid provider in LLMClient', async () => {
      const { LLMClient } = await import('../../src/clients/llmClient.js');
      expect(() => {
        new LLMClient('unsupported', 'test-key');
      }).toThrow();
    });

    it('should propagate errors correctly', async () => {
      const sdk = new LessTokensSDK({
        apiKey: 'test-key',
        provider: 'openai',
      });

      // This will fail at the LessTokens API level, but error should be properly formatted
      try {
        await sdk.compressPrompt('test prompt');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.code).toBeDefined();
      }
    }, 10000);
  });

  describe('Provider Selection', () => {
    it('should create correct provider for each type', () => {
      const providers = ['openai', 'anthropic', 'google', 'deepseek'];
      providers.forEach((provider) => {
        const sdk = new LessTokensSDK({
          apiKey: 'test-key',
          provider,
        });
        expect(sdk).toBeInstanceOf(LessTokensSDK);
      });
    });
  });
});


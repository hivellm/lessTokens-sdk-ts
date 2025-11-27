/**
 * Integration tests for validation utilities
 * Tests actual validation behavior without mocks
 */

import { describe, it, expect } from 'vitest';
import {
  validateConfig,
  validatePrompt,
  validateLLMConfig,
  validateProcessPromptOptions,
} from '../../src/utils/validation.js';
import { ErrorCodes } from '../../src/errors.js';
import type { LessTokensConfig, LLMConfig, ProcessPromptOptions } from '../../src/types.js';

describe('Validation Integration Tests', () => {
  describe('validateConfig', () => {
    it('should validate real configuration objects', () => {
      const validConfig: LessTokensConfig = {
        apiKey: 'sk-test-1234567890',
        provider: 'openai',
        baseUrl: 'https://api.lesstokens.com',
        timeout: 30000,
      };

      expect(() => validateConfig(validConfig)).not.toThrow();
    });

    it('should reject invalid API keys', () => {
      const invalidConfigs = [
        { apiKey: '', provider: 'openai' },
        { apiKey: '   ', provider: 'openai' },
        { apiKey: null as any, provider: 'openai' },
        { apiKey: undefined as any, provider: 'openai' },
      ];

      invalidConfigs.forEach((config) => {
        try {
          validateConfig(config as LessTokensConfig);
          expect.fail('Should have thrown error');
        } catch (error: any) {
          expect(error.code).toBe(ErrorCodes.INVALID_API_KEY);
        }
      });
    });

    it('should validate all supported providers', () => {
      const providers = ['openai', 'anthropic', 'google', 'deepseek'];
      providers.forEach((provider) => {
        expect(() => {
          validateConfig({
            apiKey: 'test-key',
            provider,
          });
        }).not.toThrow();
      });
    });
  });

  describe('validatePrompt', () => {
    it('should validate real prompts', () => {
      const validPrompts = [
        'Hello, world!',
        'A'.repeat(1000),
        'A'.repeat(999999), // Just under limit
        'Multi-line\nprompt\nwith\nnewlines',
        'Prompt with special chars: !@#$%^&*()',
      ];

      validPrompts.forEach((prompt) => {
        expect(() => validatePrompt(prompt)).not.toThrow();
      });
    });

    it('should reject invalid prompts', () => {
      const invalidPrompts: any[] = [
        '',
        'A'.repeat(1_000_001), // Over limit
        null,
        undefined,
        123,
        {},
      ];

      invalidPrompts.forEach((prompt) => {
        try {
          validatePrompt(prompt);
          expect.fail(`Should have thrown error for: ${typeof prompt}`);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe('validateLLMConfig', () => {
    it('should validate real LLM configurations', () => {
      const validConfigs: LLMConfig[] = [
        {
          apiKey: 'sk-test',
          model: 'gpt-4',
        },
        {
          apiKey: 'sk-test',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 100,
        },
        {
          apiKey: 'sk-test',
          model: 'claude-3-opus-20240229',
          topP: 0.9,
          stop: ['stop'],
        },
      ];

      validConfigs.forEach((config) => {
        expect(() => validateLLMConfig(config)).not.toThrow();
      });
    });

    it('should reject invalid LLM configurations', () => {
      const invalidConfigs = [
        { model: 'gpt-4' }, // Missing apiKey
        { apiKey: 'sk-test' }, // Missing model
        { apiKey: '', model: 'gpt-4' }, // Empty apiKey
        { apiKey: 'sk-test', model: '' }, // Empty model
      ];

      invalidConfigs.forEach((config) => {
        expect(() => validateLLMConfig(config as LLMConfig)).toThrow();
      });
    });
  });

  describe('validateProcessPromptOptions', () => {
    it('should validate complete options', () => {
      const validOptions: ProcessPromptOptions = {
        prompt: 'Test prompt',
        llmConfig: {
          apiKey: 'sk-test',
          model: 'gpt-4',
        },
        compressionOptions: {
          targetRatio: 0.5,
          preserveContext: true,
          aggressive: false,
        },
      };

      expect(() => validateProcessPromptOptions(validOptions)).not.toThrow();
    });

    it('should validate options without compression options', () => {
      const validOptions: ProcessPromptOptions = {
        prompt: 'Test prompt',
        llmConfig: {
          apiKey: 'sk-test',
          model: 'gpt-4',
        },
      };

      expect(() => validateProcessPromptOptions(validOptions)).not.toThrow();
    });

    it('should reject invalid options', () => {
      const invalidOptions = [
        { prompt: '', llmConfig: { apiKey: 'sk-test', model: 'gpt-4' } },
        { prompt: 'test', llmConfig: { apiKey: '', model: 'gpt-4' } },
        { prompt: 'test', llmConfig: { apiKey: 'sk-test', model: '' } },
      ];

      invalidOptions.forEach((options) => {
        expect(() => validateProcessPromptOptions(options as ProcessPromptOptions)).toThrow();
      });
    });
  });
});


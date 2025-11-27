/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import { validateConfig, validatePrompt, validateProcessPromptOptions, validateLLMConfig } from '../../src/utils/validation.js';
import { ErrorCodes } from '../../src/errors.js';
import type { LessTokensConfig, ProcessPromptOptions, LLMConfig } from '../../src/types.js';

describe('validateConfig', () => {
  it('should validate valid configuration', () => {
    const config: LessTokensConfig = {
      apiKey: 'test-api-key',
      provider: 'openai',
    };
    expect(() => validateConfig(config)).not.toThrow();
  });

  it('should throw error for missing API key', () => {
    const config = { provider: 'openai' } as LessTokensConfig;
    expect(() => validateConfig(config)).toThrow();
    try {
      validateConfig(config);
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_API_KEY);
    }
  });

  it('should throw error for empty API key', () => {
    const config: LessTokensConfig = {
      apiKey: '',
      provider: 'openai',
    };
    expect(() => validateConfig(config)).toThrow();
  });

  it('should throw error for missing provider', () => {
    const config = { apiKey: 'test-key' } as LessTokensConfig;
    expect(() => validateConfig(config)).toThrow();
    try {
      validateConfig(config);
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_PROVIDER);
    }
  });

  it('should throw error for unsupported provider', () => {
    const config: LessTokensConfig = {
      apiKey: 'test-key',
      provider: 'unsupported',
    };
    expect(() => validateConfig(config)).toThrow();
    try {
      validateConfig(config);
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_PROVIDER);
    }
  });

  it('should accept all supported providers', () => {
    const providers = ['openai', 'anthropic', 'google', 'deepseek'];
    providers.forEach((provider) => {
      const config: LessTokensConfig = {
        apiKey: 'test-key',
        provider,
      };
      expect(() => validateConfig(config)).not.toThrow();
    });
  });

  it('should throw error for invalid timeout', () => {
    const config: LessTokensConfig = {
      apiKey: 'test-key',
      provider: 'openai',
      timeout: -1,
    };
    expect(() => validateConfig(config)).toThrow();
  });
});

describe('validatePrompt', () => {
  it('should validate valid prompt', () => {
    expect(() => validatePrompt('Hello, world!')).not.toThrow();
  });

  it('should throw error for non-string prompt', () => {
    expect(() => validatePrompt(123 as unknown as string)).toThrow();
  });

  it('should throw error for empty prompt', () => {
    expect(() => validatePrompt('')).toThrow();
  });

  it('should throw error for prompt exceeding max size', () => {
    const largePrompt = 'a'.repeat(1_000_001);
    expect(() => validatePrompt(largePrompt)).toThrow();
  });
});

describe('validateLLMConfig', () => {
  it('should validate valid LLM config', () => {
    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gpt-4',
    };
    expect(() => validateLLMConfig(config)).not.toThrow();
  });

  it('should throw error for missing API key', () => {
    const config = { model: 'gpt-4' } as LLMConfig;
    expect(() => validateLLMConfig(config)).toThrow();
  });

  it('should throw error for missing model', () => {
    const config = { apiKey: 'test-key' } as LLMConfig;
    expect(() => validateLLMConfig(config)).toThrow();
  });
});

describe('validateProcessPromptOptions', () => {
  it('should validate valid options', () => {
    const options: ProcessPromptOptions = {
      prompt: 'Hello',
      llmConfig: {
        apiKey: 'test-key',
        model: 'gpt-4',
      },
    };
    expect(() => validateProcessPromptOptions(options)).not.toThrow();
  });

  it('should throw error for invalid prompt', () => {
    const options: ProcessPromptOptions = {
      prompt: '',
      llmConfig: {
        apiKey: 'test-key',
        model: 'gpt-4',
      },
    };
    expect(() => validateProcessPromptOptions(options)).toThrow();
  });

  it('should throw error for missing LLM config', () => {
    const options = { prompt: 'Hello' } as ProcessPromptOptions;
    expect(() => validateProcessPromptOptions(options)).toThrow();
  });
});


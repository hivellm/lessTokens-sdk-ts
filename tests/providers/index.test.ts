/**
 * Tests for provider factory
 */

import { describe, it, expect } from 'vitest';
import { createProvider } from '../../src/providers/index.js';
import { ErrorCodes } from '../../src/errors.js';

// Mock all providers
const mockProviderInstance = {};

vi.mock('../../src/providers/openai.js', () => ({
  OpenAIProvider: class {
    constructor() {
      return mockProviderInstance;
    }
  },
}));

vi.mock('../../src/providers/anthropic.js', () => ({
  AnthropicProvider: class {
    constructor() {
      return mockProviderInstance;
    }
  },
}));

vi.mock('../../src/providers/google.js', () => ({
  GoogleProvider: class {
    constructor() {
      return mockProviderInstance;
    }
  },
}));

vi.mock('../../src/providers/deepseek.js', () => ({
  DeepSeekProvider: class {
    constructor() {
      return mockProviderInstance;
    }
  },
}));

describe('createProvider', () => {
  it('should create OpenAI provider', () => {
    const provider = createProvider('openai', 'test-key');
    expect(provider).toBeDefined();
  });

  it('should create Anthropic provider', () => {
    const provider = createProvider('anthropic', 'test-key');
    expect(provider).toBeDefined();
  });

  it('should create Google provider', () => {
    const provider = createProvider('google', 'test-key');
    expect(provider).toBeDefined();
  });

  it('should create DeepSeek provider', () => {
    const provider = createProvider('deepseek', 'test-key');
    expect(provider).toBeDefined();
  });

  it('should handle case-insensitive provider names', () => {
    expect(() => createProvider('OPENAI', 'test-key')).not.toThrow();
    expect(() => createProvider('Anthropic', 'test-key')).not.toThrow();
  });

  it('should throw error for unsupported provider', () => {
    expect(() => {
      createProvider('unsupported', 'test-key');
    }).toThrow();
  });

  it('should throw error with correct error code', () => {
    try {
      createProvider('unsupported', 'test-key');
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_PROVIDER);
    }
  });
});


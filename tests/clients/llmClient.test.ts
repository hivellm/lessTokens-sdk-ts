/**
 * Tests for LLMClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMClient } from '../../src/clients/llmClient.js';
import type { LLMConfig } from '../../src/types.js';

// Mock providers
const mockProviderInstance = {
  chat: vi.fn().mockResolvedValue({
    content: 'Response',
    usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    metadata: { model: 'gpt-4', provider: 'openai', timestamp: new Date().toISOString() },
  }),
  chatStream: vi.fn().mockImplementation(async function* () {
    yield { content: 'Response', done: false };
    yield { content: '', done: true };
  }),
};

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

describe('LLMClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create client for OpenAI', () => {
      const client = new LLMClient('openai', 'test-key');
      expect(client).toBeInstanceOf(LLMClient);
    });

    it('should create client for Anthropic', () => {
      const client = new LLMClient('anthropic', 'test-key');
      expect(client).toBeInstanceOf(LLMClient);
    });

    it('should create client for Google', () => {
      const client = new LLMClient('google', 'test-key');
      expect(client).toBeInstanceOf(LLMClient);
    });

    it('should create client for DeepSeek', () => {
      const client = new LLMClient('deepseek', 'test-key');
      expect(client).toBeInstanceOf(LLMClient);
    });

    it('should throw error for unsupported provider', () => {
      expect(() => {
        new LLMClient('unsupported', 'test-key');
      }).toThrow();
    });
  });

  describe('chat', () => {
    it('should send chat request', async () => {
      const client = new LLMClient('openai', 'test-key');
      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gpt-4',
      };

      const result = await client.chat([{ role: 'user', content: 'Hello' }], config);

      expect(result.content).toBe('Response');
      expect(result.usage).toBeDefined();
    });
  });

  describe('chatStream', () => {
    it('should stream chat request', async () => {
      const client = new LLMClient('openai', 'test-key');
      const config: LLMConfig = {
        apiKey: 'test-key',
        model: 'gpt-4',
      };

      const stream = await client.chatStream([{ role: 'user', content: 'Hello' }], config);
      const chunks: string[] = [];

      for await (const chunk of stream) {
        if (!chunk.done) {
          chunks.push(chunk.content);
        }
      }

      expect(chunks.join('')).toBe('Response');
    });
  });
});


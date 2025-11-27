/**
 * Edge case tests for DeepSeek provider streaming
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeepSeekProvider } from '../../src/providers/deepseek.js';
import type { LLMConfig } from '../../src/types.js';

// Mock OpenAI SDK (DeepSeek uses OpenAI SDK)
const mockCreate = vi.fn();
const mockCompletions = {
  create: mockCreate,
};
const mockChat = {
  completions: mockCompletions,
};
const mockClient = {
  chat: mockChat,
};

vi.mock('openai', () => {
  class MockOpenAI {
    constructor() {
      return mockClient;
    }
  }
  return {
    default: MockOpenAI,
  };
});

describe('DeepSeekProvider Streaming Edge Cases', () => {
  let provider: DeepSeekProvider;

  beforeEach(() => {
    provider = new DeepSeekProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle stream with usage in chunk', async () => {
    const mockChunks = [
      { choices: [{ delta: { content: 'Hello' } }] },
      { 
        choices: [{ delta: { content: ', ' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      },
      { choices: [{ delta: { content: 'world!' } }] },
    ];

    const asyncGenerator = async function* () {
      for (const chunk of mockChunks) {
        yield chunk;
      }
    };

    mockCreate.mockResolvedValueOnce(asyncGenerator());

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'deepseek-chat',
    };

    const stream = await provider.chatStream([{ role: 'user', content: 'Hello' }], config);
    const chunks: any[] = [];
    let finalChunk: any;

    for await (const chunk of stream) {
      if (chunk.done) {
        finalChunk = chunk;
      } else {
        chunks.push(chunk);
      }
    }

    expect(chunks.length).toBeGreaterThan(0);
    expect(finalChunk).toBeDefined();
    expect(finalChunk.done).toBe(true);
    expect(finalChunk.usage).toBeDefined();
  });

  it('should handle stream chunks without delta content', async () => {
    const mockChunks = [
      { choices: [{ delta: {} }] }, // No content
      { choices: [{ delta: { content: 'Hello' } }] },
    ];

    const asyncGenerator = async function* () {
      for (const chunk of mockChunks) {
        yield chunk;
      }
    };

    mockCreate.mockResolvedValueOnce(asyncGenerator());

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'deepseek-chat',
    };

    const stream = await provider.chatStream([{ role: 'user', content: 'Hello' }], config);
    const chunks: any[] = [];

    for await (const chunk of stream) {
      if (!chunk.done) {
        chunks.push(chunk);
      }
    }

    expect(chunks.some((c) => c.content === 'Hello')).toBe(true);
  });
});


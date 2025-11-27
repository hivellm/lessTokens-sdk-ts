/**
 * Edge case tests for OpenAI provider streaming
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from '../../src/providers/openai.js';
import type { LLMConfig } from '../../src/types.js';

// Create a mock OpenAI client
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

describe('OpenAIProvider Streaming Edge Cases', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle stream chunks without usage', async () => {
    const mockChunks = [
      { choices: [{ delta: { content: 'Hello' } }] },
      { choices: [{ delta: { content: ', ' } }] },
      { choices: [{ delta: { content: 'world!' } }] },
      // No usage in any chunk
    ];

    const asyncGenerator = async function* () {
      for (const chunk of mockChunks) {
        yield chunk;
      }
    };

    mockCreate.mockResolvedValueOnce(asyncGenerator());

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gpt-4',
    };

    const stream = await provider.chatStream([{ role: 'user', content: 'Hello' }], config);
    const chunks: any[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
    const finalChunk = chunks[chunks.length - 1];
    expect(finalChunk.done).toBe(true);
  });

  it('should handle stream with usage in middle chunk', async () => {
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
      model: 'gpt-4',
    };

    const stream = await provider.chatStream([{ role: 'user', content: 'Hello' }], config);
    const chunks: any[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
  });
});


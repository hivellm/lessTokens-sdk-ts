/**
 * Branch coverage tests for OpenAI provider
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

describe('OpenAIProvider Branch Coverage', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle response with undefined usage', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Response' } }],
      usage: undefined,
      model: 'gpt-4',
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gpt-4',
    };

    const result = await provider.chat([{ role: 'user', content: 'test' }], config);

    expect(result.content).toBe('Response');
    expect(result.usage.promptTokens).toBe(0);
    expect(result.usage.completionTokens).toBe(0);
  });

  it('should handle response with partial usage (prompt_tokens only)', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Response' } }],
      usage: {
        prompt_tokens: 10,
        // completion_tokens missing
      },
      model: 'gpt-4',
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gpt-4',
    };

    const result = await provider.chat([{ role: 'user', content: 'test' }], config);

    expect(result.usage.promptTokens).toBe(10);
    expect(result.usage.completionTokens).toBe(0);
  });

  it('should handle stream with usage but undefined values', async () => {
    const mockChunks = [
      { choices: [{ delta: { content: 'Hello' } }] },
      { 
        choices: [{ delta: { content: ', ' } }],
        usage: {
          prompt_tokens: undefined,
          completion_tokens: undefined,
          total_tokens: undefined,
        },
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


/**
 * Branch coverage tests for Google provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleProvider } from '../../src/providers/google.js';
import type { LLMConfig } from '../../src/types.js';

// Mock Google GenAI SDK
const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();
const mockModels = {
  generateContent: mockGenerateContent,
  generateContentStream: mockGenerateContentStream,
};
const mockClient = {
  models: mockModels,
};

vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    constructor() {
      return mockClient;
    }
  }
  return {
    GoogleGenAI: MockGoogleGenAI,
  };
});

describe('GoogleProvider Branch Coverage', () => {
  let provider: GoogleProvider;

  beforeEach(() => {
    provider = new GoogleProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle response with undefined usageMetadata', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Response' }],
          },
        },
      ],
      usageMetadata: undefined,
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
    };

    const result = await provider.chat([{ role: 'user', content: 'test' }], config);

    expect(result.content).toBe('Response');
    expect(result.usage.promptTokens).toBe(0);
    expect(result.usage.completionTokens).toBe(0);
  });

  it('should handle response with partial usageMetadata (promptTokenCount only)', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Response' }],
          },
        },
      ],
      usageMetadata: {
        promptTokenCount: 10,
        // candidatesTokenCount missing
      },
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
    };

    const result = await provider.chat([{ role: 'user', content: 'test' }], config);

    expect(result.usage.promptTokens).toBe(10);
    expect(result.usage.completionTokens).toBe(0);
  });

  it('should handle stream with empty candidates array', async () => {
    const mockChunks = [
      { candidates: [] },
      { candidates: [{ content: { parts: [{ text: 'Hello' }] } }] },
    ];

    const asyncGenerator = async function* () {
      for (const chunk of mockChunks) {
        yield chunk;
      }
    };

    mockGenerateContentStream.mockResolvedValueOnce(asyncGenerator());

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
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


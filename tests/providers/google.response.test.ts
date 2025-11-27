/**
 * Edge case tests for Google provider response handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleProvider } from '../../src/providers/google.js';
import type { LLMConfig } from '../../src/types.js';

// Mock Google GenAI SDK
const mockGenerateContent = vi.fn();
const mockModels = {
  generateContent: mockGenerateContent,
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

describe('GoogleProvider Response Edge Cases', () => {
  let provider: GoogleProvider;

  beforeEach(() => {
    provider = new GoogleProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle response with multiple candidates', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'First response' }],
          },
        },
        {
          content: {
            parts: [{ text: 'Second response' }],
          },
        },
      ],
      usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 5,
      },
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
    };

    const result = await provider.chat([{ role: 'user', content: 'test' }], config);

    expect(result.content).toBe('First response');
  });

  it('should handle response with multiple parts', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [
              { text: 'Hello' },
              { text: ', ' },
              { text: 'world!' },
            ],
          },
        },
      ],
      usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 5,
      },
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
    };

    const result = await provider.chat([{ role: 'user', content: 'test' }], config);

    expect(result.content).toBe('Hello, world!');
  });

  it('should handle response without usageMetadata', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Response' }],
          },
        },
      ],
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
});


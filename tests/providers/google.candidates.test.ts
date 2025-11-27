/**
 * Candidates handling tests for Google provider to improve branch coverage
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

describe('GoogleProvider Candidates Handling', () => {
  let provider: GoogleProvider;

  beforeEach(() => {
    provider = new GoogleProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle response with no candidates', async () => {
    const mockResponse = {
      candidates: [],
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

    expect(result.content).toBe('');
  });

  it('should handle response with candidate but no content', async () => {
    const mockResponse = {
      candidates: [{}],
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

    expect(result.content).toBe('');
  });

  it('should handle response with content but no parts', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {},
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

    expect(result.content).toBe('');
  });
});


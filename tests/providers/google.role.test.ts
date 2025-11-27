/**
 * Role conversion tests for Google provider to improve branch coverage
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

describe('GoogleProvider Role Conversion', () => {
  let provider: GoogleProvider;

  beforeEach(() => {
    provider = new GoogleProvider('test-key');
    vi.clearAllMocks();
  });

  it('should convert assistant role to model in chat', async () => {
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
        candidatesTokenCount: 5,
      },
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
    };

    await provider.chat(
      [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' },
        { role: 'user', content: 'How are you?' },
      ],
      config
    );

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: expect.arrayContaining([
          expect.objectContaining({ role: 'user' }),
          expect.objectContaining({ role: 'model' }), // assistant -> model
          expect.objectContaining({ role: 'user' }),
        ]),
      })
    );
  });

  it('should convert assistant role to model in chatStream', async () => {
    const mockChunks = [
      { candidates: [{ content: { parts: [{ text: 'Response' }] } }] },
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

    await provider.chatStream(
      [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' },
      ],
      config
    );

    expect(mockGenerateContentStream).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: expect.arrayContaining([
          expect.objectContaining({ role: 'user' }),
          expect.objectContaining({ role: 'model' }), // assistant -> model
        ]),
      })
    );
  });

  it('should keep user role as user (not assistant)', async () => {
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
        candidatesTokenCount: 5,
      },
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
    };

    await provider.chat([{ role: 'user', content: 'Hello' }], config);

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: expect.arrayContaining([
          expect.objectContaining({ role: 'user' }), // user stays as user
        ]),
      })
    );
  });
});


/**
 * Text extraction tests for Google provider streaming to improve branch coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleProvider } from '../../src/providers/google.js';
import type { LLMConfig } from '../../src/types.js';

// Mock Google GenAI SDK
const mockGenerateContentStream = vi.fn();
const mockModels = {
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

describe('GoogleProvider Stream Text Extraction', () => {
  let provider: GoogleProvider;

  beforeEach(() => {
    provider = new GoogleProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle stream chunk with text property (not candidates path)', async () => {
    const mockChunks = [
      { text: 'Hello' },
      { text: ', ' },
      { text: 'world!' },
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
    const chunks: string[] = [];

    for await (const chunk of stream) {
      if (!chunk.done) {
        chunks.push(chunk.content);
      }
    }

    expect(chunks.join('')).toBe('Hello, world!');
  });

  it('should handle stream chunk with candidates path (not text path)', async () => {
    const mockChunks = [
      { candidates: [{ content: { parts: [{ text: 'Hello' }] } }] },
      { candidates: [{ content: { parts: [{ text: ', ' }] } }] },
      { candidates: [{ content: { parts: [{ text: 'world!' }] } }] },
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
    const chunks: string[] = [];

    for await (const chunk of stream) {
      if (!chunk.done) {
        chunks.push(chunk.content);
      }
    }

    expect(chunks.join('')).toBe('Hello, world!');
  });
});


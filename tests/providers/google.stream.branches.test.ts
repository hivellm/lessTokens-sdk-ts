/**
 * Branch coverage tests for Google provider streaming
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

describe('GoogleProvider Streaming Branch Coverage', () => {
  let provider: GoogleProvider;

  beforeEach(() => {
    provider = new GoogleProvider('test-key');
    vi.clearAllMocks();
  });

  it('should handle stream chunk with text property directly', async () => {
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

  it('should handle stream chunk with candidates but no parts', async () => {
    const mockChunks = [
      { candidates: [{ content: {} }] }, // No parts
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
    const chunks: string[] = [];

    for await (const chunk of stream) {
      if (!chunk.done) {
        chunks.push(chunk.content);
      }
    }

    expect(chunks.some((c) => c === 'Hello')).toBe(true);
  });

  it('should handle stream chunk with parts but no text', async () => {
    const mockChunks = [
      { candidates: [{ content: { parts: [{}] } }] }, // No text
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
    const chunks: string[] = [];

    for await (const chunk of stream) {
      if (!chunk.done) {
        chunks.push(chunk.content);
      }
    }

    expect(chunks.some((c) => c === 'Hello')).toBe(true);
  });
});


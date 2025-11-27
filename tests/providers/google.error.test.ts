/**
 * Error handling tests for Google provider to improve branch coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleProvider } from '../../src/providers/google.js';
import { ErrorCodes } from '../../src/errors.js';
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

describe('GoogleProvider Error Handling', () => {
  let provider: GoogleProvider;

  beforeEach(() => {
    provider = new GoogleProvider('test-key');
    vi.clearAllMocks();
  });

  it('should re-throw LessTokensError from chat', async () => {
    const { createError, ErrorCodes: EC } = await import('../../src/errors.js');
    const customError = createError(EC.INVALID_API_KEY, 'Custom error');

    mockGenerateContent.mockRejectedValueOnce(customError);

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
    };

    await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.INVALID_API_KEY,
    });
  });

  it('should handle non-Error exception in chat', async () => {
    mockGenerateContent.mockRejectedValueOnce('string error');

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
    };

    await expect(provider.chat([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });

  it('should handle error in chatStream', async () => {
    mockGenerateContentStream.mockRejectedValueOnce(new Error('Stream error'));

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
    };

    await expect(provider.chatStream([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });

  it('should handle non-Error exception in chatStream', async () => {
    mockGenerateContentStream.mockRejectedValueOnce('string error');

    const config: LLMConfig = {
      apiKey: 'test-key',
      model: 'gemini-2.0-flash',
    };

    await expect(provider.chatStream([{ role: 'user', content: 'test' }], config)).rejects.toMatchObject({
      code: ErrorCodes.LLM_API_ERROR,
    });
  });
});


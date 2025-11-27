/**
 * Test helpers and utilities
 */

import type { CompressedPrompt } from '../../src/types.js';

/**
 * Mock LessTokens API response
 */
export function createMockCompressionResponse(
  original: string,
  compressed: string = original,
  originalTokens: number = 100,
  compressedTokens: number = 50
): CompressedPrompt {
  const savings = originalTokens > 0
    ? ((originalTokens - compressedTokens) / originalTokens) * 100
    : 0;
  const ratio = originalTokens > 0
    ? compressedTokens / originalTokens
    : 1.0;

  return {
    compressed,
    originalTokens,
    compressedTokens,
    savings,
    ratio,
  };
}

/**
 * Mock fetch response
 */
export function createMockFetchResponse(data: unknown, status: number = 200): Response {
  // If data is a CompressedPrompt, wrap it in the API response format
  let responseData = data;
  if (data && typeof data === 'object' && 'compressed' in data && 'originalTokens' in data) {
    const compressedPrompt = data as CompressedPrompt;
    responseData = {
      success: true,
      requestId: 'test-request-id',
      data: {
        compressed: compressedPrompt.compressed,
        originalTokens: compressedPrompt.originalTokens,
        compressedTokens: compressedPrompt.compressedTokens,
        tokensSaved: compressedPrompt.savings,
        compressionRatio: compressedPrompt.ratio,
        processingTimeMs: 100,
      },
    };
  }

  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => responseData,
    text: async () => JSON.stringify(responseData),
  } as Response;
}

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


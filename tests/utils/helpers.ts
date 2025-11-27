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
  return {
    compressed,
    originalTokens,
    compressedTokens,
    savings: ((originalTokens - compressedTokens) / originalTokens) * 100,
    ratio: compressedTokens / originalTokens,
  };
}

/**
 * Mock fetch response
 */
export function createMockFetchResponse(data: unknown, status: number = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
}

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


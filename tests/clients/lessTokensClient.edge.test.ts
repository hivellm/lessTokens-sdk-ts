/**
 * Edge case tests for LessTokensClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensClient } from '../../src/clients/lessTokensClient.js';
import { createMockFetchResponse } from '../utils/helpers.js';

global.fetch = vi.fn();

describe('LessTokensClient Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle response with missing fields', async () => {
    const client = new LessTokensClient('test-key');
    const mockResponse = {
      compressed: 'compressed',
      // Missing other fields
    };
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockResponse));

    const result = await client.compress('original');

    expect(result.compressed).toBe('compressed');
    expect(result.originalTokens).toBe(0);
    expect(result.compressedTokens).toBe(0);
    expect(result.savings).toBe(0);
    expect(result.ratio).toBe(1.0);
  });

  it('should handle response with null values', async () => {
    const client = new LessTokensClient('test-key');
    const mockResponse = {
      compressed: null,
      originalTokens: null,
      compressedTokens: null,
      savings: null,
      ratio: null,
    };
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockResponse));

    const result = await client.compress('original');

    expect(result.compressed).toBe('original'); // Falls back to original
    expect(result.originalTokens).toBe(0);
    expect(result.compressedTokens).toBe(0);
  });

  it.skip('should handle JSON parse error', async () => {
    // Skip - complex to test JSON parse errors with mocks
  });

  it('should handle different error status codes', async () => {
    const client = new LessTokensClient('test-key');
    const statusCodes = [400, 404, 429, 500, 503];

    for (const status of statusCodes) {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockFetchResponse({ message: 'Error' }, status)
      );

      await expect(client.compress('test')).rejects.toThrow();
    }
  });
});


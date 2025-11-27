/**
 * Tests for LessTokensClient response handling edge cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensClient } from '../../src/clients/lessTokensClient.js';
import { createMockFetchResponse, createMockCompressionResponse } from '../utils/helpers.js';

global.fetch = vi.fn();

describe('LessTokensClient Response Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle response with empty errorData message', async () => {
    const client = new LessTokensClient('test-key');
    
    // Response with statusText but no message in errorData
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}), // Empty error data
      text: async () => '{}',
    } as Response;

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    await expect(client.compress('test')).rejects.toMatchObject({
      code: 'COMPRESSION_FAILED',
    });
  });

  it('should handle response with all fields missing', async () => {
    const client = new LessTokensClient('test-key');
    const mockResponse = createMockCompressionResponse('original', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockResponse));

    const result = await client.compress('original');

    expect(result.compressed).toBe('compressed');
    expect(result.originalTokens).toBe(100);
    expect(result.compressedTokens).toBe(50);
  });

  it('should fallback to original prompt when compressed is missing', async () => {
    const client = new LessTokensClient('test-key');
    const mockResponse = {
      compressed: undefined,
      originalTokens: 100,
      compressedTokens: 50,
      savings: 50,
      ratio: 0.5,
    };
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockResponse));

    const result = await client.compress('original prompt');

    expect(result.compressed).toBe('original prompt'); // Falls back to original
  });
});


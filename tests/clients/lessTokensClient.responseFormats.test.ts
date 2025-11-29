/**
 * Tests for LessTokensClient response format handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensClient } from '../../src/clients/lessTokensClient.js';
import { createMockFetchResponse } from '../utils/helpers.js';

global.fetch = vi.fn();

describe('LessTokensClient Response Format Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle response with tokensSaved (new format)', async () => {
    const client = new LessTokensClient('test-key');
    
    const responseData = {
      success: true,
      requestId: 'test-id',
      data: {
        compressed: 'compressed text',
        originalTokens: 100,
        compressedTokens: 50,
        tokensSaved: 50, // New format
        compressionRatio: 0.5,
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(responseData));

    const result = await client.compress('original text');

    expect(result.compressed).toBe('compressed text');
    expect(result.originalTokens).toBe(100);
    expect(result.compressedTokens).toBe(50);
    expect(result.savings).toBe(50); // Should use tokensSaved
    expect(result.ratio).toBe(0.5); // Should use compressionRatio
  });

  it('should handle response with savings (old format)', async () => {
    const client = new LessTokensClient('test-key');
    
    const responseData = {
      compressed: 'compressed text',
      originalTokens: 100,
      compressedTokens: 50,
      savings: 50, // Old format
      ratio: 0.5,
    };

    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(responseData));

    const result = await client.compress('original text');

    expect(result.compressed).toBe('compressed text');
    expect(result.originalTokens).toBe(100);
    expect(result.compressedTokens).toBe(50);
    expect(result.savings).toBe(50); // Should use savings
    expect(result.ratio).toBe(0.5); // Should use ratio
  });

  it('should handle response with missing tokensSaved (fallback to savings)', async () => {
    const client = new LessTokensClient('test-key');
    
    const responseData = {
      success: true,
      data: {
        compressed: 'compressed text',
        originalTokens: 100,
        compressedTokens: 50,
        // tokensSaved missing, should fallback
        savings: 50,
        compressionRatio: 0.5,
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(responseData));

    const result = await client.compress('original text');

    expect(result.savings).toBe(50); // Should use savings fallback
    expect(result.ratio).toBe(0.5); // Should use compressionRatio
  });

  it('should handle response with missing compressionRatio (fallback to ratio)', async () => {
    const client = new LessTokensClient('test-key');
    
    const responseData = {
      success: true,
      data: {
        compressed: 'compressed text',
        originalTokens: 100,
        compressedTokens: 50,
        tokensSaved: 50,
        // compressionRatio missing, should fallback
        ratio: 0.5,
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(responseData));

    const result = await client.compress('original text');

    expect(result.savings).toBe(50); // Should use tokensSaved
    expect(result.ratio).toBe(0.5); // Should use ratio fallback
  });

  it('should handle response with neither tokensSaved nor savings', async () => {
    const client = new LessTokensClient('test-key');
    
    const responseData = {
      success: true,
      data: {
        compressed: 'compressed text',
        originalTokens: 100,
        compressedTokens: 50,
        // Both tokensSaved and savings missing
        compressionRatio: 0.5,
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(responseData));

    const result = await client.compress('original text');

    expect(result.savings).toBe(0); // Should default to 0
    expect(result.ratio).toBe(0.5); // Should use compressionRatio
  });

  it('should handle response with neither compressionRatio nor ratio', async () => {
    const client = new LessTokensClient('test-key');
    
    const responseData = {
      success: true,
      data: {
        compressed: 'compressed text',
        originalTokens: 100,
        compressedTokens: 50,
        tokensSaved: 50,
        // Both compressionRatio and ratio missing
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(responseData));

    const result = await client.compress('original text');

    expect(result.savings).toBe(50); // Should use tokensSaved
    expect(result.ratio).toBe(1.0); // Should default to 1.0
  });
});




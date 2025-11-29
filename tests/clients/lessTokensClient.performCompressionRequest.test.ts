/**
 * Tests for LessTokensClient performCompressionRequest method
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensClient } from '../../src/clients/lessTokensClient.js';
import { ErrorCodes } from '../../src/errors.js';
import { createMockFetchResponse, createMockCompressionResponse } from '../utils/helpers.js';

global.fetch = vi.fn();

describe('LessTokensClient performCompressionRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform compression request successfully', async () => {
    const client = new LessTokensClient('test-key');
    const mockResponse = createMockCompressionResponse('original', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockResponse));

    const requestBody = { prompt: 'original' };
    const result = await client.performCompressionRequest(requestBody, 'original');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'https://lesstokens.hive-hub.ai/api/compress',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-API-Key': 'test-key',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle timeout error', async () => {
    const client = new LessTokensClient('test-key', 'https://lesstokens.hive-hub.ai', 100);
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    vi.mocked(fetch).mockImplementation(() => {
      return new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject(abortError);
        }, 50);
      });
    });

    const requestBody = { prompt: 'test' };
    await expect(client.performCompressionRequest(requestBody, 'test')).rejects.toMatchObject({
      code: ErrorCodes.TIMEOUT,
    });
  }, 10000);

  it('should handle network error', async () => {
    const client = new LessTokensClient('test-key');
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const requestBody = { prompt: 'test' };
    await expect(client.performCompressionRequest(requestBody, 'test')).rejects.toMatchObject({
      code: ErrorCodes.NETWORK_ERROR,
    });
  }, 10000);

  it('should re-throw LessTokensError', async () => {
    const client = new LessTokensClient('test-key');
    const { LessTokensError } = await import('../../src/errors.js');
    const originalError = new LessTokensError('Original error', ErrorCodes.COMPRESSION_FAILED);

    vi.mocked(fetch).mockRejectedValueOnce(originalError);

    const requestBody = { prompt: 'test' };
    await expect(client.performCompressionRequest(requestBody, 'test')).rejects.toBe(originalError);
  }, 10000);

  it('should handle error with code property', async () => {
    const client = new LessTokensClient('test-key');
    const errorWithCode = { code: ErrorCodes.NETWORK_ERROR, message: 'Network issue' };

    vi.mocked(fetch).mockRejectedValueOnce(errorWithCode);

    const requestBody = { prompt: 'test' };
    await expect(client.performCompressionRequest(requestBody, 'test')).rejects.toMatchObject({
      code: ErrorCodes.NETWORK_ERROR,
    });
  }, 10000);
});




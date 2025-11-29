/**
 * Tests for LessTokensClient status code handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensClient } from '../../src/clients/lessTokensClient.js';
import { ErrorCodes } from '../../src/errors.js';
import { createMockFetchResponse } from '../utils/helpers.js';

global.fetch = vi.fn();

describe('LessTokensClient Status Code Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle 401 status code', async () => {
    const client = new LessTokensClient('invalid-key');
    vi.mocked(fetch).mockResolvedValueOnce(
      createMockFetchResponse({ message: 'Unauthorized' }, 401)
    );

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.INVALID_API_KEY,
      statusCode: 401,
    });
  });

  it('should handle 403 status code', async () => {
    const client = new LessTokensClient('forbidden-key');
    vi.mocked(fetch).mockResolvedValueOnce(
      createMockFetchResponse({ message: 'Forbidden' }, 403)
    );

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.INVALID_API_KEY,
      statusCode: 403,
    });
  });

  it('should handle 400 status code', async () => {
    const client = new LessTokensClient('test-key');
    vi.mocked(fetch).mockResolvedValueOnce(
      createMockFetchResponse({ message: 'Bad Request' }, 400)
    );

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.COMPRESSION_FAILED,
      statusCode: 400,
    });
  });

  it('should handle 500 status code', async () => {
    const client = new LessTokensClient('test-key');
    vi.mocked(fetch).mockResolvedValueOnce(
      createMockFetchResponse({ message: 'Internal Server Error' }, 500)
    );

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.COMPRESSION_FAILED,
      statusCode: 500,
    });
  });

  it('should handle response without error message', async () => {
    const client = new LessTokensClient('test-key');
    vi.mocked(fetch).mockResolvedValueOnce(
      createMockFetchResponse({}, 500)
    );

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.COMPRESSION_FAILED,
    });
  });
});




/**
 * Tests for LessTokensClient error handling edge cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensClient } from '../../src/clients/lessTokensClient.js';
import { ErrorCodes, createError } from '../../src/errors.js';

global.fetch = vi.fn();

describe('LessTokensClient Error Handling Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should re-throw LessTokensError without wrapping', async () => {
    const client = new LessTokensClient('test-key');
    
    const customError = createError(ErrorCodes.COMPRESSION_FAILED, 'Custom error', 500);
    
    vi.mocked(fetch).mockRejectedValueOnce(customError);

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.COMPRESSION_FAILED,
      message: 'Custom error',
    });
  });

  it('should handle error with unknown type', async () => {
    const client = new LessTokensClient('test-key');
    
    // Error that is not an Error instance and not an object with code
    vi.mocked(fetch).mockRejectedValueOnce('string error');

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.NETWORK_ERROR,
    });
  }, 10000);

  it('should handle error that is not Error instance', async () => {
    const client = new LessTokensClient('test-key');
    
    // Error that is an object but not Error instance
    const errorObj = { message: 'Error message' };
    vi.mocked(fetch).mockRejectedValueOnce(errorObj);

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.NETWORK_ERROR,
    });
  }, 10000);
});


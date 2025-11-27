/**
 * Tests for LessTokensClient error re-throwing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensClient } from '../../src/clients/lessTokensClient.js';
import { LessTokensError, ErrorCodes } from '../../src/errors.js';

global.fetch = vi.fn();

describe('LessTokensClient Error Re-throwing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should re-throw LessTokensError without wrapping', async () => {
    const client = new LessTokensClient('test-key');
    const originalError = new LessTokensError('Original error', ErrorCodes.TIMEOUT);

    // Mock fetch to throw a LessTokensError
    vi.mocked(fetch).mockImplementation(() => {
      throw originalError;
    });

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.TIMEOUT,
      message: 'Original error',
    });
  }, 10000);

  it('should handle error with code property', async () => {
    const client = new LessTokensClient('test-key');
    const errorWithCode = { code: ErrorCodes.NETWORK_ERROR, message: 'Network issue' };

    vi.mocked(fetch).mockImplementation(() => {
      throw errorWithCode;
    });

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.NETWORK_ERROR,
    });
  }, 10000);
});


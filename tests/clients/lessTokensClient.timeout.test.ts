/**
 * Tests for LessTokensClient timeout handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LessTokensClient } from '../../src/clients/lessTokensClient.js';
import { ErrorCodes } from '../../src/errors.js';

global.fetch = vi.fn();

describe('LessTokensClient Timeout Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle AbortError (timeout)', async () => {
    const client = new LessTokensClient('test-key', 'https://api.lesstokens.com', 100);

    // Create a fetch that throws AbortError
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    vi.mocked(fetch).mockImplementation(() => {
      return new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject(abortError);
        }, 50);
      });
    });

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.TIMEOUT,
    });
  }, 10000);

  it('should handle timeout with custom timeout value', async () => {
    const client = new LessTokensClient('test-key', 'https://api.lesstokens.com', 50);

    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    vi.mocked(fetch).mockImplementation(() => {
      return new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject(abortError);
        }, 10);
      });
    });

    await expect(client.compress('test')).rejects.toMatchObject({
      code: ErrorCodes.TIMEOUT,
    });
  }, 10000);
});


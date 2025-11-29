/**
 * Edge case tests for retry utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { retry } from '../../src/utils/retry.js';
import { ErrorCodes } from '../../src/errors.js';

describe('retry Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not retry when error is not retryable (non-object error)', async () => {
    const fn = vi.fn().mockRejectedValue('string error');
    
    await expect(retry(fn)).rejects.toBe('string error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not retry when error has no code property', async () => {
    const fn = vi.fn().mockRejectedValue({ message: 'error without code' });
    
    await expect(retry(fn)).rejects.toMatchObject({
      message: 'error without code',
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not retry when error code is not in retryable list', async () => {
    const fn = vi.fn().mockRejectedValue({ code: ErrorCodes.INVALID_API_KEY });
    
    await expect(retry(fn)).rejects.toMatchObject({
      code: ErrorCodes.INVALID_API_KEY,
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throw lastError if all retries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue({ code: ErrorCodes.NETWORK_ERROR });
    
    await expect(retry(fn, { maxRetries: 0 })).rejects.toMatchObject({
      code: ErrorCodes.NETWORK_ERROR,
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});




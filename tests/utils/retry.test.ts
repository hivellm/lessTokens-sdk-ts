/**
 * Tests for retry utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { retry, DEFAULT_RETRY_CONFIG } from '../../src/utils/retry.js';
import { ErrorCodes } from '../../src/errors.js';

describe('retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable error', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ code: ErrorCodes.NETWORK_ERROR })
      .mockResolvedValueOnce('success');
    
    const result = await retry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry up to maxRetries', async () => {
    const fn = vi.fn().mockRejectedValue({ code: ErrorCodes.NETWORK_ERROR });
    
    await expect(retry(fn, { maxRetries: 2 })).rejects.toMatchObject({
      code: ErrorCodes.NETWORK_ERROR,
    });
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('should not retry on non-retryable error', async () => {
    const fn = vi.fn().mockRejectedValue({ code: ErrorCodes.INVALID_API_KEY });
    
    await expect(retry(fn)).rejects.toMatchObject({
      code: ErrorCodes.INVALID_API_KEY,
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should use exponential backoff', async () => {
    vi.useFakeTimers();
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ code: ErrorCodes.NETWORK_ERROR })
      .mockRejectedValueOnce({ code: ErrorCodes.NETWORK_ERROR })
      .mockResolvedValueOnce('success');
    
    const retryPromise = retry(fn, { initialDelay: 100, maxDelay: 1000 });
    
    // Fast-forward time to allow retries
    await vi.advanceTimersByTimeAsync(300);
    
    const result = await retryPromise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
    
    vi.useRealTimers();
  });

  it('should respect maxDelay', async () => {
    vi.useFakeTimers();
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ code: ErrorCodes.NETWORK_ERROR })
      .mockResolvedValueOnce('success');
    
    const retryPromise = retry(fn, { initialDelay: 1000, maxDelay: 2000 });
    
    await vi.advanceTimersByTimeAsync(2000);
    
    const result = await retryPromise;
    expect(result).toBe('success');
    
    vi.useRealTimers();
  });
});

describe('DEFAULT_RETRY_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(3);
    expect(DEFAULT_RETRY_CONFIG.initialDelay).toBe(1000);
    expect(DEFAULT_RETRY_CONFIG.maxDelay).toBe(10000);
    expect(DEFAULT_RETRY_CONFIG.retryableErrors).toContain(ErrorCodes.TIMEOUT);
    expect(DEFAULT_RETRY_CONFIG.retryableErrors).toContain(ErrorCodes.NETWORK_ERROR);
  });
});




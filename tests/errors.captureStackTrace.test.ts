/**
 * Tests for Error.captureStackTrace coverage
 */

import { describe, it, expect, vi } from 'vitest';
import { LessTokensError, ErrorCodes } from '../src/errors.js';

describe('LessTokensError captureStackTrace', () => {
  it('should call captureStackTrace when available', () => {
    // Mock Error.captureStackTrace
    const originalCaptureStackTrace = Error.captureStackTrace;
    const mockCaptureStackTrace = vi.fn();
    Error.captureStackTrace = mockCaptureStackTrace;

    try {
      const error = new LessTokensError('Test error', ErrorCodes.INVALID_API_KEY);
      
      expect(mockCaptureStackTrace).toHaveBeenCalledWith(error, LessTokensError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCodes.INVALID_API_KEY);
    } finally {
      // Restore original
      Error.captureStackTrace = originalCaptureStackTrace;
    }
  });

  it('should work when captureStackTrace is not available', () => {
    // Mock Error.captureStackTrace as undefined
    const originalCaptureStackTrace = Error.captureStackTrace;
    // @ts-expect-error - Testing when captureStackTrace is not available
    Error.captureStackTrace = undefined;

    try {
      const error = new LessTokensError('Test error', ErrorCodes.INVALID_API_KEY);
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCodes.INVALID_API_KEY);
    } finally {
      // Restore original
      Error.captureStackTrace = originalCaptureStackTrace;
    }
  });
});




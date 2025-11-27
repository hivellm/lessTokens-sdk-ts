/**
 * Tests for error classes
 */

import { describe, it, expect } from 'vitest';
import { LessTokensError, ErrorCodes, createError } from '../src/errors.js';

describe('LessTokensError', () => {
  it('should create error with message and code', () => {
    const error = new LessTokensError('Test error', ErrorCodes.INVALID_API_KEY);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(ErrorCodes.INVALID_API_KEY);
    expect(error.name).toBe('LessTokensError');
  });

  it('should include status code', () => {
    const error = new LessTokensError('Test error', ErrorCodes.INVALID_API_KEY, 401);
    expect(error.statusCode).toBe(401);
  });

  it('should include details', () => {
    const details = { field: 'apiKey' };
    const error = new LessTokensError('Test error', ErrorCodes.INVALID_API_KEY, undefined, details);
    expect(error.details).toEqual(details);
  });

  it('should be instance of Error', () => {
    const error = new LessTokensError('Test error', ErrorCodes.INVALID_API_KEY);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(LessTokensError);
  });
});

describe('createError', () => {
  it('should create LessTokensError', () => {
    const error = createError(ErrorCodes.INVALID_API_KEY, 'Invalid key');
    expect(error).toBeInstanceOf(LessTokensError);
    expect(error.code).toBe(ErrorCodes.INVALID_API_KEY);
    expect(error.message).toBe('Invalid key');
  });

  it('should include status code and details', () => {
    const error = createError(ErrorCodes.INVALID_API_KEY, 'Invalid key', 401, { reason: 'expired' });
    expect(error.statusCode).toBe(401);
    expect(error.details).toEqual({ reason: 'expired' });
  });
});

describe('ErrorCodes', () => {
  it('should have all required error codes', () => {
    expect(ErrorCodes.INVALID_API_KEY).toBe('INVALID_API_KEY');
    expect(ErrorCodes.INVALID_PROVIDER).toBe('INVALID_PROVIDER');
    expect(ErrorCodes.COMPRESSION_FAILED).toBe('COMPRESSION_FAILED');
    expect(ErrorCodes.LLM_API_ERROR).toBe('LLM_API_ERROR');
    expect(ErrorCodes.TIMEOUT).toBe('TIMEOUT');
    expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
  });
});



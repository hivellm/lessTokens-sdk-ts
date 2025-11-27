/**
 * Edge case tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import { validateCompressionOptions } from '../../src/utils/validation.js';
import { ErrorCodes } from '../../src/errors.js';

describe('validateCompressionOptions Edge Cases', () => {
  it('should validate valid compression options', () => {
    const validOptions = [
      { targetRatio: 0.0 },
      { targetRatio: 0.5 },
      { targetRatio: 1.0 },
      { preserveContext: true },
      { preserveContext: false },
      { aggressive: true },
      { aggressive: false },
      { targetRatio: 0.5, preserveContext: true, aggressive: false },
    ];

    validOptions.forEach((options) => {
      expect(() => validateCompressionOptions(options)).not.toThrow();
    });
  });

  it('should reject invalid targetRatio', () => {
    const invalidOptions = [
      { targetRatio: -0.1 },
      { targetRatio: 1.1 },
      { targetRatio: 2.0 },
    ];

    invalidOptions.forEach((options) => {
      let error: any;
      try {
        validateCompressionOptions(options);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error?.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  it('should reject invalid preserveContext', () => {
    let error: any;
    try {
      validateCompressionOptions({ preserveContext: 'true' as any });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error?.code).toBe(ErrorCodes.VALIDATION_ERROR);
  });

  it('should reject invalid aggressive', () => {
    let error: any;
    try {
      validateCompressionOptions({ aggressive: 'true' as any });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error?.code).toBe(ErrorCodes.VALIDATION_ERROR);
  });
});

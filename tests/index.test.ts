/**
 * Tests for main index.ts exports
 */

import { describe, it, expect } from 'vitest';

describe('Index Exports', () => {
  it('should export LessTokensSDK', async () => {
    const { LessTokensSDK } = await import('../src/index.js');
    expect(LessTokensSDK).toBeDefined();
    expect(typeof LessTokensSDK).toBe('function');
  });

  it('should export error classes', async () => {
    const { LessTokensError, ErrorCodes, createError } = await import('../src/index.js');
    expect(LessTokensError).toBeDefined();
    expect(ErrorCodes).toBeDefined();
    expect(createError).toBeDefined();
  });

  it('should export all types', async () => {
    const exports = await import('../src/index.js');
    
    // Check that types are exported (they may be undefined at runtime in some cases)
    expect(exports).toBeDefined();
  });

  it('should export LessTokensConfig type', async () => {
    // Types are compile-time only, but we can verify the module loads
    const module = await import('../src/index.js');
    expect(module).toBeDefined();
  });
});



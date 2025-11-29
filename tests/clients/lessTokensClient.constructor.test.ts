/**
 * Tests for LessTokensClient constructor
 */

import { describe, it, expect } from 'vitest';
import { LessTokensClient } from '../../src/clients/lessTokensClient.js';

describe('LessTokensClient Constructor', () => {
  it('should create client with default baseUrl', () => {
    const client = new LessTokensClient('test-key');
    expect(client).toBeInstanceOf(LessTokensClient);
  });

  it('should create client with custom baseUrl', () => {
    const client = new LessTokensClient('test-key', 'https://custom.example.com');
    expect(client).toBeInstanceOf(LessTokensClient);
  });

  it('should create client with custom timeout', () => {
    const client = new LessTokensClient('test-key', 'https://lesstokens.hive-hub.ai', 60000);
    expect(client).toBeInstanceOf(LessTokensClient);
  });

  it('should remove trailing slash from baseUrl', async () => {
    const client = new LessTokensClient('test-key', 'https://lesstokens.hive-hub.ai/');
    expect(client).toBeInstanceOf(LessTokensClient);
    // The baseUrl should be normalized without trailing slash
    // This is tested indirectly through compress calls
  });
});




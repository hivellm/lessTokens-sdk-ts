/**
 * Tests for LessTokensClient compress method - direct coverage
 * This ensures the compress method itself is fully covered
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessTokensClient } from '../../src/clients/lessTokensClient.js';
import { createMockFetchResponse, createMockCompressionResponse } from '../utils/helpers.js';

global.fetch = vi.fn();

describe('LessTokensClient compress - Direct Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call performCompressionRequest through retry wrapper', async () => {
    const client = new LessTokensClient('test-key');
    const mockResponse = createMockCompressionResponse('test', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockResponse));

    // Call compress which internally calls retry with performCompressionRequest
    const result = await client.compress('test');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle compress with all options', async () => {
    const client = new LessTokensClient('test-key');
    const mockResponse = createMockCompressionResponse('test', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockResponse));

    const result = await client.compress('test', {
      targetRatio: 0.3,
      preserveContext: true,
      aggressive: true,
    });

    expect(result).toEqual(mockResponse);
    
    // Verify the request body includes all options
    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body).toMatchObject({
      prompt: 'test',
      targetRatio: 0.3,
      preserveContext: true,
      aggressive: true,
    });
  });

  it('should handle compress with partial options', async () => {
    const client = new LessTokensClient('test-key');
    const mockResponse = createMockCompressionResponse('test', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockResponse));

    const result = await client.compress('test', {
      targetRatio: 0.5,
      // preserveContext and aggressive not provided
    });

    expect(result).toEqual(mockResponse);
    
    // Verify only targetRatio is in the request body
    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body).toMatchObject({
      prompt: 'test',
      targetRatio: 0.5,
    });
    expect(body).not.toHaveProperty('preserveContext');
    expect(body).not.toHaveProperty('aggressive');
  });

  it('should handle compress with only preserveContext', async () => {
    const client = new LessTokensClient('test-key');
    const mockResponse = createMockCompressionResponse('test', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockResponse));

    const result = await client.compress('test', {
      preserveContext: false,
    });

    expect(result).toEqual(mockResponse);
    
    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body).toMatchObject({
      prompt: 'test',
      preserveContext: false,
    });
  });

  it('should handle compress with only aggressive', async () => {
    const client = new LessTokensClient('test-key');
    const mockResponse = createMockCompressionResponse('test', 'compressed', 100, 50);
    vi.mocked(fetch).mockResolvedValueOnce(createMockFetchResponse(mockResponse));

    const result = await client.compress('test', {
      aggressive: true,
    });

    expect(result).toEqual(mockResponse);
    
    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body).toMatchObject({
      prompt: 'test',
      aggressive: true,
    });
  });
});




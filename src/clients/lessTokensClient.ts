/**
 * Client for LessTokens API
 */

import { createError, ErrorCodes } from '../errors.js';
import type { CompressionOptions, CompressedPrompt } from '../types.js';
import { retry, DEFAULT_RETRY_CONFIG } from '../utils/retry.js';

/**
 * LessTokens API client
 */
export class LessTokensClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(apiKey: string, baseUrl: string = 'https://lesstokens.hive-hub.ai', timeout: number = 30000) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = timeout;
  }

  /**
   * Internal method to perform the compression request
   */
  async performCompressionRequest(
    requestBody: Record<string, unknown>,
    prompt: string
  ): Promise<CompressedPrompt> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/compress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string };

        if (response.status === 401 || response.status === 403) {
          throw createError(
            ErrorCodes.INVALID_API_KEY,
            'Invalid LessTokens API key',
            response.status,
            errorData
          );
        }

        throw createError(
          ErrorCodes.COMPRESSION_FAILED,
          errorData.message || `Compression failed: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = (await response.json()) as {
        compressed?: string;
        originalTokens?: number;
        compressedTokens?: number;
        savings?: number;
        ratio?: number;
      };

      return {
        compressed: data.compressed || prompt,
        originalTokens: data.originalTokens || 0,
        compressedTokens: data.compressedTokens || 0,
        savings: data.savings || 0,
        ratio: data.ratio || 1.0,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw createError(
          ErrorCodes.TIMEOUT,
          `Request timeout after ${this.timeout}ms`,
          undefined,
          error
        );
      }

      if (error && typeof error === 'object' && 'code' in error) {
        throw error; // Re-throw LessTokensError
      }

      throw createError(
        ErrorCodes.NETWORK_ERROR,
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error
      );
    }
  }

  /**
   * Compress a prompt using LessTokens API
   */
  async compress(prompt: string, options: CompressionOptions = {}): Promise<CompressedPrompt> {
    // Build request body with only provided options
    const requestBody: Record<string, unknown> = {
      prompt,
    };

    // Only include optional fields if they are explicitly provided
    if (options.targetRatio !== undefined) {
      requestBody.targetRatio = options.targetRatio;
    }
    if (options.preserveContext !== undefined) {
      requestBody.preserveContext = options.preserveContext;
    }
    if (options.aggressive !== undefined) {
      requestBody.aggressive = options.aggressive;
    }

    return retry(
      () => this.performCompressionRequest(requestBody, prompt),
      {
        ...DEFAULT_RETRY_CONFIG,
        retryableErrors: [ErrorCodes.TIMEOUT, ErrorCodes.NETWORK_ERROR, 'RATE_LIMIT'],
      }
    );
  }
}


/**
 * LLM client wrapper
 */

import type { LLMConfig, LLMResponse, StreamChunk } from '../types.js';
import type { LLMProvider } from '../providers/base.js';
import { createProvider } from '../providers/index.js';

/**
 * LLM client that wraps provider implementations
 * 
 * Provides a unified interface for interacting with different LLM providers
 * (OpenAI, Anthropic, Google, DeepSeek) through their official SDKs.
 */
export class LLMClient {
  private provider: LLMProvider;

  /**
   * Creates a new LLMClient instance
   * 
   * @param provider - Provider name ('openai', 'anthropic', 'google', 'deepseek')
   * @param apiKey - Provider API key
   * @param baseURL - Optional custom base URL (mainly for DeepSeek)
   * @throws {LessTokensError} If provider is not supported
   */
  constructor(provider: string, apiKey: string, baseURL?: string) {
    this.provider = createProvider(provider, apiKey, baseURL);
  }

  /**
   * Send a chat completion request
   * 
   * @param messages - Array of message objects with role and content
   * @param config - LLM configuration (model, temperature, etc.)
   * @returns Promise resolving to LLM response
   * @throws {LessTokensError} If request fails
   */
  async chat(messages: Array<{ role: string; content: string }>, config: LLMConfig): Promise<LLMResponse> {
    return this.provider.chat(messages, config);
  }

  /**
   * Send a streaming chat completion request
   * 
   * @param messages - Array of message objects with role and content
   * @param config - LLM configuration (model, temperature, etc.)
   * @returns Async iterable of stream chunks
   * @throws {LessTokensError} If request fails
   */
  async chatStream(
    messages: Array<{ role: string; content: string }>,
    config: LLMConfig
  ): Promise<AsyncIterable<StreamChunk>> {
    return this.provider.chatStream(messages, config);
  }
}


/**
 * LLM client wrapper
 */

import type { LLMConfig, LLMResponse, StreamChunk } from '../types.js';
import type { LLMProvider } from '../providers/base.js';
import { createProvider } from '../providers/index.js';

/**
 * LLM client that wraps provider implementations
 */
export class LLMClient {
  private provider: LLMProvider;

  constructor(provider: string, apiKey: string, baseURL?: string) {
    this.provider = createProvider(provider, apiKey, baseURL);
  }

  /**
   * Send a chat completion request
   */
  async chat(messages: Array<{ role: string; content: string }>, config: LLMConfig): Promise<LLMResponse> {
    return this.provider.chat(messages, config);
  }

  /**
   * Send a streaming chat completion request
   */
  async chatStream(
    messages: Array<{ role: string; content: string }>,
    config: LLMConfig
  ): Promise<AsyncIterable<StreamChunk>> {
    return this.provider.chatStream(messages, config);
  }
}


/**
 * Base provider interface
 */

import type { LLMConfig, LLMResponse, StreamChunk } from '../types.js';

/**
 * Base provider interface that all providers must implement
 */
export interface LLMProvider {
  /**
   * Send a chat completion request
   */
  chat(messages: Array<{ role: string; content: string }>, config: LLMConfig): Promise<LLMResponse>;

  /**
   * Send a streaming chat completion request
   */
  chatStream(
    messages: Array<{ role: string; content: string }>,
    config: LLMConfig
  ): Promise<AsyncIterable<StreamChunk>>;
}


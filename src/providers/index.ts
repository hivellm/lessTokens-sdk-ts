/**
 * Provider registry and factory
 */

import type { LLMProvider } from './base.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GoogleProvider } from './google.js';
import { DeepSeekProvider } from './deepseek.js';
import { createError, ErrorCodes } from '../errors.js';

/**
 * Creates a provider instance based on the provider name
 * 
 * @param provider - Provider name ('openai', 'anthropic', 'google', 'deepseek')
 * @param apiKey - Provider API key
 * @param baseURL - Optional custom base URL (mainly for DeepSeek)
 * @returns Provider instance implementing LLMProvider interface
 * @throws {LessTokensError} If provider is not supported
 * 
 * @example
 * ```typescript
 * const provider = createProvider('openai', 'sk-...');
 * const response = await provider.chat(messages, config);
 * ```
 */
export function createProvider(provider: string, apiKey: string, baseURL?: string): LLMProvider {
  const normalizedProvider = provider.toLowerCase();

  switch (normalizedProvider) {
    case 'openai':
      return new OpenAIProvider(apiKey, baseURL);
    case 'deepseek':
      return new DeepSeekProvider(apiKey);
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    case 'google':
      return new GoogleProvider(apiKey);
    default:
      throw createError(
        ErrorCodes.INVALID_PROVIDER,
        `Unsupported provider: ${provider}. Supported providers: openai, anthropic, google, deepseek`
      );
  }
}


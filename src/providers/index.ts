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
 * Provider factory
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


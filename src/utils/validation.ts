/**
 * Input validation utilities
 */

import { createError, ErrorCodes } from '../errors.js';
import type { LessTokensConfig, ProcessPromptOptions, LLMConfig } from '../types.js';

/**
 * Maximum prompt size in characters
 */
const MAX_PROMPT_SIZE = 1_000_000;

/**
 * Minimum prompt size in characters
 */
const MIN_PROMPT_SIZE = 1;

/**
 * Validate LessTokens configuration
 */
export function validateConfig(config: LessTokensConfig): void {
  if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim().length === 0) {
    throw createError(
      ErrorCodes.INVALID_API_KEY,
      'LessTokens API key is required and must be a non-empty string'
    );
  }

  if (!config.provider || typeof config.provider !== 'string' || config.provider.trim().length === 0) {
    throw createError(
      ErrorCodes.INVALID_PROVIDER,
      'Provider is required and must be a non-empty string'
    );
  }

  const supportedProviders = ['openai', 'anthropic', 'google', 'deepseek'];
  if (!supportedProviders.includes(config.provider.toLowerCase())) {
    throw createError(
      ErrorCodes.INVALID_PROVIDER,
      `Provider '${config.provider}' is not supported. Supported providers: ${supportedProviders.join(', ')}`
    );
  }

  if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
    throw createError(
      ErrorCodes.VALIDATION_ERROR,
      'Timeout must be a positive number'
    );
  }
}

/**
 * Validate prompt
 */
export function validatePrompt(prompt: string): void {
  if (typeof prompt !== 'string') {
    throw createError(
      ErrorCodes.VALIDATION_ERROR,
      'Prompt must be a string'
    );
  }

  if (prompt.length < MIN_PROMPT_SIZE) {
    throw createError(
      ErrorCodes.VALIDATION_ERROR,
      `Prompt must be at least ${MIN_PROMPT_SIZE} character long`
    );
  }

  if (prompt.length > MAX_PROMPT_SIZE) {
    throw createError(
      ErrorCodes.VALIDATION_ERROR,
      `Prompt must not exceed ${MAX_PROMPT_SIZE} characters`
    );
  }
}

/**
 * Validate process prompt options
 */
export function validateProcessPromptOptions(options: ProcessPromptOptions): void {
  validatePrompt(options.prompt);

  if (!options.llmConfig || typeof options.llmConfig !== 'object') {
    throw createError(
      ErrorCodes.VALIDATION_ERROR,
      'LLM configuration is required'
    );
  }

  validateLLMConfig(options.llmConfig);

  if (options.compressionOptions) {
    validateCompressionOptions(options.compressionOptions);
  }
}

/**
 * Validate LLM configuration
 */
export function validateLLMConfig(config: LLMConfig): void {
  if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim().length === 0) {
    throw createError(
      ErrorCodes.VALIDATION_ERROR,
      'LLM API key is required and must be a non-empty string'
    );
  }

  if (!config.model || typeof config.model !== 'string' || config.model.trim().length === 0) {
    throw createError(
      ErrorCodes.VALIDATION_ERROR,
      'Model is required and must be a non-empty string'
    );
  }
}

/**
 * Validate compression options
 */
export function validateCompressionOptions(options: {
  targetRatio?: number;
  preserveContext?: boolean;
  aggressive?: boolean;
}): void {
  if (options.targetRatio !== undefined) {
    if (typeof options.targetRatio !== 'number' || options.targetRatio < 0 || options.targetRatio > 1) {
      throw createError(
        ErrorCodes.VALIDATION_ERROR,
        'targetRatio must be a number between 0.0 and 1.0'
      );
    }
  }

  if (options.preserveContext !== undefined && typeof options.preserveContext !== 'boolean') {
    throw createError(
      ErrorCodes.VALIDATION_ERROR,
      'preserveContext must be a boolean'
    );
  }

  if (options.aggressive !== undefined && typeof options.aggressive !== 'boolean') {
    throw createError(
      ErrorCodes.VALIDATION_ERROR,
      'aggressive must be a boolean'
    );
  }
}


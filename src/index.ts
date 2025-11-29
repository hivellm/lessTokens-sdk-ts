/**
 * LessTokens SDK - Main entry point
 */

// Export main SDK class
export { LessTokensSDK } from './sdk.js';

// Export error classes
export { LessTokensError, ErrorCodes, createError } from './errors.js';
export type { ErrorCode } from './errors.js';

// Export all types
export type {
  LessTokensConfig,
  ProcessPromptOptions,
  LLMConfig,
  CompressionOptions,
  LLMResponse,
  TokenUsage,
  ResponseMetadata,
  CompressedPrompt,
  StreamChunk,
} from './types.js';




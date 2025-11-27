/**
 * Core type definitions for the LessTokens SDK
 */

/**
 * Configuration for initializing the LessTokens SDK
 */
export interface LessTokensConfig {
  /** LessTokens API key */
  apiKey: string;
  /** LLM provider name (e.g., 'openai', 'anthropic', 'google', 'deepseek') */
  provider: string;
  /** Base URL for LessTokens API (default: 'https://api.lesstokens.com') */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Options for processing a prompt
 */
export interface ProcessPromptOptions {
  /** Prompt text to be processed */
  prompt: string;
  /** LLM API configuration - supports all provider-specific options */
  llmConfig: LLMConfig;
  /** Compression options */
  compressionOptions?: CompressionOptions;
  /** Custom message role (default: 'user') */
  messageRole?: string;
  /** Custom message content. Can be a string or a function that receives the compressed prompt and returns the content */
  messageContent?: string | ((compressed: CompressedPrompt) => string);
  /** Additional messages to include in the conversation (for multi-turn conversations) */
  messages?: Array<{ role: string; content: string }>;
}

/**
 * LLM API configuration
 * Supports all provider-specific options through index signature
 */
export interface LLMConfig {
  /** Provider API key */
  apiKey: string;
  /** Model name */
  model: string;
  /** Temperature (0.0 to 2.0) */
  temperature?: number;
  /** Maximum tokens for completion */
  maxTokens?: number;
  /** Top-p sampling */
  topP?: number;
  /** Frequency penalty */
  frequencyPenalty?: number;
  /** Presence penalty */
  presencePenalty?: number;
  /** Stop sequences */
  stop?: string[];
  /** Provider-specific options (all options are passed through to official SDKs) */
  [key: string]: unknown;
}

/**
 * Compression options
 */
export interface CompressionOptions {
  /** Target compression ratio (0.0 to 1.0, default: 0.5) */
  targetRatio?: number;
  /** Preserve context during compression (default: true) */
  preserveContext?: boolean;
  /** Use aggressive compression (default: false) */
  aggressive?: boolean;
}

/**
 * LLM response with usage metrics
 */
export interface LLMResponse {
  /** Response content */
  content: string;
  /** Token usage information */
  usage: TokenUsage;
  /** Response metadata */
  metadata?: ResponseMetadata;
}

/**
 * Token usage metrics
 */
export interface TokenUsage {
  /** Original prompt tokens */
  promptTokens: number;
  /** Completion tokens */
  completionTokens: number;
  /** Total tokens */
  totalTokens: number;
  /** Compressed tokens (if compression was used) */
  compressedTokens?: number;
  /** Savings percentage (0-100) */
  savings?: number;
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  /** Model used */
  model?: string;
  /** Provider name */
  provider?: string;
  /** Timestamp */
  timestamp?: string;
  /** Compression ratio (if compression was used) */
  compressionRatio?: number;
}

/**
 * Compressed prompt result
 */
export interface CompressedPrompt {
  /** Compressed prompt text */
  compressed: string;
  /** Original token count */
  originalTokens: number;
  /** Compressed token count */
  compressedTokens: number;
  /** Savings percentage (0-100) */
  savings: number;
  /** Compression ratio (compressedTokens / originalTokens) */
  ratio: number;
}

/**
 * Streaming chunk
 */
export interface StreamChunk {
  /** Chunk content */
  content: string;
  /** Whether this is the final chunk */
  done: boolean;
  /** Usage information (available when done is true) */
  usage?: TokenUsage;
}


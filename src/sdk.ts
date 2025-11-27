/**
 * Main LessTokens SDK class
 */

import { LessTokensClient } from './clients/lessTokensClient.js';
import { LLMClient } from './clients/llmClient.js';
import { validateConfig, validateProcessPromptOptions, validatePrompt } from './utils/validation.js';
import type {
  LessTokensConfig,
  ProcessPromptOptions,
  LLMResponse,
  StreamChunk,
  CompressedPrompt,
  ResponseMetadata,
} from './types.js';

/**
 * Main LessTokens SDK class
 * 
 * Provides a simple interface to compress prompts using LessTokens API
 * and send them to various LLM providers (OpenAI, Anthropic, Google, DeepSeek).
 * 
 * @example
 * ```typescript
 * const sdk = new LessTokensSDK({
 *   apiKey: 'your-less-tokens-api-key',
 *   provider: 'openai',
 * });
 * 
 * const response = await sdk.processPrompt({
 *   prompt: 'Your prompt here',
 *   llmConfig: {
 *     apiKey: 'your-openai-api-key',
 *     model: 'gpt-4',
 *   },
 * });
 * ```
 */
export class LessTokensSDK {
  private readonly lessTokensClient: LessTokensClient;
  private readonly provider: string;

  /**
   * Creates a new LessTokensSDK instance
   * 
   * @param config - SDK configuration
   * @param config.apiKey - LessTokens API key
   * @param config.provider - LLM provider name ('openai', 'anthropic', 'google', 'deepseek')
   * @param config.baseUrl - Optional base URL for LessTokens API (default: 'https://lesstokens.hive-hub.ai')
   * @param config.timeout - Optional request timeout in milliseconds (default: 30000)
   * @throws {LessTokensError} If configuration is invalid
   */
  constructor(config: LessTokensConfig) {
    validateConfig(config);

    this.provider = config.provider.toLowerCase();
    this.lessTokensClient = new LessTokensClient(
      config.apiKey,
      config.baseUrl,
      config.timeout
    );
  }

  /**
   * Process a prompt through LessTokens compression and send to LLM
   * 
   * This method:
   * 1. Compresses the prompt using LessTokens API
   * 2. Sends the compressed prompt to the configured LLM provider
   * 3. Returns the LLM response with compression metrics
   * 
   * @param options - Processing options
   * @param options.prompt - The prompt to compress and send
   * @param options.llmConfig - LLM provider configuration (API key, model, etc.)
   * @param options.compressionOptions - Optional compression settings
   * @returns Promise resolving to LLM response with compression metrics
   * @throws {LessTokensError} If compression or LLM request fails
   * 
   * @example
   * ```typescript
   * // Basic usage
   * const response = await sdk.processPrompt({
   *   prompt: 'Explain quantum computing',
   *   llmConfig: {
   *     apiKey: process.env.OPENAI_API_KEY!,
   *     model: 'gpt-4',
   *     temperature: 0.7,
   *   },
   * });
   * 
   * // Custom role
   * const response2 = await sdk.processPrompt({
   *   prompt: 'Explain quantum computing',
   *   llmConfig: { apiKey: '...', model: 'gpt-4' },
   *   messageRole: 'system',
   * });
   * 
   * // Custom content with function
   * const response3 = await sdk.processPrompt({
   *   prompt: 'Explain quantum computing',
   *   llmConfig: { apiKey: '...', model: 'gpt-4' },
   *   messageContent: (compressed) => `Compressed: ${compressed.compressed}\nOriginal tokens: ${compressed.originalTokens}`,
   * });
   * 
   * console.log(response.content);
   * console.log(`Saved ${response.usage.savings}% tokens`);
   * ```
   */
  async processPrompt(options: ProcessPromptOptions): Promise<LLMResponse> {
    validateProcessPromptOptions(options);

    // Step 1: Compress prompt via LessTokens
    const compressed = await this.lessTokensClient.compress(
      options.prompt,
      options.compressionOptions
    );

    // Step 2: Send compressed prompt to LLM
    const baseURL = typeof options.llmConfig.baseURL === 'string' ? options.llmConfig.baseURL : undefined;
    const llmClient = new LLMClient(this.provider, options.llmConfig.apiKey, baseURL);

    // Determine message role and content
    const role = options.messageRole || 'user';
    const content = typeof options.messageContent === 'function'
      ? options.messageContent(compressed)
      : (options.messageContent ?? compressed.compressed);

    // Build messages array - include additional messages if provided, then add the compressed prompt
    const messages: Array<{ role: string; content: string }> = [];
    if (options.messages && options.messages.length > 0) {
      messages.push(...options.messages);
    }
    messages.push({ role, content });

    const response = await llmClient.chat(messages, options.llmConfig);

    // Step 3: Calculate savings and update usage
    const savings = compressed.originalTokens > 0
      ? ((compressed.originalTokens - compressed.compressedTokens) / compressed.originalTokens) * 100
      : 0;

    return {
      ...response,
      usage: {
        ...response.usage,
        compressedTokens: compressed.compressedTokens,
        savings: Math.round(savings * 100) / 100, // Round to 2 decimal places
      },
      metadata: {
        ...response.metadata,
        compressionRatio: compressed.ratio,
      } as ResponseMetadata,
    };
  }

  /**
   * Process a prompt with streaming response
   * 
   * Similar to `processPrompt`, but returns a stream of chunks instead of waiting
   * for the complete response. The final chunk includes compression metrics.
   * 
   * @param options - Processing options
   * @param options.prompt - The prompt to compress and send
   * @param options.llmConfig - LLM provider configuration (API key, model, etc.) - supports all provider-specific options
   * @param options.compressionOptions - Optional compression settings
   * @param options.messageRole - Custom message role (default: 'user')
   * @param options.messageContent - Custom message content. Can be a string or a function that receives the compressed prompt
   * @param options.messages - Additional messages for multi-turn conversations
   * @returns Async iterable of stream chunks
   * @throws {LessTokensError} If compression or LLM request fails
   * 
   * @example
   * ```typescript
   * const stream = await sdk.processPromptStream({
   *   prompt: 'Tell a story',
   *   llmConfig: {
   *     apiKey: process.env.OPENAI_API_KEY!,
   *     model: 'gpt-4',
   *   },
   * });
   * 
   * for await (const chunk of stream) {
   *   if (!chunk.done) {
   *     process.stdout.write(chunk.content);
   *   } else {
   *     console.log(`\nSaved ${chunk.usage?.savings}% tokens`);
   *   }
   * }
   * ```
   */
  async processPromptStream(options: ProcessPromptOptions): Promise<AsyncIterable<StreamChunk>> {
    validateProcessPromptOptions(options);

    // Step 1: Compress prompt via LessTokens
    const compressed = await this.lessTokensClient.compress(
      options.prompt,
      options.compressionOptions
    );

    // Step 2: Send compressed prompt to LLM with streaming
    const baseURL = typeof options.llmConfig.baseURL === 'string' ? options.llmConfig.baseURL : undefined;
    const llmClient = new LLMClient(this.provider, options.llmConfig.apiKey, baseURL);

    // Determine message role and content
    const role = options.messageRole || 'user';
    const content = typeof options.messageContent === 'function'
      ? options.messageContent(compressed)
      : (options.messageContent ?? compressed.compressed);

    // Build messages array - include additional messages if provided, then add the compressed prompt
    const messages: Array<{ role: string; content: string }> = [];
    if (options.messages && options.messages.length > 0) {
      messages.push(...options.messages);
    }
    messages.push({ role, content });

    const stream = await llmClient.chatStream(messages, options.llmConfig);

    // Step 3: Wrap stream and add compression metrics to final chunk
    return this.wrapStream(stream, compressed);
  }

  /**
   * Compress a prompt without sending to LLM
   * 
   * Useful when you only want to compress a prompt without sending it to an LLM.
   * Returns compression results including token counts and savings.
   * 
   * @param prompt - The prompt to compress
   * @param options - Optional compression settings
   * @param options.targetRatio - Target compression ratio (0.0-1.0)
   * @param options.preserveContext - Whether to preserve context during compression
   * @param options.aggressive - Whether to use aggressive compression
   * @returns Promise resolving to compression results
   * @throws {LessTokensError} If compression fails
   * 
   * @example
   * ```typescript
   * const result = await sdk.compressPrompt('Very long prompt...', {
   *   targetRatio: 0.3,
   *   aggressive: true,
   * });
   * 
   * console.log(`Compressed from ${result.originalTokens} to ${result.compressedTokens} tokens`);
   * console.log(`Savings: ${result.savings} tokens (${result.ratio * 100}% ratio)`);
   * ```
   */
  async compressPrompt(prompt: string, options?: ProcessPromptOptions['compressionOptions']): Promise<CompressedPrompt> {
    validatePrompt(prompt);
    return this.lessTokensClient.compress(prompt, options);
  }

  /**
   * Wrap stream and add compression metrics
   */
  private async *wrapStream(
    stream: AsyncIterable<StreamChunk>,
    compressed: CompressedPrompt
  ): AsyncGenerator<StreamChunk> {
    let lastChunk: StreamChunk | undefined;

    for await (const chunk of stream) {
      lastChunk = chunk;
      if (!chunk.done) {
        yield chunk;
      }
    }

    // Add compression metrics to final chunk
    if (lastChunk && lastChunk.done && lastChunk.usage) {
      const savings = compressed.originalTokens > 0
        ? ((compressed.originalTokens - compressed.compressedTokens) / compressed.originalTokens) * 100
        : 0;

      yield {
        ...lastChunk,
        usage: {
          ...lastChunk.usage,
          compressedTokens: compressed.compressedTokens,
          savings: Math.round(savings * 100) / 100,
        },
      };
    } else if (lastChunk && lastChunk.done) {
      // If no usage info, create it
      const savings = compressed.originalTokens > 0
        ? ((compressed.originalTokens - compressed.compressedTokens) / compressed.originalTokens) * 100
        : 0;

      yield {
        content: '',
        done: true,
        usage: {
          promptTokens: compressed.originalTokens,
          completionTokens: 0,
          totalTokens: compressed.originalTokens,
          compressedTokens: compressed.compressedTokens,
          savings: Math.round(savings * 100) / 100,
        },
      };
    }
  }
}


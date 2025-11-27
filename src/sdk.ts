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
 * LessTokens SDK
 */
export class LessTokensSDK {
  private readonly lessTokensClient: LessTokensClient;
  private readonly provider: string;

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
   */
  async processPrompt(options: ProcessPromptOptions): Promise<LLMResponse> {
    validateProcessPromptOptions(options);

    // Step 1: Compress prompt via LessTokens
    const compressed = await this.lessTokensClient.compress(
      options.prompt,
      options.compressionOptions
    );

    // Step 2: Send compressed prompt to LLM
    const llmClient = new LLMClient(this.provider, options.llmConfig.apiKey);
    const messages = [{ role: 'user', content: compressed.compressed }];

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
   */
  async processPromptStream(options: ProcessPromptOptions): Promise<AsyncIterable<StreamChunk>> {
    validateProcessPromptOptions(options);

    // Step 1: Compress prompt via LessTokens
    const compressed = await this.lessTokensClient.compress(
      options.prompt,
      options.compressionOptions
    );

    // Step 2: Send compressed prompt to LLM with streaming
    const llmClient = new LLMClient(this.provider, options.llmConfig.apiKey);
    const messages = [{ role: 'user', content: compressed.compressed }];

    const stream = await llmClient.chatStream(messages, options.llmConfig);

    // Step 3: Wrap stream and add compression metrics to final chunk
    return this.wrapStream(stream, compressed);
  }

  /**
   * Compress a prompt without sending to LLM
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


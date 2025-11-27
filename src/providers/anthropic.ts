/**
 * Anthropic provider implementation
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LLMConfig, LLMResponse, StreamChunk } from '../types.js';
import { createError, ErrorCodes } from '../errors.js';
import type { LLMProvider } from './base.js';

/**
 * Anthropic provider
 */
export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
    });
  }

  async chat(messages: Array<{ role: string; content: string }>, config: LLMConfig): Promise<LLMResponse> {
    try {
      const {
        apiKey: _apiKey,
        model,
        temperature,
        maxTokens,
        topP,
        ...restOptions
      } = config;

      // Convert messages to Anthropic format
      const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => {
        if (msg.role === 'system') {
          return { role: 'user', content: msg.content };
        }
        return {
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        };
      });

      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens || 1024,
        temperature,
        top_p: topP,
        messages: anthropicMessages,
        ...restOptions,
      } as Anthropic.Messages.MessageCreateParams);

      // When stream is not set, response is a Message
      const message = response as Anthropic.Message;
      const textContent = message.content.find((item: Anthropic.Message['content'][0]) => item.type === 'text');
      const content = textContent && 'text' in textContent ? textContent.text : '';

      return {
        content,
        usage: {
          promptTokens: message.usage.input_tokens || 0,
          completionTokens: message.usage.output_tokens || 0,
          totalTokens: (message.usage.input_tokens || 0) + (message.usage.output_tokens || 0),
        },
        metadata: {
          model: message.model,
          provider: 'anthropic',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw createError(ErrorCodes.LLM_API_ERROR, `Anthropic API error: ${message}`, undefined, error);
    }
  }

  async chatStream(
    messages: Array<{ role: string; content: string }>,
    config: LLMConfig
  ): Promise<AsyncIterable<StreamChunk>> {
    try {
      const {
        apiKey: _apiKey,
        model,
        temperature,
        maxTokens,
        topP,
        ...restOptions
      } = config;

      // Convert messages to Anthropic format
      const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => {
        if (msg.role === 'system') {
          return { role: 'user', content: msg.content };
        }
        return {
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        };
      });

      const stream = await this.client.messages.stream({
        model,
        max_tokens: maxTokens || 1024,
        temperature,
        top_p: topP,
        messages: anthropicMessages,
        ...restOptions,
      } as Anthropic.Messages.MessageStreamParams);

      return this.streamToChunks(stream);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw createError(ErrorCodes.LLM_API_ERROR, `Anthropic API error: ${message}`, undefined, error);
    }
  }

  private async *streamToChunks(
    stream: Awaited<ReturnType<Anthropic.Messages['stream']>>
  ): AsyncGenerator<StreamChunk> {
    let usage: LLMResponse['usage'] | undefined;

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield {
          content: event.delta.text,
          done: false,
        };
      }

      if (event.type === 'message_stop') {
        // Usage is available in the final message
        const finalMessage = await stream.finalMessage();
        if (finalMessage && 'usage' in finalMessage && finalMessage.usage) {
          usage = {
            promptTokens: finalMessage.usage.input_tokens || 0,
            completionTokens: finalMessage.usage.output_tokens || 0,
            totalTokens: (finalMessage.usage.input_tokens || 0) + (finalMessage.usage.output_tokens || 0),
          };
        }
      }
    }

    // Final chunk with usage
    yield {
      content: '',
      done: true,
      usage,
    };
  }
}


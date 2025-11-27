/**
 * DeepSeek provider implementation
 * Uses OpenAI SDK with DeepSeek's base URL
 */

import OpenAI from 'openai';
import type { LLMConfig, LLMResponse, StreamChunk } from '../types.js';
import { createError, ErrorCodes } from '../errors.js';
import type { LLMProvider } from './base.js';

/**
 * DeepSeek provider (OpenAI-compatible API)
 */
export class DeepSeekProvider implements LLMProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
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
        frequencyPenalty,
        presencePenalty,
        stop,
        ...restOptions
      } = config;

      const response = await this.client.chat.completions.create({
        model,
        messages: messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        stop,
        ...restOptions,
      } as OpenAI.Chat.Completions.ChatCompletionCreateParams);

      // When stream is not set, response is a ChatCompletion
      const completion = response as OpenAI.Chat.Completions.ChatCompletion;
      const choice = completion.choices[0];
      if (!choice || !choice.message) {
        throw createError(ErrorCodes.LLM_API_ERROR, 'No response from DeepSeek');
      }

      return {
        content: choice.message.content || '',
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        metadata: {
          model: completion.model,
          provider: 'deepseek',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw createError(ErrorCodes.LLM_API_ERROR, `DeepSeek API error: ${message}`, undefined, error);
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
        frequencyPenalty,
        presencePenalty,
        stop,
        ...restOptions
      } = config;

      const response = await this.client.chat.completions.create({
        model,
        messages: messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        stop,
        stream: true,
        ...restOptions,
      } as OpenAI.Chat.Completions.ChatCompletionCreateParams);

      // When stream: true, OpenAI returns a Stream, not a ChatCompletion
      // Type assertion is safe here because we set stream: true
      return this.streamToChunks(response as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw createError(ErrorCodes.LLM_API_ERROR, `DeepSeek API error: ${message}`, undefined, error);
    }
  }

  private async *streamToChunks(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
  ): AsyncGenerator<StreamChunk> {
    let usage: LLMResponse['usage'] | undefined;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield {
          content: delta.content,
          done: false,
        };
      }

      // Capture usage if available
      if (chunk.usage) {
        usage = {
          promptTokens: chunk.usage.prompt_tokens || 0,
          completionTokens: chunk.usage.completion_tokens || 0,
          totalTokens: chunk.usage.total_tokens || 0,
        };
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


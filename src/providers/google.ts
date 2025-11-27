/**
 * Google provider implementation
 */

import { GoogleGenAI } from '@google/genai';
import type { LLMConfig, LLMResponse, StreamChunk } from '../types.js';
import { createError, ErrorCodes } from '../errors.js';
import type { LLMProvider } from './base.js';

/**
 * Google provider
 */
export class GoogleProvider implements LLMProvider {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({
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
        topK,
        ...restOptions
      } = config;

      // Convert messages to Google format
      const contents = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const response = await this.client.models.generateContent({
        model,
        contents,
        config: {
          temperature: temperature as number | undefined,
          maxOutputTokens: maxTokens as number | undefined,
          topP: topP as number | undefined,
          topK: topK as number | undefined,
          ...(restOptions as Record<string, unknown>),
        },
      });

      // Extract text from response
      let text = '';
      if (response && typeof response === 'object') {
        // Try to get text from response - format may vary
        type ResponseType = {
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string }>;
            };
          }>;
        };
        const candidates = (response as ResponseType).candidates;
        if (candidates && candidates[0]?.content?.parts) {
          text = candidates[0].content.parts.map((part) => part.text || '').join('');
        }
      }

      // Try to get usage metadata
      type UsageMetadataType = {
        usageMetadata?: {
          promptTokenCount?: number;
          candidatesTokenCount?: number;
        };
      };
      const usageMetadata = (response as UsageMetadataType)?.usageMetadata;
      const promptTokens = usageMetadata?.promptTokenCount || 0;
      const completionTokens = usageMetadata?.candidatesTokenCount || 0;

      return {
        content: text,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        metadata: {
          model: model,
          provider: 'google',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw createError(ErrorCodes.LLM_API_ERROR, `Google API error: ${message}`, undefined, error);
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
        topK,
        ...restOptions
      } = config;

      // Convert messages to Google format
      const contents = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const stream = await this.client.models.generateContentStream({
        model,
        contents,
        config: {
          temperature: temperature as number | undefined,
          maxOutputTokens: maxTokens as number | undefined,
          topP: topP as number | undefined,
          topK: topK as number | undefined,
          ...(restOptions as Record<string, unknown>),
        },
      });

      return this.streamToChunks(stream);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw createError(ErrorCodes.LLM_API_ERROR, `Google API error: ${message}`, undefined, error);
    }
  }

  private async *streamToChunks(
    stream: AsyncIterable<unknown>
  ): AsyncGenerator<StreamChunk> {
    type ChunkType = {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
      text?: string;
    };

    for await (const chunk of stream) {
      // Google streaming format - extract text from candidates or direct text property
      const chunkData = chunk as ChunkType;
      
      // Try direct text property first (newer API)
      if (chunkData.text) {
        yield {
          content: chunkData.text,
          done: false,
        };
        continue;
      }

      // Fallback to candidates format
      const candidates = chunkData.candidates;
      if (candidates && candidates[0]?.content?.parts) {
        const text = candidates[0].content.parts.map((part) => part.text || '').join('');
        if (text) {
          yield {
            content: text,
            done: false,
          };
        }
      }
    }

    // Final chunk
    yield {
      content: '',
      done: true,
    };
  }
}


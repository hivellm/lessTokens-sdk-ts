# Architecture - LessTokens SDK

Documentation of the architecture and design of the LessTokens SDK.

## 🏗️ Overview

The LessTokens SDK is built with a focus on simplicity, performance, and type-safety. The architecture follows modern design principles for TypeScript SDKs.

## 📐 Project Structure

```
lessTokens-sdk/
├── src/
│   ├── index.ts              # Main entry point
│   ├── sdk.ts                 # Main LessTokensSDK class
│   ├── types.ts               # TypeScript type definitions
│   ├── errors.ts              # Custom error classes
│   ├── clients/
│   │   ├── lessTokensClient.ts    # Client for LessTokens API
│   │   └── llmClient.ts            # Client for LLM APIs
│   ├── providers/
│   │   ├── openai.ts         # OpenAI provider (uses official SDK)
│   │   ├── anthropic.ts      # Anthropic provider (uses official SDK)
│   │   ├── google.ts         # Google provider (uses official SDK)
│   │   └── deepseek.ts       # DeepSeek provider (uses OpenAI SDK)
│   └── utils/
│       ├── validation.ts     # Input validation
│       └── retry.ts          # Retry logic
├── tests/                     # Tests
├── docs/                      # Documentation
└── dist/                      # Build output
```

## 🔄 Data Flow

### Main Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ prompt
       ▼
┌─────────────────┐
│  LessTokensSDK  │
└──────┬──────────┘
       │
       ├─► Validation
       │
       ├─► LessTokens API (compression)
       │   └─► Returns compressed prompt
       │
       ├─► LLM Provider (OpenAI/Anthropic/Google/DeepSeek)
       │   └─► Uses official provider SDK
       │   └─► Returns response
       │
       └─► Returns response + metrics
```

### Detailed Sequence

1. **Prompt Reception**
   - Input validation
   - Size verification
   - Payload preparation

2. **Compression via LessTokens**
   - Send to LessTokens API
   - Receive compressed prompt
   - Calculate token savings

3. **Send to LLM**
   - Select appropriate provider
   - Configure parameters
   - Use official provider SDK
   - Send compressed prompt
   - Receive response

4. **Response Processing**
   - Aggregate metrics
   - Format response
   - Return to user

## 🧩 Main Components

### 1. LessTokensSDK (Main Class)

**Responsibilities:**
- Manage configuration
- Coordinate processing flow
- Error handling
- Retry logic

**Interface:**

```typescript
class LessTokensSDK {
  constructor(config: LessTokensConfig)
  processPrompt(options: ProcessPromptOptions): Promise<LLMResponse>
  processPromptStream(options: ProcessPromptOptions): Promise<AsyncIterable<StreamChunk>>
  compressPrompt(prompt: string, options?: CompressionOptions): Promise<CompressedPrompt>
}
```

### 2. LessTokensClient

**Responsibilities:**
- Communication with LessTokens API
- Authentication management
- Rate limit handling
- Automatic retry

**Interface:**

```typescript
class LessTokensClient {
  compress(prompt: string, options: CompressionOptions): Promise<CompressedPrompt>
}
```

### 3. LLMClient

**Responsibilities:**
- Communication with LLM APIs
- Support for multiple providers
- Response streaming
- Provider-specific error handling
- **Uses official provider SDKs internally**

**Interface:**

```typescript
class LLMClient {
  chat(messages: Message[], config: LLMConfig): Promise<LLMResponse>
  chatStream(messages: Message[], config: LLMConfig): Promise<AsyncIterable<StreamChunk>>
}
```

### 4. Providers

**Responsibilities:**
- Provider-specific implementation
- Response normalization
- Provider-specific error handling
- **Wrapper around official SDKs**

**Implemented Providers:**

- **OpenAI**: Uses official `openai` npm package
- **Anthropic**: Uses official `@anthropic-ai/sdk` npm package
- **Google**: Uses official `@google/genai` npm package
- **DeepSeek**: Uses official `openai` npm package with custom base URL

**Provider Architecture:**

```typescript
// Each provider wraps the official SDK
class OpenAIProvider {
  private client: OpenAI;
  
  async chat(messages: Message[], config: LLMConfig): Promise<LLMResponse> {
    // Use official OpenAI SDK
    const response = await this.client.chat.completions.create({
      model: config.model,
      messages,
      ...config, // Pass all options through
    });
    
    return this.normalizeResponse(response);
  }
}

class DeepSeekProvider {
  private client: OpenAI; // Uses OpenAI SDK with custom base URL
  
  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com', // DeepSeek endpoint
    });
  }
  
  // Same interface as OpenAIProvider
}
```

## 🔐 Security

### Authentication

- **LessTokens API**: Via header `Authorization: Bearer <apiKey>`
- **LLM APIs**: Via provider-specific header (handled by official SDKs)
- **Never logs keys**: Keys are never logged or exposed

### Validation

- Input validation before sending
- Prompt sanitization
- Size limits
- TypeScript type validation

## ⚡ Performance

### Optimizations

1. **Official SDKs**: Use provider-optimized SDKs for best performance
2. **Connection Pooling**: Reuse HTTP connections (handled by official SDKs)
3. **Request Batching**: Group requests when possible
4. **Lazy Loading**: Load providers on demand
5. **Caching**: Cache responses when appropriate

### Metrics

- **Latency**: < 2s for compression + LLM
- **Throughput**: 100+ requests/minute
- **Memory**: < 50MB in normal use

## 🔄 Retry and Resilience

### Retry Strategy

```typescript
{
  maxRetries: 3,
  initialDelay: 1000, // 1s
  maxDelay: 10000,    // 10s
  backoff: 'exponential',
  retryableErrors: ['TIMEOUT', 'NETWORK_ERROR', 'RATE_LIMIT']
}
```

### Circuit Breaker

- Opens after 5 consecutive failures
- Closes after 60 seconds
- Prevents API overload

## 📊 Observability

### Logging

- Levels: `debug`, `info`, `warn`, `error`
- Structured context
- No sensitive information

### Metrics

- Response time
- Success/error rate
- Token savings
- API usage

## 🧪 Testability

### Testing Strategy

1. **Unit Tests**: Isolated components
2. **Integration Tests**: Complete flow with mocks
3. **E2E Tests**: Tests with real APIs (optional)

### Mocks

- Mock LessTokens API
- Mock LLM APIs
- Mock network errors

## 🔌 Extensibility

### Adding New Provider

```typescript
// src/providers/custom.ts
import { OpenAI } from 'openai'; // or other official SDK

export class CustomProvider implements LLMProvider {
  private client: OpenAI; // or other SDK
  
  async chat(messages: Message[], config: LLMConfig): Promise<LLMResponse> {
    // Use official SDK
    const response = await this.client.chat.completions.create({
      model: config.model,
      messages,
      ...config,
    });
    
    return this.normalizeResponse(response);
  }
}

// Register provider
LessTokensSDK.registerProvider('custom', CustomProvider);
```

### Plugins

- Middleware for custom processing
- Hooks for events
- Prompt transformers

## 📦 Dependencies

### Core

- `typescript`: Type safety
- `node-fetch`: HTTP client (or native fetch)

### Provider SDKs (Peer Dependencies)

- `openai`: For OpenAI and DeepSeek
- `@anthropic-ai/sdk`: For Anthropic
- `@google/genai`: For Google

### Optional

- `zod`: Runtime validation (optional)
- `pino`: Structured logging (optional)

## 🚀 Build and Distribution

### Build Process

1. **TypeScript Compilation**: `tsc`
2. **Bundling**: (if necessary)
3. **Type Declarations**: `.d.ts` files
4. **Minification**: (optional)

### Output

```
dist/
├── index.js           # ESM
├── index.cjs          # CommonJS
├── index.d.ts         # Type declarations
└── index.d.ts.map    # Source maps
```

## 🔄 Versioning

### Semantic Versioning

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Breaking Changes

- Documented in CHANGELOG
- Migration guides when necessary
- Deprecation warnings before removal

## 📚 Documentation

### Structure

- **README.md**: Overview and quick start
- **docs/README.md**: Complete documentation
- **docs/API.md**: API reference
- **docs/EXAMPLES.md**: Practical examples
- **docs/ARCHITECTURE.md**: This document

### Generation

- TypeDoc for API reference
- Tested examples
- Updated diagrams

## 🎯 Design Principles

1. **Simplicity**: Intuitive and easy-to-use API
2. **Type Safety**: TypeScript everywhere
3. **Performance**: Optimized for speed (using official SDKs)
4. **Flexibility**: Supports multiple use cases
5. **Reliability**: Retry, circuit breaker, error handling
6. **Observability**: Logging and metrics
7. **Extensibility**: Easy to add providers
8. **Official SDKs**: Use provider SDKs for best results

## 🔮 Roadmap

### Future

- [ ] Support for more providers
- [ ] Intelligent caching
- [ ] Optimized batch processing
- [ ] Webhooks
- [ ] SDKs for other languages

---

For more information, see the [complete documentation](./README.md).

# API Reference - LessTokens SDK

Complete API documentation for the LessTokens SDK.

## LessTokensSDK Class

### Constructor

```typescript
new LessTokensSDK(config: LessTokensConfig): LessTokensSDK
```

Creates a new SDK instance.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config.apiKey` | `string` | ✅ | LessTokens API key |
| `config.provider` | `string` | ✅ | LLM provider (`'openai'`, `'anthropic'`, `'google'`, `'deepseek'`, etc.) |
| `config.baseUrl` | `string` | ❌ | Base URL for API (default: `'https://api.lesstokens.com'`) |
| `config.timeout` | `number` | ❌ | Timeout in milliseconds (default: `30000`) |

**Example:**

```typescript
const sdk = new LessTokensSDK({
  apiKey: 'lt_1234567890abcdef',
  provider: 'openai',
  baseUrl: 'https://api.lesstokens.com',
  timeout: 30000,
});
```

---

## Methods

### `processPrompt`

Processes a prompt through LessTokens and sends to the configured LLM.

```typescript
processPrompt(options: ProcessPromptOptions): Promise<LLMResponse>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options.prompt` | `string` | ✅ | Prompt to be processed |
| `options.llmConfig` | `LLMConfig` | ✅ | LLM API configuration |
| `options.compressionOptions` | `CompressionOptions` | ❌ | Compression options |

**Returns:** `Promise<LLMResponse>`

**Example:**

```typescript
const response = await sdk.processPrompt({
  prompt: 'Explain what machine learning is',
  llmConfig: {
    apiKey: 'sk-...',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    // All provider-specific options are supported
  },
  compressionOptions: {
    targetRatio: 0.5,
    preserveContext: true,
  },
});
```

**Errors:**

- `LessTokensError` with code `INVALID_API_KEY` if API key is invalid
- `LessTokensError` with code `COMPRESSION_FAILED` if compression fails
- `LessTokensError` with code `LLM_API_ERROR` if there's an LLM API error
- `LessTokensError` with code `TIMEOUT` if request exceeds timeout

---

### `processPromptStream`

Processes a prompt and returns a response stream.

```typescript
processPromptStream(options: ProcessPromptOptions): Promise<AsyncIterable<StreamChunk>>
```

**Parameters:**

Same parameters as `processPrompt`.

**Returns:** `Promise<AsyncIterable<StreamChunk>>`

**Example:**

```typescript
const stream = await sdk.processPromptStream({
  prompt: 'Tell a story',
  llmConfig: {
    apiKey: 'sk-...',
    model: 'gpt-4',
  },
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
  if (chunk.done) {
    console.log('\nTokens saved:', chunk.usage?.savings);
  }
}
```

---

### `compressPrompt`

Only compresses the prompt without sending to LLM.

```typescript
compressPrompt(prompt: string, options?: CompressionOptions): Promise<CompressedPrompt>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | `string` | ✅ | Prompt to be compressed |
| `options` | `CompressionOptions` | ❌ | Compression options |

**Returns:** `Promise<CompressedPrompt>`

**Example:**

```typescript
const compressed = await sdk.compressPrompt('Very long prompt...', {
  targetRatio: 0.4,
  aggressive: true,
});

console.log('Original:', compressed.originalTokens, 'tokens');
console.log('Compressed:', compressed.compressedTokens, 'tokens');
console.log('Savings:', compressed.savings, '%');
```

---

## Types

### `LessTokensConfig`

```typescript
interface LessTokensConfig {
  apiKey: string;
  provider: string;
  baseUrl?: string;
  timeout?: number;
}
```

### `ProcessPromptOptions`

```typescript
interface ProcessPromptOptions {
  prompt: string;
  llmConfig: LLMConfig;
  compressionOptions?: CompressionOptions;
}
```

### `LLMConfig`

```typescript
interface LLMConfig {
  apiKey: string;
  model: string;
  // All provider-specific options are fully supported
  // Options are passed through to official provider SDKs
  [key: string]: unknown;
}
```

### `CompressionOptions`

```typescript
interface CompressionOptions {
  targetRatio?: number; // 0.0 to 1.0, default: 0.5
  preserveContext?: boolean; // Default: true
  aggressive?: boolean; // Default: false
}
```

### `LLMResponse`

```typescript
interface LLMResponse {
  content: string;
  usage: TokenUsage;
  metadata?: ResponseMetadata;
}
```

### `TokenUsage`

```typescript
interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  compressedTokens?: number;
  savings?: number; // Savings percentage
}
```

### `ResponseMetadata`

```typescript
interface ResponseMetadata {
  model: string;
  provider: string;
  timestamp: string;
  compressionRatio?: number;
}
```

### `CompressedPrompt`

```typescript
interface CompressedPrompt {
  compressed: string;
  originalTokens: number;
  compressedTokens: number;
  savings: number; // Percentage
  ratio: number; // compressedTokens / originalTokens
}
```

### `StreamChunk`

```typescript
interface StreamChunk {
  content: string;
  done: boolean;
  usage?: TokenUsage;
}
```

### `LessTokensError`

```typescript
class LessTokensError extends Error {
  code: string;
  statusCode?: number;
  details?: unknown;
}
```

**Error Codes:**

- `INVALID_API_KEY`: Invalid or missing API key
- `INVALID_PROVIDER`: Unsupported provider
- `COMPRESSION_FAILED`: Failed to compress prompt
- `LLM_API_ERROR`: LLM API error
- `TIMEOUT`: Request exceeded timeout
- `NETWORK_ERROR`: Network error
- `VALIDATION_ERROR`: Parameter validation error

---

## Supported Providers

The SDK uses **official provider SDKs** internally, ensuring full feature support and optimal performance.

### OpenAI

**Uses official `openai` npm package**

```typescript
{
  provider: 'openai',
  llmConfig: {
    apiKey: 'sk-...',
    model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 1000,
    // All OpenAI API options are supported
  }
}
```

**All OpenAI features supported:**
- Chat completions
- Streaming
- Function calling
- Tool use
- Vision (multimodal)
- Fine-tuning
- And more...

### Anthropic

**Uses official `@anthropic-ai/sdk` npm package**

```typescript
{
  provider: 'anthropic',
  llmConfig: {
    apiKey: 'sk-ant-...',
    model: 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307',
    max_tokens: 1024,
    temperature: 0.7,
    // All Anthropic API options are supported
  }
}
```

**All Anthropic features supported:**
- Messages API
- Streaming
- Tool use
- File uploads
- Beta features
- And more...

### Google

**Uses official `@google/genai` npm package**

```typescript
{
  provider: 'google',
  llmConfig: {
    apiKey: '...',
    model: 'gemini-pro' | 'gemini-pro-vision',
    temperature: 0.7,
    maxOutputTokens: 1000,
    // All Google API options are supported
  }
}
```

**All Google features supported:**
- Content generation
- Streaming
- Multimodal inputs
- Function calling
- Embeddings
- And more...

### DeepSeek

**Uses official `openai` npm package with custom base URL**

DeepSeek API is compatible with OpenAI's format, so we use the official OpenAI SDK with a custom base URL.

```typescript
{
  provider: 'deepseek',
  llmConfig: {
    apiKey: 'sk-...',
    model: 'deepseek-chat' | 'deepseek-coder',
    temperature: 0.7,
    max_tokens: 1000,
    // All OpenAI-compatible options are supported
  }
}
```

**All DeepSeek features supported:**
- Chat completions
- Streaming
- Function calling
- Code generation
- And more...

---

## Complete Examples

### Example 1: Basic Usage

```typescript
import { LessTokensSDK } from '@lesstokens/sdk';

const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
});

const response = await sdk.processPrompt({
  prompt: 'Explain quantum computing',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.7,
  },
});

console.log(response.content);
```

### Example 2: With Custom Compression

```typescript
const response = await sdk.processPrompt({
  prompt: 'Very long prompt...',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
  compressionOptions: {
    targetRatio: 0.3, // Compress to 30%
    aggressive: true,
    preserveContext: true,
  },
});
```

### Example 3: Response Streaming

```typescript
const stream = await sdk.processPromptStream({
  prompt: 'Tell a story about...',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
});

for await (const chunk of stream) {
  if (chunk.done) {
    console.log('\nSavings:', chunk.usage?.savings, '%');
  } else {
    process.stdout.write(chunk.content);
  }
}
```

### Example 4: Compression Only

```typescript
const compressed = await sdk.compressPrompt('Long prompt...', {
  targetRatio: 0.5,
});

// Use compressed prompt manually
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: compressed.compressed }],
  }),
});
```

### Example 5: Using DeepSeek

```typescript
const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'deepseek',
});

const response = await sdk.processPrompt({
  prompt: 'Write a Python function to sort a list',
  llmConfig: {
    apiKey: process.env.DEEPSEEK_API_KEY!,
    model: 'deepseek-coder',
    temperature: 0.7,
  },
});

console.log(response.content);
```

---

## Limits and Rate Limits

### Request Limits

- **Rate Limit**: 100 requests per minute (per API key)
- **Maximum Prompt Size**: 1,000,000 characters
- **Default Timeout**: 30 seconds
- **Maximum Timeout**: 300 seconds

### Rate Limit Handling

The SDK automatically retries with exponential backoff on rate limit errors.

```typescript
// Automatic retry configuration
const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
  // Automatic retry configured internally
});
```

---

## Versioning

The API follows [Semantic Versioning](https://semver.org/).

- **MAJOR**: Incompatible API changes
- **MINOR**: New compatible functionality
- **PATCH**: Compatible bug fixes

---

## Support

For support, open an issue on [GitHub](https://github.com/lesstokens/sdk-typescript) or consult the [complete documentation](https://docs.lesstokens.com).

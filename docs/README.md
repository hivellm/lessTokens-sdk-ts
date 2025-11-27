# LessTokens SDK - Technical Documentation

Modern and simple TypeScript SDK for integrating with the LessTokens token compression API.

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Initial Configuration](#initial-configuration)
- [Basic Usage](#basic-usage)
- [API Reference](#api-reference)
- [Advanced Examples](#advanced-examples)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)
- [Provider Support](#provider-support)

## 🎯 Overview

The LessTokens SDK facilitates integration between your application and the LessTokens token compression API, allowing you to optimize token usage before sending prompts to LLM APIs.

### How It Works

```
SDK → LessTokens API → Compressed Response → User's LLM API → Final Response
```

1. **SDK receives the prompt** from the user
2. **Sends to LessTokens API** for compression
3. **Receives compressed response** from LessTokens
4. **Sends to user's LLM API** with custom configurations (using official provider SDKs)
5. **Returns final response** from LLM

### Architecture

The SDK uses **official provider SDKs** internally for optimal performance and full feature support:

- **OpenAI**: Uses official `openai` npm package
- **Anthropic**: Uses official `@anthropic-ai/sdk` npm package
- **Google**: Uses official `@google/genai` npm package
- **DeepSeek**: Uses official `openai` npm package (OpenAI-compatible API)

This ensures:
- ✅ Full API feature support
- ✅ Optimal performance
- ✅ Type safety
- ✅ Automatic updates
- ✅ Better error handling

See [Integration Analysis](./INTEGRATION_ANALYSIS.md) for detailed comparison.

## 📦 Installation

```bash
npm install @lesstokens/sdk
# or
yarn add @lesstokens/sdk
# or
pnpm add @lesstokens/sdk
```

### Peer Dependencies

The SDK requires the official provider SDKs as peer dependencies. Install based on your needs:

```bash
# For OpenAI
npm install openai

# For Anthropic
npm install @anthropic-ai/sdk

# For Google
npm install @google/genai
```

## ⚙️ Initial Configuration

### Requirements

- Node.js 18+ or Bun
- LessTokens API key
- LLM provider configured
- Official provider SDK installed (optional, auto-installed if missing)

### Instantiation

```typescript
import { LessTokensSDK } from '@lesstokens/sdk';

const sdk = new LessTokensSDK({
  apiKey: 'your-less-tokens-api-key',
  provider: 'openai', // or 'anthropic', 'google', etc.
});
```

## 🚀 Basic Usage

### Simple Example

```typescript
import { LessTokensSDK } from '@lesstokens/sdk';

const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
});

// Process prompt
const response = await sdk.processPrompt({
  prompt: 'Explain what artificial intelligence is',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.7,
    // All OpenAI API options are supported
  },
});

console.log(response.content);
```

## 📚 API Reference

### Class `LessTokensSDK`

#### Constructor

```typescript
constructor(config: LessTokensConfig)
```

**Parameters:**

- `config.apiKey` (string, required): LessTokens API key
- `config.provider` (string, required): LLM provider (`'openai'`, `'anthropic'`, `'google'`, etc.)
- `config.baseUrl?` (string, optional): Base URL for API (default: `'https://api.lesstokens.com'`)
- `config.timeout?` (number, optional): Timeout in ms (default: `30000`)

#### Method `processPrompt`

Processes a prompt through LessTokens and sends to the user's LLM.

```typescript
async processPrompt(options: ProcessPromptOptions): Promise<LLMResponse>
```

**Parameters:**

- `options.prompt` (string, required): Prompt to be processed
- `options.llmConfig` (LLMConfig, required): LLM API configuration
- `options.compressionOptions?` (CompressionOptions, optional): Compression options

**Returns:** `Promise<LLMResponse>`

**Example:**

```typescript
const response = await sdk.processPrompt({
  prompt: 'Your prompt here',
  llmConfig: {
    apiKey: 'your-llm-api-key',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    // All provider-specific options are supported
  },
  compressionOptions: {
    targetRatio: 0.5, // Compress to 50% of original size
  },
});
```

### TypeScript Types

#### `LessTokensConfig`

```typescript
interface LessTokensConfig {
  apiKey: string;
  provider: string;
  baseUrl?: string;
  timeout?: number;
}
```

#### `ProcessPromptOptions`

```typescript
interface ProcessPromptOptions {
  prompt: string;
  llmConfig: LLMConfig;
  compressionOptions?: CompressionOptions;
}
```

#### `LLMConfig`

```typescript
interface LLMConfig {
  apiKey: string;
  model: string;
  // Provider-specific options are fully supported
  // All options from official SDKs can be passed through
  [key: string]: unknown;
}
```

**Provider-Specific Examples:**

```typescript
// OpenAI - all OpenAI API options supported
{
  apiKey: 'sk-...',
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 0.9,
  frequency_penalty: 0.5,
  presence_penalty: 0.5,
  stop: ['\n'],
  // ... all other OpenAI options
}

// Anthropic - all Anthropic API options supported
{
  apiKey: 'sk-ant-...',
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  temperature: 0.7,
  top_p: 0.9,
  // ... all other Anthropic options
}

// Google - all Google API options supported
{
  apiKey: '...',
  model: 'gemini-pro',
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  // ... all other Google options
}
```

#### `CompressionOptions`

```typescript
interface CompressionOptions {
  targetRatio?: number; // 0.0 to 1.0
  preserveContext?: boolean;
  aggressive?: boolean;
}
```

#### `LLMResponse`

```typescript
interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    compressedTokens?: number;
    savings?: number; // Percentage saved
  };
  metadata?: {
    model: string;
    provider: string;
    timestamp: string;
  };
}
```

## 🔥 Advanced Examples

### With Error Handling

```typescript
import { LessTokensSDK, LessTokensError } from '@lesstokens/sdk';

const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
});

try {
  const response = await sdk.processPrompt({
    prompt: 'Your prompt',
    llmConfig: {
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4',
    },
  });
  
  console.log('Response:', response.content);
  console.log('Tokens saved:', response.usage.savings);
} catch (error) {
  if (error instanceof LessTokensError) {
    console.error('LessTokens error:', error.message);
    console.error('Code:', error.code);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### With Aggressive Compression

```typescript
const response = await sdk.processPrompt({
  prompt: 'Very long prompt here...',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
  compressionOptions: {
    targetRatio: 0.3, // Compress to 30% of size
    aggressive: true,
    preserveContext: true,
  },
});
```

### Streaming Response

```typescript
const stream = await sdk.processPromptStream({
  prompt: 'Your prompt',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}
```

### Multiple Prompts

```typescript
const prompts = [
  'First prompt',
  'Second prompt',
  'Third prompt',
];

const responses = await Promise.all(
  prompts.map(prompt =>
    sdk.processPrompt({
      prompt,
      llmConfig: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'gpt-4',
      },
    })
  )
);
```

## ⚠️ Error Handling

### Error Types

#### `LessTokensError`

Base error for all SDK errors.

```typescript
class LessTokensError extends Error {
  code: string;
  statusCode?: number;
}
```

#### Error Codes

- `INVALID_API_KEY`: Invalid API key
- `INVALID_PROVIDER`: Unsupported provider
- `COMPRESSION_FAILED`: Compression failure
- `LLM_API_ERROR`: LLM API error
- `TIMEOUT`: Request timeout
- `NETWORK_ERROR`: Network error

### Error Handling Example

```typescript
import { LessTokensSDK, LessTokensError } from '@lesstokens/sdk';

try {
  const response = await sdk.processPrompt({...});
} catch (error) {
  if (error instanceof LessTokensError) {
    switch (error.code) {
      case 'INVALID_API_KEY':
        console.error('Invalid API key');
        break;
      case 'COMPRESSION_FAILED':
        console.error('Compression failed:', error.message);
        break;
      default:
        console.error('Error:', error.message);
    }
  }
}
```

## 🔧 Advanced Configuration

### Custom Timeout

```typescript
const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
  timeout: 60000, // 60 seconds
});
```

### Custom URL

```typescript
const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
  baseUrl: 'https://api-custom.lesstokens.com',
});
```

## 📊 Metrics and Monitoring

### Usage Information

```typescript
const response = await sdk.processPrompt({...});

console.log('Original tokens:', response.usage.promptTokens);
console.log('Compressed tokens:', response.usage.compressedTokens);
console.log('Savings:', response.usage.savings, '%');
console.log('Response tokens:', response.usage.completionTokens);
console.log('Total:', response.usage.totalTokens);
```

## 🔐 Security

### Best Practices

1. **Never commit API keys** in code
2. **Use environment variables** to store keys
3. **Validate inputs** before sending to API
4. **Always use HTTPS** (default in SDK)

### Secure Example

```typescript
import { config } from 'dotenv';

config(); // Load .env variables

const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!, // From .env
  provider: 'openai',
});

// Input validation
function validatePrompt(prompt: string): boolean {
  return prompt.length > 0 && prompt.length < 100000;
}

if (validatePrompt(userPrompt)) {
  const response = await sdk.processPrompt({
    prompt: userPrompt,
    llmConfig: {
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4',
    },
  });
}
```

## 🔌 Provider Support

### Supported Providers

The SDK uses **official provider SDKs** internally for optimal performance and full feature support:

- ✅ **OpenAI** (`openai`) - Uses official `openai` npm package
- ✅ **Anthropic** (`anthropic`) - Uses official `@anthropic-ai/sdk` npm package
- ✅ **Google** (`google`) - Uses official `@google/genai` npm package
- ✅ **DeepSeek** (`deepseek`) - Uses official `openai` npm package (OpenAI-compatible API)

### Full API Support

Since the SDK uses official provider SDKs, **all provider features are supported**:

- ✅ All API endpoints
- ✅ All configuration options
- ✅ Streaming support
- ✅ Tool/function calling
- ✅ Multimodal inputs
- ✅ Custom headers
- ✅ Retry logic
- ✅ Error handling

### Provider-Specific Features

Each provider's unique features are fully supported through their official SDKs. See provider documentation for details.

**DeepSeek Note**: DeepSeek uses an OpenAI-compatible API, so we use the official OpenAI SDK with a custom base URL (`https://api.deepseek.com`). All OpenAI-compatible features are supported.

## 📝 Changelog

See [CHANGELOG.md](../CHANGELOG.md) for version history.

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](../CONTRIBUTING.md) for more information.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

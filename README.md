# LessTokens SDK

[![npm version](https://img.shields.io/npm/v/@hivehub/lesstokens-sdk-ts.svg)](https://www.npmjs.com/package/@hivehub/lesstokens-sdk-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/badge/coverage-99%25-brightgreen.svg)](https://github.com/hive-hub/lessTokes-sdk-ts)

Modern and simple TypeScript SDK for integrating with the LessTokens token compression API. Compress prompts before sending to LLM providers (OpenAI, Anthropic, Google, DeepSeek) to reduce token usage and costs while maintaining response quality.

## ✨ Features

- 🚀 **Simple & Modern**: Intuitive and easy-to-use API
- 🔒 **Type-Safe**: Fully typed with TypeScript
- ⚡ **Performant**: Optimized for high performance
- 📦 **Lightweight**: Minimal dependencies
- 🔄 **Streaming**: Support for streaming responses
- 🎯 **Flexible**: Supports multiple LLM providers
- 🔌 **Full Provider Support**: Uses official SDKs for complete feature support

## 📦 Installation

```bash
npm install @hivehub/lesstokens-sdk-ts
# or
yarn add @hivehub/lesstokens-sdk-ts
# or
pnpm add @hivehub/lesstokens-sdk-ts
```

## 🚀 Quick Start

```typescript
import { LessTokensSDK } from '@hivehub/lesstokens-sdk-ts';

// Initialize SDK
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
console.log('Tokens saved:', response.usage.savings, '%');
```

## 📖 Documentation

- [TypeDoc API Reference](./docs/index.html) - Generated API documentation
- All code is fully documented with JSDoc comments

## 🎯 How It Works

The LessTokens SDK facilitates token compression before sending prompts to LLM APIs:

```
1. You send the prompt to the SDK
2. SDK compresses the prompt via LessTokens API
3. SDK sends the compressed prompt to your LLM API (using official provider SDKs)
4. SDK returns the final response with savings metrics
```

**Note**: The SDK uses official provider SDKs (OpenAI, Anthropic, Google) internally, ensuring full feature support and optimal performance.

## 💡 Examples

### Basic Usage

```typescript
const response = await sdk.processPrompt({
  prompt: 'Your prompt here',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    // All OpenAI API options are supported
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 0.9,
  },
});
```

### With Custom Compression

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

### Multi-turn Conversations

```typescript
const response = await sdk.processPrompt({
  prompt: 'What did I just say?',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, my name is Alice.' },
    { role: 'assistant', content: 'Hello Alice! Nice to meet you.' },
  ],
});
```

### Custom Message Role and Content

The SDK supports customizing the role and content of the compressed message:

```typescript
// Custom role (default: 'user')
const response1 = await sdk.processPrompt({
  prompt: 'Explain quantum computing',
  llmConfig: { apiKey: '...', model: 'gpt-4' },
  messageRole: 'system', // Can be 'user', 'system', 'assistant', etc.
});

// Custom content as string
const response2 = await sdk.processPrompt({
  prompt: 'Explain quantum computing',
  llmConfig: { apiKey: '...', model: 'gpt-4' },
  messageContent: 'Please explain this concept in simple terms: What is quantum computing?',
});

// Custom content with function (access compression stats)
const response3 = await sdk.processPrompt({
  prompt: 'Explain quantum computing',
  llmConfig: { apiKey: '...', model: 'gpt-4' },
  messageContent: (compressed) => {
    return `[Compressed from ${compressed.originalTokens} to ${compressed.compressedTokens} tokens]\n\n${compressed.compressed}`;
  },
});
```

**Supported Roles:**
- `'user'` - User message (default)
- `'system'` - System message/instruction
- `'assistant'` - Assistant response (for multi-turn conversations)
- Provider-specific roles are also supported (e.g., `'model'` for Google)

### Full Provider API Support

All provider-specific options are fully supported and passed through to the official SDKs:

```typescript
// OpenAI - All options supported
const response = await sdk.processPrompt({
  prompt: 'Generate a story',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.8,
    maxTokens: 150,
    // All OpenAI-specific options are supported
    n: 1,
    logit_bias: { '1234': 0.5 },
    user: 'test-user',
    response_format: { type: 'text' },
    tools: [...],
    tool_choice: 'auto',
    logprobs: true,
    presence_penalty: 0.5,
    frequency_penalty: 0.5,
    // ... any other OpenAI API option
  },
});

// Anthropic - All options supported
const response2 = await sdk.processPrompt({
  prompt: 'Explain AI',
  llmConfig: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-3-opus-20240229',
    maxTokens: 1024,
    temperature: 0.7,
    // All Anthropic-specific options
    system: 'You are a helpful assistant.',
    tools: [...],
    tool_choice: 'auto',
    stop_sequences: ['\n\nHuman:'],
    top_k: 50,
    metadata: { user_id: 'user-123' },
    // ... any other Anthropic API option
  },
});

// Google - All options supported
const response3 = await sdk.processPrompt({
  prompt: 'Generate content',
  llmConfig: {
    apiKey: process.env.GOOGLE_API_KEY!,
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 500,
    // All Google-specific options
    topK: 40,
    topP: 0.95,
    candidateCount: 1,
    safetySettings: [...],
    systemInstruction: 'You are a creative writer.',
    tools: [...],
    cachedContent: 'cache-id',
    // ... any other Google API option
  },
});
```

### Combining All Features

You can combine all features together:

```typescript
const response = await sdk.processPrompt({
  prompt: 'Continue the conversation',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.8,
    maxTokens: 150,
    // All provider options
    n: 1,
    tools: [...],
    tool_choice: 'auto',
  },
  // Multi-turn conversation
  messages: [
    { role: 'system', content: 'You are a creative writer.' },
    { role: 'user', content: 'Write a short story about a robot.' },
  ],
  // Custom role for the compressed prompt
  messageRole: 'user',
  // Custom content with compression stats
  messageContent: (compressed) => {
    return `[Compressed: ${compressed.originalTokens} → ${compressed.compressedTokens} tokens]\n\n${compressed.compressed}`;
  },
  // Compression options
  compressionOptions: {
    targetRatio: 0.5,
    preserveContext: true,
  },
});
```

### Streaming

```typescript
const stream = await sdk.processPromptStream({
  prompt: 'Tell a story',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}
```

## 🔧 Configuration

### Environment Variables

```bash
LESSTOKENS_API_KEY=your-less-tokens-api-key
OPENAI_API_KEY=your-openai-api-key
```

### Supported Providers

- ✅ **OpenAI** (`openai`) - Uses official `openai` SDK
- ✅ **Anthropic** (`anthropic`) - Uses official `@anthropic-ai/sdk`
- ✅ **Google** (`google`) - Uses official `@google/genai`
- ✅ **DeepSeek** (`deepseek`) - Uses official `openai` SDK (OpenAI-compatible API)
- ✅ **More providers coming soon...**

All providers support **full API feature set** through their official SDKs.

## 📊 Metrics

The SDK returns detailed usage metrics:

```typescript
{
  content: "LLM response...",
  usage: {
    promptTokens: 1000,
    completionTokens: 500,
    totalTokens: 1500,
    compressedTokens: 500,
    savings: 50 // 50% savings
  }
}
```

## ⚠️ Error Handling

```typescript
import { LessTokensSDK, LessTokensError } from '@hivehub/lesstokens-sdk-ts';

try {
  const response = await sdk.processPrompt({...});
} catch (error) {
  if (error instanceof LessTokensError) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  }
}
```

## 🔌 Full Provider API Support

The SDK uses official provider SDKs internally, which means:

- ✅ **All provider features** are supported
- ✅ **All provider options** can be passed through
- ✅ **Type-safe** with complete TypeScript definitions
- ✅ **Optimized performance** from official SDKs
- ✅ **Automatic updates** when providers add new features
- ✅ **Multi-turn conversations** via `messages` array
- ✅ **Custom message roles** and content
- ✅ **Complete compatibility** with all provider-specific options

### Supported Provider Options

**OpenAI** (`openai`):
- Common: `temperature`, `maxTokens`, `topP`, `frequencyPenalty`, `presencePenalty`, `stop`
- Advanced: `n`, `logit_bias`, `user`, `response_format`, `logprobs`, `top_logprobs`, `stream_options`
- Function Calling: `tools`, `tool_choice`, `parallel_tool_calls`
- And **all other OpenAI API options** - see [OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat/create)

**Anthropic** (`anthropic`):
- Common: `temperature`, `maxTokens`, `topP`, `topK`
- Advanced: `system`, `stop_sequences`, `metadata`, `stream`
- Function Calling: `tools`, `tool_choice`
- And **all other Anthropic API options** - see [Anthropic API Reference](https://docs.anthropic.com/claude/reference/messages_post)

**Google** (`google`):
- Common: `temperature`, `maxTokens`, `topP`, `topK`
- Advanced: `candidateCount`, `safetySettings`, `systemInstruction`, `cachedContent`
- Function Calling: `tools`, `toolConfig`
- And **all other Google API options** - see [Google GenAI API Reference](https://ai.google.dev/api)

**DeepSeek** (`deepseek`):
- Same as OpenAI (OpenAI-compatible API)
- All OpenAI options are supported

**Important**: All provider-specific options are passed through to the official SDKs via the `[key: string]: unknown` index signature, ensuring **100% compatibility** with all current and future provider features.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

We appreciate all contributions, whether they're bug reports, feature suggestions, documentation improvements, or code contributions.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🔗 Links

- [TypeDoc API Reference](./docs/index.html)
- [LessTokens Website](https://lesstokens.com)
- [Report Bug](https://github.com/lesstokens/sdk-typescript/issues)

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

Made with ❤️ by the Hive-Hub Team


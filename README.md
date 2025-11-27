# LessTokens SDK

[![npm version](https://img.shields.io/npm/v/@lesstokens/sdk.svg)](https://www.npmjs.com/package/@lesstokens/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

Modern and simple TypeScript SDK for integrating with the LessTokens token compression API.

## ✨ Features

- 🚀 **Simple & Modern**: Intuitive and easy-to-use API
- 🔒 **Type-Safe**: Fully typed with TypeScript
- ⚡ **Performant**: Optimized for high performance
- 📦 **Lightweight**: Minimal dependencies
- 🔄 **Streaming**: Support for streaming responses
- 🎯 **Flexible**: Supports multiple LLM providers
- 🔌 **Full Provider Support**: Uses official SDKs for complete feature support

## 📦 Instalação

```bash
npm install @lesstokens/sdk
# ou
yarn add @lesstokens/sdk
# ou
pnpm add @lesstokens/sdk
```

## 🚀 Quick Start

```typescript
import { LessTokensSDK } from '@lesstokens/sdk';

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

- [Complete Documentation](./docs/README.md)
- [API Reference](./docs/API.md)
- [Usage Examples](./docs/EXAMPLES.md)
- [Integration Analysis](./docs/INTEGRATION_ANALYSIS.md)

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
import { LessTokensSDK, LessTokensError } from '@lesstokens/sdk';

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

See [Integration Analysis](./docs/INTEGRATION_ANALYSIS.md) for details.

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guide](./CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🔗 Links

- [Complete Documentation](./docs/README.md)
- [API Reference](./docs/API.md)
- [Usage Examples](./docs/EXAMPLES.md)
- [Integration Analysis](./docs/INTEGRATION_ANALYSIS.md)
- [LessTokens Website](https://lesstokens.com)
- [Report Bug](https://github.com/lesstokens/sdk-typescript/issues)

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

Made with ❤️ by the LessTokens team


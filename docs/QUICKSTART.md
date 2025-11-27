# Quick Start - LessTokens SDK

Quick guide to get started with the LessTokens SDK in 5 minutes.

## 🚀 Installation

```bash
npm install @lesstokens/sdk
```

### Install Provider SDKs

Install the official SDKs for the providers you'll use:

```bash
# For OpenAI
npm install openai

# For Anthropic
npm install @anthropic-ai/sdk

# For Google
npm install @google/genai

# For DeepSeek (uses OpenAI SDK)
npm install openai
```

## ⚙️ Configuration

### 1. Get API Key

1. Visit [LessTokens Dashboard](https://dashboard.lesstokens.com)
2. Create an account or log in
3. Generate a new API key
4. Copy the key

### 2. Configure Environment Variables

Create a `.env` file:

```bash
LESSTOKENS_API_KEY=lt_1234567890abcdef
OPENAI_API_KEY=sk-... # or other LLM API key
```

### 3. Install Dependencies

```bash
npm install dotenv
```

## 💻 First Code

### Basic Example

Create an `index.ts` file:

```typescript
import { config } from 'dotenv';
import { LessTokensSDK } from '@lesstokens/sdk';

config(); // Load .env

const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
});

async function main() {
  try {
    const response = await sdk.processPrompt({
      prompt: 'Explain what artificial intelligence is in one sentence',
      llmConfig: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'gpt-4',
      },
    });

    console.log('Response:', response.content);
    console.log('Tokens saved:', response.usage.savings, '%');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

### Run

```bash
npx ts-node index.ts
```

## 📝 Common Examples

### 1. Simple Chat

```typescript
const response = await sdk.processPrompt({
  prompt: 'Hello, how are you?',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.7,
  },
});

console.log(response.content);
```

### 2. With Aggressive Compression

```typescript
const response = await sdk.processPrompt({
  prompt: 'Very long prompt here...',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
  compressionOptions: {
    targetRatio: 0.3, // Compress to 30%
    aggressive: true,
  },
});
```

### 3. Error Handling

```typescript
import { LessTokensSDK, LessTokensError } from '@lesstokens/sdk';

try {
  const response = await sdk.processPrompt({
    prompt: 'Your prompt',
    llmConfig: {
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4',
    },
  });
} catch (error) {
  if (error instanceof LessTokensError) {
    console.error('LessTokens error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### 4. Using DeepSeek

```typescript
const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'deepseek',
});

const response = await sdk.processPrompt({
  prompt: 'Write a function to calculate fibonacci',
  llmConfig: {
    apiKey: process.env.DEEPSEEK_API_KEY!,
    model: 'deepseek-coder',
    temperature: 0.7,
  },
});

console.log(response.content);
```

## 🎯 Next Steps

1. **Read the [Complete Documentation](./README.md)**
2. **See [Advanced Examples](./EXAMPLES.md)**
3. **Consult [API Reference](./API.md)**

## ❓ Common Issues

### Error: "Invalid API Key"

- Verify the key is correct in `.env`
- Ensure the `.env` file is being loaded
- Check if the key has expired

### Error: "Provider not supported"

- Verify the provider is spelled correctly
- Check the list of supported providers in the documentation

### Error: "Timeout"

- Increase the timeout in configuration:
  ```typescript
  const sdk = new LessTokensSDK({
    apiKey: process.env.LESSTOKENS_API_KEY!,
    provider: 'openai',
    timeout: 60000, // 60 seconds
  });
  ```

### Error: "Provider SDK not found"

- Install the required provider SDK:
  ```bash
  npm install openai  # for OpenAI/DeepSeek
  npm install @anthropic-ai/sdk  # for Anthropic
  npm install @google/genai  # for Google
  ```

## 🔗 Resources

- [Complete Documentation](./README.md)
- [API Reference](./API.md)
- [Examples](./EXAMPLES.md)
- [Support](https://github.com/lesstokens/sdk-typescript/issues)

---

**Ready to start?** See the [complete documentation](./README.md) for more details!

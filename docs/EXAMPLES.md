# Usage Examples - LessTokens SDK

Collection of practical examples for using the LessTokens SDK.

## 📚 Table of Contents

- [Basic Examples](#basic-examples)
- [Intermediate Examples](#intermediate-examples)
- [Advanced Examples](#advanced-examples)
- [Real-World Use Cases](#real-world-use-cases)

## 🚀 Basic Examples

### 1. First Use

```typescript
import { LessTokensSDK } from '@lesstokens/sdk';

// Initialize SDK
const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
});

// Process prompt
const response = await sdk.processPrompt({
  prompt: 'What is artificial intelligence?',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
});

console.log('Response:', response.content);
console.log('Tokens saved:', response.usage.savings, '%');
```

### 2. With Custom Configuration

```typescript
const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
  timeout: 60000, // 60 seconds
});

const response = await sdk.processPrompt({
  prompt: 'Explain machine learning',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.9,
    // All OpenAI API options are supported
  },
});
```

### 3. Basic Error Handling

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
  
  console.log(response.content);
} catch (error) {
  if (error instanceof LessTokensError) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## 🔧 Intermediate Examples

### 4. Aggressive Compression

```typescript
const response = await sdk.processPrompt({
  prompt: 'Very long prompt with lots of information...',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
  compressionOptions: {
    targetRatio: 0.3, // Compress to 30% of original size
    aggressive: true,
    preserveContext: true,
  },
});

console.log('Savings:', response.usage.savings, '%');
```

### 5. Response Streaming

```typescript
const stream = await sdk.processPromptStream({
  prompt: 'Tell a story about a robot that learns to feel',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
});

console.log('Streaming response:');
for await (const chunk of stream) {
  if (chunk.done) {
    console.log('\n\nTokens saved:', chunk.usage?.savings, '%');
  } else {
    process.stdout.write(chunk.content);
  }
}
```

### 6. Multiple Prompts

```typescript
const prompts = [
  'Explain what deep learning is',
  'How does a neural network work?',
  'What are the applications of AI?',
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

responses.forEach((response, index) => {
  console.log(`\nPrompt ${index + 1}:`);
  console.log(response.content);
  console.log(`Savings: ${response.usage.savings}%`);
});
```

### 7. Compression Only (Without LLM)

```typescript
const compressed = await sdk.compressPrompt(
  'Very long prompt that needs to be compressed...',
  {
    targetRatio: 0.5,
    preserveContext: true,
  }
);

console.log('Original tokens:', compressed.originalTokens);
console.log('Compressed tokens:', compressed.compressedTokens);
console.log('Savings:', compressed.savings, '%');
console.log('Compressed prompt:', compressed.compressed);
```

### 8. With Different Providers

```typescript
// OpenAI
const openaiResponse = await sdk.processPrompt({
  prompt: 'Your prompt',
  llmConfig: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  },
});

// Anthropic
const anthropicSDK = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'anthropic',
});

const anthropicResponse = await anthropicSDK.processPrompt({
  prompt: 'Your prompt',
  llmConfig: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-3-opus-20240229',
  },
});

// Google
const googleSDK = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'google',
});

const googleResponse = await googleSDK.processPrompt({
  prompt: 'Your prompt',
  llmConfig: {
    apiKey: process.env.GOOGLE_API_KEY!,
    model: 'gemini-pro',
  },
});

// DeepSeek
const deepseekSDK = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'deepseek',
});

const deepseekResponse = await deepseekSDK.processPrompt({
  prompt: 'Write a Python function to sort a list',
  llmConfig: {
    apiKey: process.env.DEEPSEEK_API_KEY!,
    model: 'deepseek-coder',
    temperature: 0.7,
  },
});
```

## 🎯 Advanced Examples

### 9. Wrapper Class with Cache

```typescript
import { LessTokensSDK } from '@lesstokens/sdk';

class CachedLessTokensSDK {
  private sdk: LessTokensSDK;
  private cache: Map<string, any> = new Map();

  constructor(config: LessTokensConfig) {
    this.sdk = new LessTokensSDK(config);
  }

  async processPrompt(options: ProcessPromptOptions): Promise<LLMResponse> {
    const cacheKey = `${options.prompt}-${JSON.stringify(options.llmConfig)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await this.sdk.processPrompt(options);
    this.cache.set(cacheKey, response);
    
    return response;
  }
}

// Usage
const cachedSDK = new CachedLessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
});
```

### 10. With Retry and Circuit Breaker

```typescript
class ResilientLessTokensSDK {
  private sdk: LessTokensSDK;
  private failures = 0;
  private readonly maxFailures = 5;
  private circuitOpen = false;

  constructor(config: LessTokensConfig) {
    this.sdk = new LessTokensSDK(config);
  }

  async processPrompt(options: ProcessPromptOptions): Promise<LLMResponse> {
    if (this.circuitOpen) {
      throw new Error('Circuit breaker is open');
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await this.sdk.processPrompt(options);
        this.failures = 0; // Reset on success
        return response;
      } catch (error) {
        lastError = error as Error;
        this.failures++;
        
        if (this.failures >= this.maxFailures) {
          this.circuitOpen = true;
          setTimeout(() => {
            this.circuitOpen = false;
            this.failures = 0;
          }, 60000); // 1 minute
        }
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Failed after retries');
  }
}
```

### 11. Batch Processing

```typescript
async function processBatch(
  sdk: LessTokensSDK,
  prompts: string[],
  batchSize: number = 5
): Promise<LLMResponse[]> {
  const results: LLMResponse[] = [];

  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(prompt =>
        sdk.processPrompt({
          prompt,
          llmConfig: {
            apiKey: process.env.OPENAI_API_KEY!,
            model: 'gpt-4',
          },
        })
      )
    );

    results.push(...batchResults);
  }

  return results;
}

// Usage
const prompts = Array(20).fill('Example prompt');
const responses = await processBatch(sdk, prompts, 5);
```

### 12. With Logging and Metrics

```typescript
class MonitoredLessTokensSDK {
  private sdk: LessTokensSDK;
  private metrics = {
    totalRequests: 0,
    totalTokensSaved: 0,
    averageSavings: 0,
    errors: 0,
  };

  constructor(config: LessTokensConfig) {
    this.sdk = new LessTokensSDK(config);
  }

  async processPrompt(options: ProcessPromptOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const response = await this.sdk.processPrompt(options);
      
      const duration = Date.now() - startTime;
      if (response.usage.savings) {
        this.metrics.totalTokensSaved += response.usage.savings;
        this.metrics.averageSavings = 
          this.metrics.totalTokensSaved / this.metrics.totalRequests;
      }

      console.log(`[${duration}ms] Processed with ${response.usage.savings}% savings`);
      
      return response;
    } catch (error) {
      this.metrics.errors++;
      console.error('Error processing:', error);
      throw error;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
```

## 💼 Real-World Use Cases

### 13. Chatbot with Compression

```typescript
import { LessTokensSDK } from '@lesstokens/sdk';
import express from 'express';

const app = express();
const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const response = await sdk.processPrompt({
      prompt: message,
      llmConfig: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'gpt-4',
        temperature: 0.7,
      },
      compressionOptions: {
        targetRatio: 0.6,
        preserveContext: true,
      },
    });

    res.json({
      reply: response.content,
      savings: response.usage.savings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error processing message' });
  }
});

app.listen(3000);
```

### 14. Document Processing

```typescript
async function processDocument(
  sdk: LessTokensSDK,
  document: string,
  questions: string[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  for (const question of questions) {
    const prompt = `Document: ${document}\n\nQuestion: ${question}`;
    
    const response = await sdk.processPrompt({
      prompt,
      llmConfig: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'gpt-4',
      },
      compressionOptions: {
        targetRatio: 0.4, // Compress document to 40%
        preserveContext: true,
      },
    });

    results[question] = response.content;
  }

  return results;
}
```

### 15. API Wrapper with Middleware

```typescript
import { LessTokensSDK } from '@lesstokens/sdk';

class APIMiddleware {
  private sdk: LessTokensSDK;

  constructor() {
    this.sdk = new LessTokensSDK({
      apiKey: process.env.LESSTOKENS_API_KEY!,
      provider: 'openai',
    });
  }

  async compressAndForward(
    prompt: string,
    llmConfig: LLMConfig
  ): Promise<LLMResponse> {
    // Validation
    if (!prompt || prompt.length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 1000000) {
      throw new Error('Prompt too long');
    }

    // Processing
    return await this.sdk.processPrompt({
      prompt,
      llmConfig,
      compressionOptions: {
        targetRatio: 0.5,
        preserveContext: true,
      },
    });
  }
}
```

### 16. Next.js API Route Integration

```typescript
// pages/api/chat.ts
import { LessTokensSDK } from '@lesstokens/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'openai',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    const response = await sdk.processPrompt({
      prompt,
      llmConfig: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'gpt-4',
      },
    });

    res.status(200).json({
      content: response.content,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing prompt' });
  }
}
```

### 17. Code Generation with DeepSeek

```typescript
const sdk = new LessTokensSDK({
  apiKey: process.env.LESSTOKENS_API_KEY!,
  provider: 'deepseek',
});

async function generateCode(description: string): Promise<string> {
  const response = await sdk.processPrompt({
    prompt: `Write a function that: ${description}`,
    llmConfig: {
      apiKey: process.env.DEEPSEEK_API_KEY!,
      model: 'deepseek-coder',
      temperature: 0.3, // Lower temperature for more deterministic code
      max_tokens: 2000,
    },
    compressionOptions: {
      targetRatio: 0.5,
      preserveContext: true,
    },
  });

  return response.content;
}

// Usage
const code = await generateCode('sorts an array of numbers using quicksort');
console.log(code);
```

---

## 🔍 Tips and Best Practices

1. **Always use environment variables** for API keys
2. **Validate inputs** before sending to SDK
3. **Implement retry logic** for critical requests
4. **Monitor metrics** for token savings
5. **Use aggressive compression** only when necessary
6. **Cache responses** when appropriate
7. **Handle errors properly** with specific error codes
8. **Use provider-specific features** through official SDKs
9. **Monitor token usage** to optimize costs
10. **Test with different providers** to find the best fit

---

For more information, see the [complete documentation](./README.md).

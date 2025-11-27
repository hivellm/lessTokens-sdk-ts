# LessTokens SDK Specification

## ADDED Requirements

### Requirement: LessTokens SDK Core
The system SHALL provide a TypeScript SDK for integrating with the LessTokens token compression API and multiple LLM providers.

#### Scenario: SDK Initialization
Given a developer wants to use the LessTokens SDK
When they instantiate the SDK with a valid API key and provider
Then the SDK MUST be initialized successfully and ready to process prompts

#### Scenario: Process Prompt with Compression
Given a developer has initialized the SDK
When they call processPrompt with a prompt and LLM configuration
Then the SDK MUST compress the prompt via LessTokens API, send it to the configured LLM provider, and return the response with usage metrics

#### Scenario: Stream Response
Given a developer wants to stream LLM responses
When they call processPromptStream with a prompt
Then the SDK MUST return an async iterable that yields response chunks in real-time

#### Scenario: Compression Only
Given a developer wants to compress a prompt without sending to LLM
When they call compressPrompt with a prompt
Then the SDK MUST return the compressed prompt with token savings metrics

### Requirement: LessTokens API Integration
The system SHALL integrate with the LessTokens API for token compression.

#### Scenario: Compress Prompt
Given a valid LessTokens API key
When the SDK sends a prompt to the LessTokens API
Then the API MUST return a compressed version of the prompt with compression metrics

#### Scenario: Handle Compression Errors
Given the LessTokens API returns an error
When compression fails
Then the SDK MUST throw a LessTokensError with appropriate error code and message

### Requirement: Provider Integration
The system SHALL support multiple LLM providers using their official SDKs.

#### Scenario: OpenAI Provider
Given the provider is set to 'openai'
When processing a prompt
Then the SDK MUST use the official OpenAI SDK to send the compressed prompt and receive the response

#### Scenario: Anthropic Provider
Given the provider is set to 'anthropic'
When processing a prompt
Then the SDK MUST use the official Anthropic SDK to send the compressed prompt and receive the response

#### Scenario: Google Provider
Given the provider is set to 'google'
When processing a prompt
Then the SDK MUST use the official Google GenAI SDK to send the compressed prompt and receive the response

#### Scenario: DeepSeek Provider
Given the provider is set to 'deepseek'
When processing a prompt
Then the SDK MUST use the official OpenAI SDK with DeepSeek's base URL to send the compressed prompt and receive the response

#### Scenario: Pass-Through Provider Options
Given a developer provides provider-specific configuration options
When processing a prompt
Then the SDK MUST pass all options to the official provider SDK without modification

### Requirement: Type Safety
The system SHALL provide complete TypeScript type definitions for all public APIs.

#### Scenario: Type Definitions
Given a developer uses the SDK
When they import types and interfaces
Then all types MUST be properly defined and exported for use in TypeScript projects

#### Scenario: Type Inference
Given a developer uses the SDK methods
When TypeScript compiles the code
Then all method parameters and return types MUST be correctly inferred

### Requirement: Error Handling
The system SHALL provide comprehensive error handling with specific error codes.

#### Scenario: Invalid API Key
Given an invalid LessTokens API key
When initializing the SDK or making requests
Then the SDK MUST throw a LessTokensError with code INVALID_API_KEY

#### Scenario: Compression Failure
Given the LessTokens API fails to compress a prompt
When compression is attempted
Then the SDK MUST throw a LessTokensError with code COMPRESSION_FAILED

#### Scenario: LLM API Error
Given the LLM provider API returns an error
When processing a prompt
Then the SDK MUST throw a LessTokensError with code LLM_API_ERROR and include provider error details

#### Scenario: Timeout Handling
Given a request exceeds the configured timeout
When processing a prompt
Then the SDK MUST throw a LessTokensError with code TIMEOUT

### Requirement: Metrics and Usage Tracking
The system SHALL provide detailed usage metrics including token savings.

#### Scenario: Calculate Token Savings
Given a prompt is compressed and sent to LLM
When the response is returned
Then the SDK MUST calculate and include token savings percentage in the response

#### Scenario: Usage Information
Given a prompt is processed
When the response is returned
Then the SDK MUST include detailed usage information (prompt tokens, completion tokens, total tokens, compressed tokens, savings)

### Requirement: Streaming Support
The system SHALL support streaming responses from LLM providers.

#### Scenario: Stream Response Chunks
Given a developer requests streaming
When processing a prompt
Then the SDK MUST return an async iterable that yields response chunks as they arrive

#### Scenario: Stream Completion
Given a streaming response
When the stream completes
Then the SDK MUST include final usage metrics in the last chunk

### Requirement: Input Validation
The system SHALL validate all inputs before processing.

#### Scenario: Validate Prompt
Given a prompt is provided
When processing
Then the SDK MUST validate that the prompt is a non-empty string and within size limits

#### Scenario: Validate Configuration
Given configuration is provided
When initializing the SDK
Then the SDK MUST validate that required fields (apiKey, provider) are present and valid

### Requirement: Retry Logic
The system SHALL implement retry logic for transient failures.

#### Scenario: Retry on Network Error
Given a network error occurs
When making a request
Then the SDK MUST automatically retry with exponential backoff up to the maximum retry count

#### Scenario: Retry on Rate Limit
Given a rate limit error occurs
When making a request
Then the SDK MUST automatically retry after the appropriate delay

### Requirement: Response Normalization
The system SHALL normalize responses from different providers into a unified format.

#### Scenario: Normalize OpenAI Response
Given a response from OpenAI provider
When processing the response
Then the SDK MUST normalize it to the LLMResponse format

#### Scenario: Normalize Anthropic Response
Given a response from Anthropic provider
When processing the response
Then the SDK MUST normalize it to the LLMResponse format

#### Scenario: Normalize Google Response
Given a response from Google provider
When processing the response
Then the SDK MUST normalize it to the LLMResponse format

#### Scenario: Normalize DeepSeek Response
Given a response from DeepSeek provider
When processing the response
Then the SDK MUST normalize it to the LLMResponse format


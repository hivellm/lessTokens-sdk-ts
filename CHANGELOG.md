# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-27

### Added
- Initial release of LessTokens SDK
- Support for OpenAI, Anthropic, Google, and DeepSeek providers
- Token compression via LessTokens API
- Streaming response support
- Comprehensive error handling
- Full TypeScript type definitions
- Complete test coverage (96%+)
- Documentation and examples

### Features
- **LessTokensSDK**: Main SDK class for prompt compression and LLM integration
- **processPrompt**: Process prompts with compression and send to LLM
- **processPromptStream**: Stream responses with compression metrics
- **compressPrompt**: Compress prompts without sending to LLM
- **Full Provider Support**: Uses official SDKs for complete feature support
- **Type Safety**: Fully typed with TypeScript
- **Error Handling**: Comprehensive error classes and handling
- **Multi-turn Conversations**: Support for conversation history via `messages` array
- **Custom Message Role**: Customize message role (default: 'user')
- **Custom Message Content**: Customize message content with string or function
- **Full API Compatibility**: All provider-specific options are passed through to official SDKs

### Enhanced
- **Maximum Compatibility**: All options from official SDKs are supported and passed through
- **Multi-turn Support**: Added `messages` option for conversation history
- **Message Customization**: Added `messageRole` and `messageContent` options
- **API Response Parsing**: Fixed parsing of LessTokens API response structure
- **Documentation**: Comprehensive JSDoc comments for all public APIs
- **Type Definitions**: Enhanced type definitions with full provider option support

### Technical Details
- Built with TypeScript 5.9+
- Uses official provider SDKs (openai, @anthropic-ai/sdk, @google/genai)
- ESM module support
- Comprehensive test suite with Vitest (242 tests, 96%+ coverage)
- ESLint v9 (flat config) and Prettier configuration
- Full JSDoc documentation with TypeDoc generation
- All provider-specific options supported via index signature

[0.1.0]: https://github.com/lesstokens/sdk-typescript/releases/tag/v0.1.0


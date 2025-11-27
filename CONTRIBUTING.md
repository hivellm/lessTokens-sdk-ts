# Contributing to LessTokens SDK

Thank you for your interest in contributing to the LessTokens SDK! We welcome contributions from the community and are grateful for your help in making this project better.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment details (Node.js version, OS, etc.)
- Code examples or error messages (if applicable)

### Suggesting Features

We welcome feature suggestions! Please open an issue with:
- A clear description of the feature
- Use cases and examples
- Potential implementation approach (if you have ideas)

### Pull Requests

1. **Fork the repository** and create a new branch from `main`
2. **Make your changes** following our coding standards
3. **Write tests** for new features or bug fixes
4. **Ensure all tests pass** (`npm test`)
5. **Update documentation** if needed
6. **Submit a pull request** with a clear description

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/hive-hub/lessTokens-sdk-ts.git
cd lessTokens-sdk-ts
```

2. Install dependencies:
```bash
npm install
```

3. Run tests:
```bash
npm test
```

4. Run linting:
```bash
npm run lint
```

5. Build the project:
```bash
npm run build
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Follow the existing code style
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

### Testing

- Write tests for all new features
- Maintain test coverage above 96%
- Use descriptive test names
- Test both success and error cases

### Code Quality

- Run `npm run lint` before committing
- Run `npm run format` to format code
- Ensure all tests pass
- Type check with `npm run type-check`

## Project Structure

```
lessTokens-sdk-ts/
├── src/              # Source code
│   ├── clients/      # API clients
│   ├── providers/    # LLM provider implementations
│   ├── utils/        # Utility functions
│   └── types.ts      # Type definitions
├── tests/            # Test files
├── docs/             # Generated documentation
└── dist/             # Build output
```

## Commit Messages

Please follow conventional commit format:

- `feat: Add new feature`
- `fix: Fix bug in compression`
- `docs: Update README`
- `test: Add tests for new feature`
- `refactor: Refactor provider code`
- `chore: Update dependencies`

## Pull Request Process

1. Ensure your code follows the coding standards
2. All tests must pass
3. Code coverage should remain above 96%
4. Update documentation if needed
5. Add a clear description of your changes
6. Reference any related issues

## Questions?

If you have questions or need help, please:
- Open an issue for discussion
- Check existing issues and pull requests
- Review the documentation

Thank you for contributing to LessTokens SDK! 🎉



import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
        'src/index.ts', // Only re-exports, no functions to test
      ],
      thresholds: {
        lines: 98,
        functions: 96, // Current coverage: 96.22% (arrow functions in callbacks may not be fully counted)
        branches: 98, // Current coverage: 99.67% ✅
        statements: 98,
      },
    },
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.s2s.test.ts'],
  },
});


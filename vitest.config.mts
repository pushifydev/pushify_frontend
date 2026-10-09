import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Mirror the tsconfig "@/*" path alias so modules that import via "@/..." load in tests
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    environment: 'node',
    // Unit tests only — browser flows live in the Playwright suite.
    include: [
      'lib/**/*.test.ts',
      'components/**/*.test.ts',
      'stores/**/*.test.ts',
      'app/**/*.test.tsx',
    ],
  },
});

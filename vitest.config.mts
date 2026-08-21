import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Unit tests only — browser flows live in the Playwright suite.
    include: ['lib/**/*.test.ts', 'components/**/*.test.ts'],
  },
});

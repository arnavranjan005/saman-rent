import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30000,
    // DB-backed integration tests run serially against the shared dev database.
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
});

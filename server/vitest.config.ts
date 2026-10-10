import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30000,
    // DB-backed integration tests run serially against the shared dev database.
    // (poolOptions.forks.singleFork was removed in Vitest 4+; maxWorkers: 1
    // is the equivalent serial setting.)
    pool: 'forks',
    maxWorkers: 1,
  },
});

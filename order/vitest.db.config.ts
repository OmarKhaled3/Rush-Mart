import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// DB tests run against the local Supabase stack (`npm run db:start`).
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/db/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});

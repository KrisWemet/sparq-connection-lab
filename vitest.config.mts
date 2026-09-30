import { defineConfig } from 'vitest/config';
import path from 'path';

// Unit tests for constitution guarantees (§13). Pure logic only — no
// network, no database. Playwright e2e tests live separately in ./e2e.
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});

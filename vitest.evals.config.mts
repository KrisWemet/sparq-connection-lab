import { defineConfig } from 'vitest/config';
import path from 'path';

// Live Peter evals (docs/evals/resistance-handling.md). NOT part of `npm test`:
// they call OpenRouter with PETER_MODELS and need OPENROUTER_API_KEY.
// Run: OPENROUTER_API_KEY=... npm run eval:peter
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: { include: ['evals/**/*.eval.ts'], environment: 'node', testTimeout: 1_200_000 },
});

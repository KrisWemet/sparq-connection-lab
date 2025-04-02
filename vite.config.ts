/// <reference types="vitest" />
import { defineConfig, mergeConfig, type UserConfig, type PluginOption } from "vite";
import { defineConfig as defineVitestConfig } from 'vitest/config'
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Define the Vite config generation function
const generateViteConfig = ({ mode }: { mode: string }): UserConfig => {
  // Define base plugins explicitly typed
  const plugins: PluginOption[] = [react()];

  // Conditionally add componentTagger in development mode
  if (mode === 'development') {
    // Ensure componentTagger() returns a compatible type, casting if necessary
    // or assuming it returns PluginOption based on its usage
    plugins.push(componentTagger() as PluginOption);
  }

  return {
    server: {
      host: "::",
      port: 8080,
      // Add headers to allow 'unsafe-eval' for development
      headers: {
        "Content-Security-Policy": "script-src 'self' 'unsafe-eval' 'unsafe-inline';"
      }
    },
    plugins: plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Disable CSP for development
    build: {
      sourcemap: mode === 'development',
      minify: mode !== 'development',
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    }
  };
};

// Define the Vitest config object
const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true, // If you have CSS imports in components
  },
});

// Export a function that merges the generated Vite config with Vitest config
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const baseViteConfig = generateViteConfig({ mode });
  // Type assertion might be needed if mergeConfig struggles with inference
  return mergeConfig(baseViteConfig, vitestConfig as UserConfig);
});

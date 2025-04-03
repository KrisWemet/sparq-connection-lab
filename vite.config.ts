/// <reference types="vitest" />
import { defineConfig, mergeConfig, type UserConfig, type PluginOption } from "vite";
import { defineConfig as defineVitestConfig } from 'vitest/config'
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";
import { componentTagger } from "lovable-tagger";

// Define the Vite config generation function
const generateViteConfig = ({ mode }: { mode: string }): UserConfig => {
  // Define base plugins explicitly typed
  const plugins: PluginOption[] = [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sparq Connect',
        short_name: 'Sparq',
        description: 'Strengthen your relationship with meaningful goals',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ];

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

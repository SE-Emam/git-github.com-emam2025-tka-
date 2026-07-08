import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo-light.png', 'logo-dark.png', 'favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
        workbox: {
          maximumFileSizeToCacheInBytes: 4000000, // Increase to 4MB for large bundles
        },
        manifest: {
          name: 'TKA Egypt - Tech Academy',
          short_name: 'TKA Egypt',
          description: 'The best tech academy in Egypt for AI and programming.',
          theme_color: '#3b82f6',
          icons: [
            {
              src: 'logo-light.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'logo-light.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'logo-light.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    build: {
      target: 'esnext'
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

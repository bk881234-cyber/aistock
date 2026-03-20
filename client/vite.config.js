import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: false, // manifest.json은 public/에서 직접 사용
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        runtimeCaching: [
          {
            // API 응답: NetworkFirst (오프라인 시 캐시 폴백)
            urlPattern: /\/api\/market\/(overview|indices|fx|commodities)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'market-api',
              expiration: { maxEntries: 20, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // 폰트 캐시
            urlPattern: /https:\/\/cdn\.jsdelivr\.net\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor':  ['lightweight-charts', 'd3'],
          'state-vendor':  ['zustand', 'axios'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    // 청크 분리: 벤더 라이브러리 별도 번들
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
      // 로컬 개발: Node.js 서버로 프록시
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});

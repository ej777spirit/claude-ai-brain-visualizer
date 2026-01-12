import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => ({
  root: '.',
  build: {
    outDir: 'dist',
    // Sourcemaps are great for debugging but add significant weight to production builds.
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Keep the heaviest deps split for better browser caching.
          if (id.includes('/three/')) return 'three';
          if (id.includes('/axios/')) return 'axios';
          return 'vendor';
        }
      }
    }
  },
  esbuild: mode === 'production'
    ? { drop: ['console', 'debugger'] }
    : undefined,
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}));
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  root: '.',
  plugins: [viteCompression()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production build size
    minify: 'esbuild', // Faster and good enough
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          chart: ['chart.js/auto'],
          vendor: ['axios', 'mathjs']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
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
      '@': '/src'
    }
  }
});

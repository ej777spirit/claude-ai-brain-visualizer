import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    root: '.',
    build: {
      outDir: 'dist',
      // Disable source maps in production for smaller bundle
      sourcemap: !isProduction,
      // Use terser for better minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.debug'] : [],
        },
        mangle: {
          safari10: true,
        },
      },
      // Target modern browsers for smaller bundles
      target: 'es2020',
      // Chunk size warnings at 600kb (Three.js is large but necessary)
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Better chunk splitting for caching
          manualChunks: (id) => {
            // Three.js and addons in separate chunk
            if (id.includes('node_modules/three')) {
              return 'three-vendor';
            }
          },
          // Asset naming for better caching
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // CSS optimization
      cssCodeSplit: true,
      cssMinify: true,
      // Inline small assets
      assetsInlineLimit: 4096,
    },
    plugins: [
      // Gzip compression (generates .gz files in dist)
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024, // Only compress files > 1kb
        deleteOriginFile: false,
      }),
      // Brotli compression (generates .br files in dist)
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false,
      }),
      // Bundle analysis (only in production build)
      isProduction && visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['three'],
      exclude: [],
    },
    // Enable esbuild optimizations
    esbuild: {
      // Remove console.log in production
      drop: isProduction ? ['console', 'debugger'] : [],
      legalComments: 'none',
    },
  };
});

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: env.VITE_API_URL || 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      plugins: [
        react(),
        // Bundle analyzer - generates stats.html on build
        visualizer({
          filename: './dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        }) as any,
      ],
      define: {
        // SECURITY: All API calls now go through backend proxy
        // No API keys are exposed to the client
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3001')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Separate React and React-DOM
              'react-vendor': ['react', 'react-dom'],
              // Separate Chart.js
              'chart-vendor': ['chart.js', 'react-chartjs-2'],
              // Separate markdown
              'markdown-vendor': ['react-markdown'],
              // Separate large data files
              'data': [
                './data/distributions',
                './data/chartData',
                './data/learningPaths',
                './data/deepAnalysis'
              ]
            }
          }
        },
        // Increase chunk size warning limit (default is 500kb)
        chunkSizeWarningLimit: 1000,
      }
    };
});

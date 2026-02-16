import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    root: '.',
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: false,
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.venv/**',
          '**/ai_sherly_llmindex_rag/**',
          '**/.git/**',
          '**/dist/**'
        ]
      },
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true
        },
        '/ws': {
          target: 'ws://localhost:5001',
          ws: true
        }
      }
    },
    build: {
      outDir: 'dist',
    }
  };
});
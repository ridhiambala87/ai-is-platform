import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const port = Number(process.env.PORT ?? 5173);

// Windows Git Bash path corruption bypass trick
const rawBasePath = process.env.BASE_PATH ?? '/';
const basePath = rawBasePath.includes('Program Files') ? '/' : rawBasePath;

const isReplit = process.env.REPL_ID !== undefined;

// When running locally, proxy /api calls to the API server on port 8080.
// On Replit the platform handles routing so no proxy is needed.
const apiProxy = !isReplit
  ? {
      '/api': {
        target: `http://localhost:${process.env.API_PORT ?? 8080}`,
        changeOrigin: true,
      },
    }
  : {};

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' && isReplit
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
server: {
  host: '0.0.0.0',
  port: parseInt(process.env.PORT || '5173'), // ← Yeh 5173 utha raha hai (Frontend port)
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8080', // ← Backend server yahan 8080 par sunega
      changeOrigin: true,
      secure: false,
    }
  }
},
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});

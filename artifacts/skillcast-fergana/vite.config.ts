import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

// Local development only: `pnpm dev` sets API_PROXY_TARGET so relative /api
// requests reach the local API server. Replit routes /api itself and never
// sets this variable, so its behaviour is unchanged.
const apiProxyTarget = process.env.API_PROXY_TARGET;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

// ─── Content-Security-Policy ───────────────────────────────────────────────
// Development: Vite's client, React Refresh and the Replit dev plugins need
// inline and eval'd scripts plus a WebSocket for hot reload, so the dev
// server sends a relaxed policy as a header. Production builds get a strict
// policy as a <meta> tag: no 'unsafe-eval', no inline scripts.
const FONTS = 'https://fonts.googleapis.com';
const FONT_FILES = 'https://fonts.gstatic.com';
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com",
  `style-src 'self' 'unsafe-inline' ${FONTS}`,
  `font-src 'self' data: ${FONT_FILES}`,
  "img-src 'self' data: blob: https:",
  "connect-src 'self' ws: wss: http://localhost:* http://127.0.0.1:* https:",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
].join('; ');
export const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  `style-src 'self' 'unsafe-inline' ${FONTS}`,
  `font-src 'self' data: ${FONT_FILES}`,
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function contentSecurityPolicy(): Plugin {
  return {
    name: 'skillcast-csp',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Content-Security-Policy', DEV_CSP);
        next();
      });
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (ctx.server) return html; // dev: header above
        return html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${PROD_CSP}" />`);
      },
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    contentSecurityPolicy(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
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
    port,
    strictPort: true,
    // `pnpm dev` sets WEB_HOST=127.0.0.1 (or HOST from .env); Replit needs 0.0.0.0.
    host: process.env.WEB_HOST || '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: false,
    },
    ...(apiProxyTarget ? { proxy: { '/api': { target: apiProxyTarget, changeOrigin: true } } } : {}),
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});

// PWA "HNC Evaluasi" (Fase 2). Root = app/, output = dist/. Everything (fonts, logos, PDF chunk, encrypted
// activation payload) is precached so the app cold-starts and renders PDFs offline.
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const BASE = '/hnc-evaluasi/';
const TEMA = '#1B4256';
const VERSI = `${(JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }).version}+${new Date().toISOString().slice(0, 10)}`;

export default defineConfig({
  base: BASE,
  root: fileURLToPath(new URL('./app', import.meta.url)),
  publicDir: fileURLToPath(new URL('./app/public', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
    target: 'safari16',
    chunkSizeWarningLimit: 4000,
    assetsInlineLimit: 0,
  },
  define: { __VERSI__: JSON.stringify(VERSI), 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production') },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      injectRegister: null,
      registerType: 'prompt',
      includeAssets: ['ikon-180.png', 'logo-kecil.png'],
      manifest: {
        id: BASE,
        name: 'HNC Evaluasi',
        short_name: 'HNC Evaluasi',
        description: 'Evaluasi & laporan perkembangan hidroterapi – Hydro Neuroforge Center',
        lang: 'id',
        display: 'standalone',
        orientation: 'portrait',
        scope: BASE,
        start_url: BASE,
        theme_color: TEMA,
        background_color: '#F4F8F9',
        icons: [
          { src: 'ikon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'ikon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'ikon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,ttf,woff2,json,bin,webmanifest}'],
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});

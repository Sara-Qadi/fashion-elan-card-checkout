import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

/**
 * `base` differs per host, so it is an input rather than a constant:
 *   - GitHub Pages serves the app from /<repo>/, which is the build default
 *   - a root deploy (Vercel, Netlify, or the future shell) needs VITE_BASE=/
 * The dev server always stays at '/' so local URLs remain short.
 *
 * Keyed on `mode`, not `command`: `vite preview` runs as a *serve* command in
 * production mode, so keying on `command` would serve the built subpath assets
 * from '/' and preview would 404 on every chunk while the real build was fine.
 */
const GITHUB_PAGES_BASE = '/fashion-elan-card-checkout/'

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE ?? (mode === 'production' ? GITHUB_PAGES_BASE : '/'),
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
}))

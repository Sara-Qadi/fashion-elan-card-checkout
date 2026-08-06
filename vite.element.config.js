import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

/**
 * Second build target: the shell-facing custom element.
 *
 * Differences from the standalone build that matter:
 *   - one entry, one output file, and a STABLE name. The shell hardcodes this
 *     URL, so a content hash here would break integration on every deploy.
 *   - inlineDynamicImports: the views are lazy-loaded in the standalone app, but
 *     a <script> tag the shell loads cross-origin cannot resolve relative chunk
 *     URLs against our origin. Everything ships in the one file instead.
 *   - plain `vue()`, NOT `vue({ customElement: true })`, and no `styles: 'sass'`.
 *     Those two are for shadow-DOM elements: they hand every component its own
 *     copy of the stylesheet, which built a 7MB bundle here. This element renders
 *     in light DOM, so normal CSS extraction is both correct and ~10x smaller.
 *
 * scripts/inline-element-css.mjs then folds the emitted CSS into the JS, so the
 * shell has exactly one URL to load.
 */
export default defineConfig({
  base: './',
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Vite inlines every asset as base64 in library mode, and the MDI webfont
      // is ~1MB before encoding — it alone made this bundle 7MB. The element
      // injects the same stylesheet from a CDN at runtime instead (see
      // src/element.js), which keeps icons working and the bundle sane.
      '@mdi/font/css/materialdesignicons.css': fileURLToPath(
        new URL('./src/styles/mdi-stub.css', import.meta.url),
      ),
    },
  },
  // Library mode skips the app-mode define that normally replaces this, so the
  // Vue bundler build ships a literal `process.env.NODE_ENV` and the element
  // dies with "process is not defined" the moment a browser loads it.
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    outDir: 'dist-element',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL('./src/element.js', import.meta.url)),
      formats: ['es'],
      fileName: () => 'elan-cart-app.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: 'elan-cart-app.[ext]',
      },
    },
  },
})

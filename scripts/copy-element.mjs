/**
 * Publishes the custom element alongside the standalone app.
 *
 * The shell loads it from a stable, unhashed URL:
 *   https://sara-qadi.github.io/fashion-elan-card-checkout/elan-cart-app.js
 *
 * Copying it into dist/ means the existing GitHub Pages workflow ships it with
 * no extra deployment to configure or forget.
 */
import { copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

const from = fileURLToPath(new URL('../dist-element/elan-cart-app.js', import.meta.url))
const to = fileURLToPath(new URL('../dist/elan-cart-app.js', import.meta.url))

await mkdir(fileURLToPath(new URL('../dist', import.meta.url)), { recursive: true })
await copyFile(from, to)

console.log('copy-element: dist/elan-cart-app.js published')

/**
 * Folds dist-element/elan-cart-app.css into elan-cart-app.js.
 *
 * The shell loads this bundle cross-origin from a <script> tag. A separate
 * stylesheet would mean a second URL for every teammate to remember and a
 * flash of unstyled checkout while it loads, so the CSS is injected by the
 * bundle itself on first import.
 *
 * The style tag is keyed by id: two <elan-cart-app> elements on one page must
 * not duplicate ~600kB of Vuetify rules.
 */
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

const out = (name) => fileURLToPath(new URL(`../dist-element/${name}`, import.meta.url))

const css = await readFile(out('elan-cart-app.css'), 'utf8')
const js = await readFile(out('elan-cart-app.js'), 'utf8')

const injector = `
(function () {
  if (typeof document === 'undefined') return;
  var id = 'elan-cart-app-styles';
  if (document.getElementById(id)) return;
  var style = document.createElement('style');
  style.id = id;
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);
})();
`

await writeFile(out('elan-cart-app.js'), `${injector}\n${js}`, 'utf8')
await rm(out('elan-cart-app.css'))

console.log(`inline-element-css: folded ${(css.length / 1024).toFixed(0)}kB of CSS into the bundle`)

/**
 * <elan-cart-app> — the Cart & Checkout microfrontend as a custom element.
 *
 * This is the ONLY entry the shell loads. Importing it registers the element as
 * a side effect, so a shell needs nothing more than:
 *
 *   <script type="module" src="https://.../elan-cart-app.js"></script>
 *   <elan-cart-app route="/cart"></elan-cart-app>
 *
 * Light DOM, not shadow DOM. Vuetify teleports its overlays (dialogs, menus,
 * snackbars) to document.body and ships a global stylesheet; inside a shadow
 * root those overlays would render outside the styles that make them legible.
 * All three ELAN microfrontends share one Material palette, so light DOM is the
 * mode that actually keeps the composed page looking like one app.
 *
 * The shell owns the URL. This element never touches location or history:
 *   shell   -> element   set the `route` attribute or property
 *   element -> shell     listen for `elan:navigate` (detail.path)
 */
import { createPinia } from 'pinia'
import { defineCustomElement, h } from 'vue'
import { useRouter } from 'vue-router'

import App from '@/App.vue'
import { EMBEDDED } from '@/integration/embedded'
import { ELAN_EVENTS, onAddToCart, onIdentity } from '@/integration/checkoutBridge'
import vuetify from '@/plugins/vuetify'
import { createElementRouter, ROUTE_PATHS } from '@/router'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { useSessionStore } from '@/stores/session'
import '@/styles/main.css'

export const ELEMENT_TAG = 'elan-cart-app'

const MDI_STYLESHEET = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css'

/**
 * The element build swaps the bundled MDI webfont for this stylesheet, because
 * Vite base64-inlines assets in library mode and the font alone made the bundle
 * 7MB. Added once per document, and skipped if the shell already loaded it.
 */
function ensureIconFont() {
  if (typeof document === 'undefined') return
  const alreadyLoaded = [...document.styleSheets].some((sheet) =>
    (sheet.href ?? '').includes('materialdesignicons'),
  )
  if (alreadyLoaded || document.getElementById('elan-mdi-font')) return

  const link = document.createElement('link')
  link.id = 'elan-mdi-font'
  link.rel = 'stylesheet'
  link.href = MDI_STYLESHEET
  document.head.appendChild(link)
}

/** Paths this element will render; anything else falls back to the bag. */
function normalizeRoute(value) {
  if (typeof value !== 'string' || !value.trim()) return '/cart'
  const path = value.startsWith('/') ? value : `/${value}`
  const known = ROUTE_PATHS.some((route) => path === route || path.startsWith(`${route}?`))
  return known ? path : '/cart'
}

const ElanCartApp = defineCustomElement(
  {
    props: {
      route: { type: String, default: '/cart' },
    },

    setup(props) {
      // Installed by configureApp below, so these are the element's own.
      const router = useRouter()
      const cart = useCartStore()
      const checkout = useCheckoutStore()
      const session = useSessionStore()
      router.replace(normalizeRoute(props.route))
      return { router, cart, checkout, session }
    },

    watch: {
      // The shell drives navigation by writing this prop.
      route(value) {
        const next = normalizeRoute(value)
        if (this.router.currentRoute.value.fullPath !== next) this.router.push(next)
      },
    },

    mounted() {
      ensureIconFont()

      // Publish the restored bag so the shell's badge is right before the
      // shopper touches anything. The store's watch only fires on a change.
      this.cart.announce()

      // A reload does not replay `elan:user-logged-in`, so the identity comes
      // back from sessionStorage instead and the form is filled from it here.
      this.applyPrefill()

      // The Catalog app announces a chosen product and expects the bag to pick
      // it up. This is the one inbound event the cart acts on, and it is why
      // the shell keeps this element mounted while the shopper is browsing:
      // an unmounted cart would silently drop everything added to it.
      const stopAddToCart = onAddToCart((item) => {
        this.cart.addItem(item)
      })

      // Who is signed in, so a shopper with an account is not asked to type
      // their name, email and address into checkout all over again.
      const stopIdentity = onIdentity({
        signedIn: (user) => {
          this.session.signIn(user)
          this.applyPrefill()
        },
        profile: (profile) => {
          this.session.applyProfile(profile)
          this.applyPrefill()
        },
        signedOut: () => this.session.signOut(),
      })

      this.stopListening = () => {
        stopAddToCart()
        stopIdentity()
      }

      // Report internal navigation (Continue to Payment, Back to Cart, a guard
      // redirect) so the shell can keep the address bar in step.
      this.router.afterEach((to) => {
        this.$el?.dispatchEvent(
          new CustomEvent(ELAN_EVENTS.navigate, {
            detail: Object.freeze({ source: 'elan-cart-checkout', path: to.fullPath }),
            bubbles: true,
            composed: true,
          }),
        )
      })
    },

    methods: {
      /** Fills blank shipping fields from the account. Safe to call repeatedly. */
      applyPrefill() {
        this.checkout.prefillFromAccount(this.session.customer)
      },
    },

    unmounted() {
      this.stopListening?.()
    },

    render: () => h(App),
  },
  {
    // Vue 3.5+: render into light DOM. See the note at the top of this file.
    shadowRoot: false,

    // Runs once per element instance, so every <elan-cart-app> gets its own
    // store and router rather than sharing one bag across instances.
    configureApp(app) {
      // Pinia first: the router guards read the cart and checkout stores.
      app.use(createPinia())
      app.use(createElementRouter())
      app.use(vuetify)

      // Inside a shell there is already a header and a footer on the page, and
      // a second set of them is the most obvious way a composed page gives away
      // that it is three apps in a trench coat. The standalone build leaves this
      // undefined and keeps rendering its own chrome.
      app.provide(EMBEDDED, true)
    },
  },
)

if (typeof customElements !== 'undefined' && !customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, ElanCartApp)
}

export default ElanCartApp

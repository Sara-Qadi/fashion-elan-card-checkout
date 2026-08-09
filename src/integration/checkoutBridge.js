/**
 * PROVISIONAL microfrontend integration boundary.
 *
 * Team 1 has not chosen an integration method yet (Module Federation,
 * single-spa, Web Components, iframes...). Rather than guessing, this module
 * keeps every outward-facing interaction in one framework-independent place and
 * implements it with plain browser CustomEvents.
 *
 * The application never depends on a shell listening: if nothing responds, the
 * app simply keeps working on its own.
 *
 * IMPORTANT: only non-sensitive data is ever emitted. No address, no email, no
 * card data of any kind.
 */

export const ELAN_EVENTS = Object.freeze({
  cartUpdated: 'elan:cart-updated',
  checkoutStarted: 'elan:checkout-started',
  orderCompleted: 'elan:order-completed',
  navigateCatalog: 'elan:navigate-catalog',
  // Catalog and Account both already emit this, so it is the shared name for
  // "take the user somewhere". navigateCatalog stays as the narrower request.
  navigate: 'elan:navigate',
  addToCart: 'elan:add-to-cart',
})

export const BRIDGE_SOURCE = 'elan-cart-checkout'

function canDispatch() {
  return typeof window !== 'undefined' && typeof window.CustomEvent === 'function'
}

function dispatch(eventName, detail, { cancelable = false } = {}) {
  if (!canDispatch()) return false

  const event = new CustomEvent(eventName, {
    detail: Object.freeze({ source: BRIDGE_SOURCE, ...detail }),
    bubbles: true,
    // Team 1 agreed on bubbles + composed for every elan:* event. Composed is
    // inert while we dispatch on window, but it is what lets these events escape
    // a shadow root if this app is later wrapped as a Web Component.
    composed: true,
    cancelable,
  })

  // dispatchEvent() returns false when a listener called preventDefault(),
  // which is how a future shell can say "I handled this".
  return window.dispatchEvent(event)
}

/** Fired whenever the bag contents or totals change. */
export function notifyCartUpdated({ itemCount = 0, subtotal = 0, grandTotal = 0, currency = 'USD' } = {}) {
  dispatch(ELAN_EVENTS.cartUpdated, { itemCount, subtotal, grandTotal, currency })
}

/** Fired once when the shopper leaves the bag for the shipping step. */
export function notifyCheckoutStarted({ itemCount = 0, grandTotal = 0, currency = 'USD' } = {}) {
  dispatch(ELAN_EVENTS.checkoutStarted, { itemCount, grandTotal, currency })
}

/** Fired after a mock order is created. Safe fields only. */
export function notifyOrderCompleted({ orderId, total = 0, itemCount = 0, currency = 'USD', placedAt } = {}) {
  dispatch(ELAN_EVENTS.orderCompleted, {
    orderId,
    total,
    itemCount,
    currency,
    placedAt: placedAt ?? new Date().toISOString(),
  })
}

/**
 * Translates an inbound `elan:add-to-cart` payload into a bag line.
 *
 * The Catalog app sends `productName`, `color` and `size`; the written contract
 * says `name`, `selectedColor` and `selectedSize`. Both spellings are accepted
 * rather than making a deployed app re-release over a field name — an inbound
 * event from another team is exactly the place to be liberal about shape.
 */
export function toCartItem(detail) {
  if (!detail || typeof detail !== 'object') return null

  const name = detail.name ?? detail.productName
  const productId = detail.productId ?? detail.id
  if (!productId || typeof name !== 'string') return null

  return {
    productId: String(productId),
    name,
    price: Number(detail.price),
    quantity: Number(detail.quantity) || 1,
    color: detail.selectedColor ?? detail.color ?? '',
    size: detail.selectedSize ?? detail.size ?? null,
    image: detail.imageUrl ?? detail.image ?? '',
    category: detail.category ?? '',
  }
}

/**
 * Listens for products added from another microfrontend. Returns an unsubscribe
 * function. Events this app emitted itself are ignored, so a future shell that
 * echoes the bus cannot double-add.
 */
export function onAddToCart(handler) {
  if (!canDispatch()) return () => {}

  const listener = (event) => {
    if (event.detail?.source === BRIDGE_SOURCE) return
    const item = toCartItem(event.detail)
    if (item) handler(item, event.detail)
  }

  window.addEventListener(ELAN_EVENTS.addToCart, listener)
  return () => window.removeEventListener(ELAN_EVENTS.addToCart, listener)
}

/**
 * Asks whoever is hosting us to take the shopper back to the catalog.
 *
 * Resolution order:
 *   1. a shell listener that calls `event.preventDefault()`  → 'shell'
 *   2. a configured VITE_CATALOG_URL (public, non-secret)    → 'external'
 *   3. the supplied local fallback                           → 'fallback'
 */
export function requestCatalogNavigation({ reason = 'continue-shopping', fallback } = {}) {
  const notHandled = dispatch(ELAN_EVENTS.navigateCatalog, { reason }, { cancelable: true })

  if (!notHandled) return 'shell'

  const catalogUrl = import.meta.env?.VITE_CATALOG_URL
  if (catalogUrl) {
    window.location.assign(catalogUrl)
    return 'external'
  }

  if (typeof fallback === 'function') fallback()
  return 'fallback'
}

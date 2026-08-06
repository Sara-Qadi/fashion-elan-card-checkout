import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'

export const ROUTE_PATHS = Object.freeze([
  '/cart',
  '/checkout/shipping',
  '/checkout/payment',
  '/checkout/review',
  '/order-confirmation',
])

const routes = [
  { path: '/', redirect: { name: 'cart' } },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartView.vue'),
    meta: { title: 'Shopping Bag', step: 0 },
  },
  {
    path: '/checkout/shipping',
    name: 'checkout-shipping',
    component: () => import('@/views/ShippingView.vue'),
    meta: { title: 'Shipping', step: 1, requiresCart: true },
  },
  {
    path: '/checkout/payment',
    name: 'checkout-payment',
    component: () => import('@/views/PaymentView.vue'),
    meta: { title: 'Payment', step: 2, requiresCart: true, requiresShipping: true },
  },
  {
    path: '/checkout/review',
    name: 'checkout-review',
    component: () => import('@/views/ReviewOrderView.vue'),
    meta: {
      title: 'Review Order',
      step: 3,
      requiresCart: true,
      requiresShipping: true,
      requiresPayment: true,
    },
  },
  {
    path: '/order-confirmation',
    name: 'order-confirmation',
    // Deliberately unguarded: the view renders a friendly "no order found"
    // state instead of bouncing the shopper somewhere unexpected.
    component: () => import('@/views/OrderConfirmationView.vue'),
    meta: { title: 'Order Confirmed' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page Not Found' },
  },
]

/**
 * Two histories, one set of routes.
 *
 * Standalone the app owns the address bar, so it uses web history. Inside the
 * shell three microfrontends share one page, and three web histories would all
 * grab `location` and fight over popstate. The custom element therefore runs on
 * memory history: the shell pushes a path in, and the element reports where it
 * navigated back out. Nothing else in the app has to know which mode it is in.
 *
 * `setTitle` is off in element mode for the same reason — the shell owns the tab.
 */
export function createAppRouter({ history, setTitle = true } = {}) {
  const router = createRouter({
    history: history ?? createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
      return savedPosition ?? { top: 0 }
    },
  })

  /**
   * Step guards. A shopper can never land on a checkout step whose prerequisites
   * are missing — they are redirected to the earliest step that still needs work,
   * with a `reason` query the target page turns into a readable message.
   */
  router.beforeEach((to) => {
    const cart = useCartStore()
    const checkout = useCheckoutStore()

    if (to.meta.requiresCart && cart.isEmpty) {
      return { name: 'cart', query: { reason: 'empty-cart' } }
    }
    if (to.meta.requiresShipping && !checkout.hasValidShipping) {
      return { name: 'checkout-shipping', query: { reason: 'missing-shipping' } }
    }
    if (to.meta.requiresPayment && !checkout.hasValidPayment) {
      return { name: 'checkout-payment', query: { reason: 'missing-payment' } }
    }

    return true
  })

  if (setTitle) {
    router.afterEach((to) => {
      document.title = to.meta?.title ? `${to.meta.title} · ELAN` : 'ELAN — Cart & Checkout'
    })
  }

  return router
}

/**
 * No module-level router instance on purpose: creating one here would attach a
 * web history (and its popstate listener) merely by importing this file, which
 * is exactly what the element build must not do.
 */
export function createElementRouter() {
  return createAppRouter({ history: createMemoryHistory(), setTitle: false })
}

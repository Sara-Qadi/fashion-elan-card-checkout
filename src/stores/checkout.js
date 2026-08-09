import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { useCartStore } from '@/stores/cart'
import { notifyCheckoutStarted, notifyOrderCompleted } from '@/integration/checkoutBridge'
import { publishSharedOrder } from '@/integration/sharedOrders'
import { CURRENCY } from '@/utils/currency'
import {
  DEFAULT_SHIPPING_METHOD_ID,
  calculateTotals,
  getLineTotal,
  getShippingMethod,
} from '@/utils/pricing'
import { STORAGE_KEYS, readJSON, removeKey, writeJSON } from '@/utils/storage'
import { buildDeliveryEstimate, generateOrderId } from '@/utils/order'
import {
  EMPTY_SHIPPING_ADDRESS,
  normalizeShippingAddress,
  validateShippingAddress,
} from '@/utils/validation'

const PAYMENT_METHODS = ['card', 'cod']
const PLACE_ORDER_DELAY_MS = 1200

function loadCheckoutState() {
  const stored = readJSON(STORAGE_KEYS.checkout)

  const fallback = {
    shippingAddress: { ...EMPTY_SHIPPING_ADDRESS },
    shippingMethodId: DEFAULT_SHIPPING_METHOD_ID,
    paymentMethod: null,
    safePaymentSummary: null,
  }

  if (!stored || typeof stored !== 'object') return fallback

  const paymentMethod = PAYMENT_METHODS.includes(stored.paymentMethod) ? stored.paymentMethod : null

  return {
    shippingAddress: normalizeShippingAddress(stored.shippingAddress),
    shippingMethodId: getShippingMethod(stored.shippingMethodId).id,
    paymentMethod,
    // Never trust a persisted summary that carries more than brand + last4.
    safePaymentSummary: paymentMethod ? sanitizePaymentSummary(stored.safePaymentSummary) : null,
  }
}

function sanitizePaymentSummary(summary) {
  if (!summary || typeof summary !== 'object') return null
  if (!PAYMENT_METHODS.includes(summary.method)) return null

  return {
    method: summary.method,
    label: String(summary.label ?? ''),
    description: String(summary.description ?? ''),
    brand: summary.brand ? String(summary.brand) : null,
    last4: summary.last4 ? String(summary.last4).slice(-4) : null,
    cardHolder: summary.cardHolder ? String(summary.cardHolder) : null,
  }
}

function loadLastOrder() {
  const stored = readJSON(STORAGE_KEYS.lastOrder)
  if (!stored || typeof stored !== 'object' || !stored.id || !Array.isArray(stored.items)) return null
  return stored
}

export const useCheckoutStore = defineStore('checkout', () => {
  const cart = useCartStore()
  const persisted = loadCheckoutState()

  const shippingAddress = ref(persisted.shippingAddress)
  const shippingMethodId = ref(persisted.shippingMethodId)
  const paymentMethod = ref(persisted.paymentMethod)
  const safePaymentSummary = ref(persisted.safePaymentSummary)
  const orderConfirmation = ref(loadLastOrder())
  const isPlacingOrder = ref(false)

  /* ----------------------------------------------------------- getters */

  /** The authoritative price breakdown for the whole app. */
  const totals = computed(() =>
    calculateTotals({
      items: cart.items,
      discountRate: cart.appliedDiscount,
      shippingMethodId: shippingMethodId.value,
    }),
  )

  const shippingMethod = computed(() => getShippingMethod(shippingMethodId.value))
  const shippingCost = computed(() => totals.value.shippingCost)
  const grandTotal = computed(() => totals.value.grandTotal)

  const shippingValidation = computed(() => validateShippingAddress(shippingAddress.value))
  const hasValidShipping = computed(() => shippingValidation.value.valid)

  const hasValidPayment = computed(
    () => PAYMENT_METHODS.includes(paymentMethod.value) && Boolean(safePaymentSummary.value),
  )

  const hasCompletedOrder = computed(() => Boolean(orderConfirmation.value))

  const customerName = computed(() =>
    [shippingAddress.value.firstName, shippingAddress.value.lastName].filter(Boolean).join(' '),
  )

  const deliveryEstimate = computed(() => buildDeliveryEstimate(shippingMethod.value))

  /* ----------------------------------------------------------- actions */

  /**
   * Keeps in-progress typing (and therefore localStorage) up to date without
   * trimming — trimming mid-keystroke would stop the shopper typing spaces.
   */
  function setShippingDraft(address) {
    shippingAddress.value = { ...EMPTY_SHIPPING_ADDRESS, ...(address ?? {}) }
  }

  /** Commits the address: trims every field, then reports validity. */
  function saveShippingAddress(address) {
    shippingAddress.value = normalizeShippingAddress(address ?? shippingAddress.value)
    return validateShippingAddress(shippingAddress.value)
  }

  function selectShippingMethod(id) {
    shippingMethodId.value = getShippingMethod(id).id
  }

  /**
   * @param {'card'|'cod'} method
   * @param {object|null} summary  Safe summary only (brand + last 4). The full
   *                               card number and CVV never reach this store.
   */
  function setPaymentMethod(method, summary = null) {
    if (!PAYMENT_METHODS.includes(method)) {
      paymentMethod.value = null
      safePaymentSummary.value = null
      return
    }
    paymentMethod.value = method
    safePaymentSummary.value = sanitizePaymentSummary(summary)
  }

  function clearPaymentSummary() {
    safePaymentSummary.value = null
  }

  function startCheckout() {
    notifyCheckoutStarted({
      itemCount: totals.value.itemCount,
      grandTotal: totals.value.grandTotal,
      currency: CURRENCY,
    })
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  /**
   * Builds the mock order, persists it, then clears the working state.
   * The snapshot is written before anything is cleared so a refresh on the
   * confirmation page always finds a complete order.
   */
  async function createOrder() {
    if (isPlacingOrder.value) return null
    if (cart.isEmpty || !hasValidShipping.value || !hasValidPayment.value) return null

    isPlacingOrder.value = true

    try {
      await delay(PLACE_ORDER_DELAY_MS)

      const placedAt = new Date()
      const breakdown = totals.value
      const method = shippingMethod.value

      const order = {
        id: generateOrderId(placedAt),
        createdAt: placedAt.toISOString(),
        currency: CURRENCY,
        items: cart.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          category: item.category,
          color: item.color,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          imageAlt: item.imageAlt,
          lineTotal: getLineTotal(item),
        })),
        shippingAddress: { ...shippingAddress.value },
        delivery: {
          id: method.id,
          label: method.label,
          estimate: method.estimate,
          cost: breakdown.shippingCost,
          window: buildDeliveryEstimate(method, placedAt),
        },
        payment: { ...safePaymentSummary.value },
        promoCode: cart.hasPromoApplied ? cart.promoCode : null,
        totals: {
          subtotal: breakdown.subtotal,
          discountAmount: breakdown.discountAmount,
          discountedSubtotal: breakdown.discountedSubtotal,
          shippingCost: breakdown.shippingCost,
          taxAmount: breakdown.taxAmount,
          grandTotal: breakdown.grandTotal,
          itemCount: breakdown.itemCount,
        },
      }

      orderConfirmation.value = order
      writeJSON(STORAGE_KEYS.lastOrder, order)

      // Before the event, not after: Account looks the order up in the shared
      // store the moment it hears about it, and drops anything it cannot find.
      publishSharedOrder(order)

      notifyOrderCompleted({
        orderId: order.id,
        total: order.totals.grandTotal,
        itemCount: order.totals.itemCount,
        currency: CURRENCY,
        placedAt: order.createdAt,
      })

      clearCheckoutAfterOrder()
      return order
    } finally {
      isPlacingOrder.value = false
    }
  }

  /** Empties the bag and the checkout form — but keeps `orderConfirmation`. */
  function clearCheckoutAfterOrder() {
    cart.clearCart()
    shippingAddress.value = { ...EMPTY_SHIPPING_ADDRESS }
    shippingMethodId.value = DEFAULT_SHIPPING_METHOD_ID
    paymentMethod.value = null
    safePaymentSummary.value = null
  }

  /** Full demo reset: fresh sample bag, no order, blank checkout. */
  function resetDemo() {
    clearCheckoutAfterOrder()
    orderConfirmation.value = null
    removeKey(STORAGE_KEYS.lastOrder)
    cart.resetDemoCart()
  }

  /* ------------------------------------------------------- persistence */

  watch(
    [shippingAddress, shippingMethodId, paymentMethod, safePaymentSummary],
    () => {
      writeJSON(STORAGE_KEYS.checkout, {
        shippingAddress: shippingAddress.value,
        shippingMethodId: shippingMethodId.value,
        paymentMethod: paymentMethod.value,
        safePaymentSummary: safePaymentSummary.value,
      })
    },
    { deep: true },
  )

  return {
    shippingAddress,
    shippingMethodId,
    paymentMethod,
    safePaymentSummary,
    orderConfirmation,
    isPlacingOrder,

    totals,
    shippingMethod,
    shippingCost,
    grandTotal,
    shippingValidation,
    hasValidShipping,
    hasValidPayment,
    hasCompletedOrder,
    customerName,
    deliveryEstimate,

    setShippingDraft,
    saveShippingAddress,
    selectShippingMethod,
    setPaymentMethod,
    clearPaymentSummary,
    startCheckout,
    createOrder,
    clearCheckoutAfterOrder,
    resetDemo,
  }
})

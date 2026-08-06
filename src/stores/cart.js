import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { createSampleCart } from '@/data/sampleCart'
import { notifyCartUpdated } from '@/integration/checkoutBridge'
import { CURRENCY } from '@/utils/currency'
import { PRICING_RULES, calculateTotals, getLineTotal, resolvePromoCode } from '@/utils/pricing'
import { STORAGE_KEYS, readJSON, writeJSON } from '@/utils/storage'

const MAX_QUANTITY = PRICING_RULES.maxQuantityPerLine

function clampQuantity(value) {
  const quantity = Math.trunc(Number(value))
  if (!Number.isFinite(quantity) || quantity < 1) return 1
  return Math.min(quantity, MAX_QUANTITY)
}

/** Rebuilds a persisted line, discarding anything that does not look like a product. */
function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (!raw.id || typeof raw.name !== 'string') return null

  const price = Number(raw.price)
  if (!Number.isFinite(price) || price < 0) return null

  return {
    id: String(raw.id),
    productId: raw.productId ? String(raw.productId) : String(raw.id),
    name: raw.name,
    category: raw.category ? String(raw.category) : '',
    color: raw.color ? String(raw.color) : '',
    size: raw.size ? String(raw.size) : null,
    price,
    originalPrice: Number.isFinite(Number(raw.originalPrice)) ? Number(raw.originalPrice) : null,
    quantity: clampQuantity(raw.quantity),
    image: raw.image ? String(raw.image) : '',
    imageAlt: raw.imageAlt ? String(raw.imageAlt) : raw.name,
  }
}

function loadPersistedState() {
  const stored = readJSON(STORAGE_KEYS.cart)
  const fallback = { items: createSampleCart(), promoCode: '', discountRate: 0 }

  if (!stored || typeof stored !== 'object' || !Array.isArray(stored.items)) {
    return fallback
  }

  const items = stored.items.map(normalizeItem).filter(Boolean)

  // A stored promo is only honoured if it is still a real code.
  const promo = resolvePromoCode(stored.promoCode)

  return {
    items,
    promoCode: promo.valid ? promo.code : '',
    discountRate: promo.valid ? promo.rate : 0,
  }
}

export const useCartStore = defineStore('cart', () => {
  const persisted = loadPersistedState()

  const items = ref(persisted.items)
  const promoCode = ref(persisted.promoCode)
  const appliedDiscount = ref(persisted.discountRate)

  /* ----------------------------------------------------------- getters */

  // Merchandise-level figures. Shipping-aware totals live in the checkout
  // store, which calls the same calculateTotals() helper — one rule set.
  const merchandise = computed(() =>
    calculateTotals({ items: items.value, discountRate: appliedDiscount.value }),
  )

  const itemCount = computed(() => merchandise.value.itemCount)
  const subtotal = computed(() => merchandise.value.subtotal)
  const discountAmount = computed(() => merchandise.value.discountAmount)
  const discountedSubtotal = computed(() => merchandise.value.discountedSubtotal)
  const taxAmount = computed(() => merchandise.value.taxAmount)

  const isEmpty = computed(() => items.value.length === 0)
  const hasPromoApplied = computed(() => appliedDiscount.value > 0 && Boolean(promoCode.value))

  const lineTotals = computed(() =>
    items.value.reduce((map, item) => {
      map[item.id] = getLineTotal(item)
      return map
    }, {}),
  )

  /* ----------------------------------------------------------- actions */

  function findItem(id) {
    return items.value.find((item) => item.id === id) ?? null
  }

  function updateQuantity(id, quantity) {
    const item = findItem(id)
    if (!item) return
    item.quantity = clampQuantity(quantity)
  }

  function incrementQuantity(id) {
    const item = findItem(id)
    if (!item) return
    item.quantity = clampQuantity(item.quantity + 1)
  }

  function decrementQuantity(id) {
    const item = findItem(id)
    if (!item) return
    item.quantity = clampQuantity(item.quantity - 1) // never drops below 1
  }

  function removeItem(id) {
    const item = findItem(id)
    if (!item) return null
    items.value = items.value.filter((entry) => entry.id !== id)
    if (items.value.length === 0) removePromoCode()
    return item
  }

  function clearCart() {
    items.value = []
    removePromoCode()
  }

  /** Demo affordance: puts the sample bag back so the flow can be replayed. */
  function resetDemoCart() {
    items.value = createSampleCart()
    removePromoCode()
  }

  function applyPromoCode(rawCode) {
    const result = resolvePromoCode(rawCode)

    if (!result.valid) {
      return { ok: false, message: result.message }
    }
    if (hasPromoApplied.value && promoCode.value === result.code) {
      return { ok: false, message: `${result.code} is already applied to this order.` }
    }
    if (hasPromoApplied.value) {
      return { ok: false, message: 'Only one promo code can be applied per order.' }
    }
    if (isEmpty.value) {
      return { ok: false, message: 'Add something to your bag before applying a promo code.' }
    }

    promoCode.value = result.code
    appliedDiscount.value = result.rate
    return { ok: true, message: `${result.code} applied — ${result.message}` }
  }

  function removePromoCode() {
    const previous = promoCode.value
    promoCode.value = ''
    appliedDiscount.value = 0
    return previous
  }

  /* ------------------------------------------------------- persistence */

  /**
   * Broadcasts the current bag without changing it.
   *
   * The watch below only fires on a change, so a shell that mounts this app
   * with three items already restored from localStorage would show an empty
   * bag badge until the shopper touched something. The element calls this once
   * on mount to publish where the cart already is.
   */
  function announce() {
    notifyCartUpdated({
      itemCount: itemCount.value,
      subtotal: subtotal.value,
      grandTotal: merchandise.value.grandTotal,
      currency: CURRENCY,
    })
  }

  watch(
    [items, promoCode, appliedDiscount],
    () => {
      writeJSON(STORAGE_KEYS.cart, {
        items: items.value,
        promoCode: promoCode.value,
        discountRate: appliedDiscount.value,
      })

      announce()
    },
    { deep: true },
  )

  return {
    items,
    promoCode,
    appliedDiscount,

    itemCount,
    subtotal,
    discountAmount,
    discountedSubtotal,
    taxAmount,
    isEmpty,
    hasPromoApplied,
    lineTotals,

    findItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    clearCart,
    announce,
    resetDemoCart,
    applyPromoCode,
    removePromoCode,
  }
})

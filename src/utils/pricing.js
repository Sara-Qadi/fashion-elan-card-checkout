import { roundMoney } from './currency'

/**
 * Every money rule in the application lives here. Stores and components read
 * these results — they never re-implement a calculation.
 */

export const PRICING_RULES = {
  taxRate: 0.05, // 5% of the discounted merchandise subtotal
  freeShippingThreshold: 150, // discounted merchandise subtotal, in USD
  maxQuantityPerLine: 10,
  promoCodes: {
    ELAN10: { rate: 0.1, label: '10% off your order' },
  },
}

export const SHIPPING_METHODS = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    estimate: '3–5 business days',
    minDays: 3,
    maxDays: 5,
    price: 8,
    eligibleForFreeShipping: true,
  },
  {
    id: 'express',
    label: 'Express Delivery',
    estimate: '1–2 business days',
    minDays: 1,
    maxDays: 2,
    price: 18,
    eligibleForFreeShipping: false,
  },
]

export const DEFAULT_SHIPPING_METHOD_ID = 'standard'

export function getShippingMethod(id) {
  return (
    SHIPPING_METHODS.find((method) => method.id === id) ??
    SHIPPING_METHODS.find((method) => method.id === DEFAULT_SHIPPING_METHOD_ID)
  )
}

export function getLineTotal(item) {
  return roundMoney(Number(item?.price ?? 0) * Number(item?.quantity ?? 0))
}

/**
 * Full price breakdown for a set of cart lines.
 *
 * Rules:
 *  - discount        = subtotal × discountRate (ELAN10 → 10%)
 *  - shipping        = $8 standard / $18 express; standard is free once the
 *                      discounted merchandise subtotal reaches $150
 *  - tax             = 5% of the discounted merchandise subtotal
 *  - grand total     = discounted subtotal + shipping + tax
 */
export function calculateTotals({
  items = [],
  discountRate = 0,
  shippingMethodId = DEFAULT_SHIPPING_METHOD_ID,
} = {}) {
  const lines = Array.isArray(items) ? items : []

  const itemCount = lines.reduce((total, item) => total + Number(item?.quantity ?? 0), 0)
  const subtotal = roundMoney(
    lines.reduce((total, item) => total + Number(item?.price ?? 0) * Number(item?.quantity ?? 0), 0),
  )

  const safeRate = Number.isFinite(Number(discountRate)) ? Number(discountRate) : 0
  const discountAmount = roundMoney(subtotal * safeRate)
  const discountedSubtotal = roundMoney(subtotal - discountAmount)

  const method = getShippingMethod(shippingMethodId)
  const qualifiesForFreeShipping =
    method.eligibleForFreeShipping && discountedSubtotal >= PRICING_RULES.freeShippingThreshold

  const shippingCost = itemCount === 0 || qualifiesForFreeShipping ? 0 : method.price
  const taxAmount = roundMoney(discountedSubtotal * PRICING_RULES.taxRate)
  const grandTotal = roundMoney(discountedSubtotal + shippingCost + taxAmount)

  return {
    itemCount,
    subtotal,
    discountAmount,
    discountedSubtotal,
    shippingCost,
    taxAmount,
    grandTotal,
    qualifiesForFreeShipping,
    shippingMethod: method,
  }
}

/** Validates a user-typed promo code. Case-insensitive, whitespace tolerant. */
export function resolvePromoCode(rawCode) {
  const code = String(rawCode ?? '').trim().toUpperCase()

  if (!code) {
    return { valid: false, code: '', rate: 0, message: 'Enter a promo code first.' }
  }

  const promo = PRICING_RULES.promoCodes[code]
  if (!promo) {
    return { valid: false, code, rate: 0, message: `“${code}” is not a valid promo code.` }
  }

  return { valid: true, code, rate: promo.rate, message: promo.label }
}

/** How much more the shopper needs to spend to unlock free standard shipping. */
export function amountUntilFreeShipping(discountedSubtotal) {
  return Math.max(0, roundMoney(PRICING_RULES.freeShippingThreshold - Number(discountedSubtotal ?? 0)))
}

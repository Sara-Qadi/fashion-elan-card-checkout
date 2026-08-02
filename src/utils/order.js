import { CARD_BRANDS, detectCardBrand, digitsOnly } from './validation'

/** Order-number, delivery-estimate and "safe payment summary" helpers. */

/** Human-readable mock order number, e.g. ELN-2026-482731. */
export function generateOrderId(date = new Date()) {
  const year = date.getFullYear()
  const sequence = Math.floor(100000 + Math.random() * 900000)
  return `ELN-${year}-${sequence}`
}

function addBusinessDays(startDate, days) {
  const result = new Date(startDate.getTime())
  let remaining = days

  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    const weekday = result.getDay()
    if (weekday !== 0 && weekday !== 6) remaining -= 1
  }

  return result
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

/** Turns a shipping method into a `{ from, to, label }` delivery window. */
export function buildDeliveryEstimate(shippingMethod, placedAt = new Date()) {
  const from = addBusinessDays(placedAt, shippingMethod?.minDays ?? 3)
  const to = addBusinessDays(placedAt, shippingMethod?.maxDays ?? 5)

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    label: `${dateFormatter.format(from)} – ${dateFormatter.format(to)}`,
  }
}

export function formatOrderDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return Number.isNaN(date.getTime()) ? '' : longDateFormatter.format(date)
}

/**
 * Builds the ONLY representation of a payment that is allowed to leave the
 * payment form: brand + last four digits. The PAN and CVV stay in component
 * state and are never returned here.
 */
export function buildSafePaymentSummary({ method, cardNumber = '', cardName = '' } = {}) {
  if (method === 'cod') {
    return {
      method: 'cod',
      label: 'Cash on Delivery',
      description: 'Pay the courier when your order arrives.',
      brand: null,
      last4: null,
      cardHolder: null,
    }
  }

  const digits = digitsOnly(cardNumber)
  const brand = detectCardBrand(digits)
  const last4 = digits.slice(-4)

  return {
    method: 'card',
    label: `${CARD_BRANDS[brand]?.label ?? 'Card'} ending in ${last4}`,
    description: 'Demo checkout — no real payment is processed.',
    brand,
    last4,
    cardHolder: String(cardName ?? '').trim() || null,
  }
}

export function buildOrderItemSummary(items = []) {
  if (!items.length) return ''
  const [first, ...rest] = items
  if (!rest.length) return first.name
  return `${first.name} + ${rest.length} more item${rest.length > 1 ? 's' : ''}`
}

/**
 * The shared order store that the Account & Orders microfrontend reads.
 *
 * WHY THIS EXISTS
 *
 * `elan:order-completed` deliberately carries almost nothing: an order id, a
 * total, an item count and a timestamp. No address, no email, no payment field
 * of any kind. That is a hard rule of this app — customer data does not travel
 * on the event bus, where any script on the page could listen for it.
 *
 * But Account has to build an order history, and it cannot do that from four
 * numbers. So the detail goes into same-origin localStorage instead, and the
 * event stays a notification: "order <id> happened, go and look". Account reads
 * the snapshot by id when it receives the event.
 *
 * THE CONTRACT
 *
 * The key, the envelope and the snapshot shape are defined by Account, in
 * src/models/shared-order.model.ts of the Account repo. This module is the
 * producer side of that contract and has to match it exactly — Account
 * validates every field and rejects the whole order if one is wrong.
 *
 * Payment is absent from the shape by design. Nothing here can carry a card
 * number, a CVV, or a cardholder name.
 */
import { CURRENCY } from '@/utils/currency'

const STORAGE_KEY = 'elan:shared-orders:v1'
const STORE_VERSION = 1

/** Old orders are of no interest and the quota is not infinite. */
const MAX_STORED_ORDERS = 20

/**
 * Account rejects a snapshot whose product has an empty imageUrl, and products
 * added from the Catalog app arrive without one — it does not send an image in
 * `elan:add-to-cart`. A neutral on-brand tile keeps a real order out of the
 * reject pile over a missing photograph.
 */
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 120'%3E%3Crect width='96' height='120' fill='%23F7EDE9'/%3E%3Ctext x='48' y='68' font-family='Roboto,sans-serif' font-size='28' fill='%237B1E3A' text-anchor='middle'%3EE%3C/text%3E%3C/svg%3E"

function toSnapshot(order) {
  const address = order.shippingAddress ?? {}
  const totals = order.totals ?? {}

  return {
    orderId: order.id,
    status: 'processing',
    paymentStatus: 'paid',

    products: (order.items ?? []).map((item) => ({
      productId: String(item.productId ?? item.id),
      name: item.name,
      imageUrl: item.image || PLACEHOLDER_IMAGE,
      unitPrice: item.price,
      quantity: item.quantity,
      // Omitted rather than sent empty: Account renders 'N/A' for a missing
      // one, and an empty string would read as a real, blank choice.
      ...(item.color ? { selectedColor: item.color } : {}),
      ...(item.size ? { selectedSize: item.size } : {}),
    })),

    shippingAddress: {
      recipientName: [address.firstName, address.lastName].filter(Boolean).join(' '),
      phone: address.phone ?? '',
      country: address.country ?? '',
      city: address.city ?? '',
      street: address.street ?? '',
      building: address.apartment ?? '',
      postalCode: address.postalCode ?? '',
    },

    pricing: {
      subtotal: totals.subtotal ?? 0,
      shipping: totals.shippingCost ?? 0,
      discount: totals.discountAmount ?? 0,
      tax: totals.taxAmount ?? 0,
      total: totals.grandTotal ?? 0,
      currency: CURRENCY,
    },

    placedAt: order.createdAt,
    estimatedDeliveryDate: order.delivery?.window?.to,
  }
}

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (parsed?.version === STORE_VERSION && Array.isArray(parsed.orders)) return parsed
  } catch {
    // Corrupt or unreadable: start over rather than lose this order too.
  }
  return { version: STORE_VERSION, orders: [] }
}

/**
 * Publishes an order for Account to pick up. Must run BEFORE
 * `elan:order-completed` is emitted: Account reads the store synchronously
 * inside its handler, and an order it cannot find there is dropped.
 *
 * Never throws. A full quota or a private-mode window must not be able to fail
 * a checkout that has otherwise succeeded.
 */
export function publishSharedOrder(order) {
  if (!order?.id) return false

  try {
    const store = readStore()
    const orders = store.orders.filter((entry) => entry?.orderId !== order.id)

    orders.unshift(toSnapshot(order))
    orders.length = Math.min(orders.length, MAX_STORED_ORDERS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORE_VERSION, orders }))
    return true
  } catch {
    return false
  }
}

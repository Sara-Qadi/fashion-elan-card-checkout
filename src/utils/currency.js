/** Currency helpers — the app is USD-only and formats money in exactly one place. */

export const CURRENCY = 'USD'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Rounds to 2 decimals, avoiding float artefacts such as 19.484999999. */
export function roundMoney(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 0
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export function formatCurrency(value) {
  return formatter.format(roundMoney(value))
}

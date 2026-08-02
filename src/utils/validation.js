/**
 * Shared validation helpers.
 *
 * Vuetify rules return `true` or an error string. The same predicates are also
 * used by the checkout store (and therefore by the router guards), so "is this
 * shipping address good enough to continue?" has exactly one answer.
 */

export const trimValue = (value) => String(value ?? '').trim()
export const isFilled = (value) => trimValue(value).length > 0
export const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '')

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const POSTAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/

/* ---------------------------------------------------------------- contact */

export const requiredRule = (label = 'This field') => (value) =>
  isFilled(value) || `${label} is required.`

export const emailRule = (value) =>
  !isFilled(value) || EMAIL_PATTERN.test(trimValue(value)) || 'Enter a valid email, e.g. name@example.com.'

/** Deliberately permissive: digits, spaces, +, - and () are all accepted. */
export const phoneRule = (value) => {
  if (!isFilled(value)) return true
  const digits = digitsOnly(value)
  return (digits.length >= 7 && digits.length <= 15) || 'Enter a valid phone number (7–15 digits).'
}

export const postalCodeRule = (value) =>
  !isFilled(value) || POSTAL_PATTERN.test(trimValue(value)) || 'Enter a valid postal code.'

export const minLengthRule = (length, label = 'This field') => (value) =>
  !isFilled(value) || trimValue(value).length >= length || `${label} must be at least ${length} characters.`

export const maxLengthRule = (length, label = 'This field') => (value) =>
  trimValue(value).length <= length || `${label} must be ${length} characters or fewer.`

/* ------------------------------------------------------- shipping address */

export const EMPTY_SHIPPING_ADDRESS = Object.freeze({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  street: '',
  apartment: '',
  postalCode: '',
  instructions: '',
})

const REQUIRED_ADDRESS_FIELDS = [
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['email', 'Email address'],
  ['phone', 'Phone number'],
  ['country', 'Country'],
  ['city', 'City'],
  ['street', 'Street address'],
  ['postalCode', 'Postal code'],
]

/** Returns `{ valid, errors }` for a whole address object. */
export function validateShippingAddress(address) {
  const errors = {}
  const value = address ?? {}

  REQUIRED_ADDRESS_FIELDS.forEach(([field, label]) => {
    if (!isFilled(value[field])) errors[field] = `${label} is required.`
  })

  if (isFilled(value.email) && emailRule(value.email) !== true) {
    errors.email = 'Enter a valid email, e.g. name@example.com.'
  }
  if (isFilled(value.phone) && phoneRule(value.phone) !== true) {
    errors.phone = 'Enter a valid phone number (7–15 digits).'
  }
  if (isFilled(value.postalCode) && postalCodeRule(value.postalCode) !== true) {
    errors.postalCode = 'Enter a valid postal code.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

/** Trims every string field so stored data never carries stray whitespace. */
export function normalizeShippingAddress(address) {
  const source = address ?? {}
  return Object.keys(EMPTY_SHIPPING_ADDRESS).reduce((result, field) => {
    result[field] = trimValue(source[field])
    return result
  }, {})
}

/* ------------------------------------------------------------ mock card */

export const CARD_BRANDS = {
  visa: { label: 'Visa', icon: 'mdi-credit-card-outline', cvvLength: 3 },
  mastercard: { label: 'Mastercard', icon: 'mdi-credit-card-outline', cvvLength: 3 },
  amex: { label: 'American Express', icon: 'mdi-credit-card-outline', cvvLength: 4 },
  discover: { label: 'Discover', icon: 'mdi-credit-card-outline', cvvLength: 3 },
  unknown: { label: 'Card', icon: 'mdi-credit-card-outline', cvvLength: 3 },
}

export function detectCardBrand(cardNumber) {
  const digits = digitsOnly(cardNumber)
  if (/^4/.test(digits)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard'
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^6(?:011|5)/.test(digits)) return 'discover'
  return 'unknown'
}

/** Groups digits 4-by-4 (4-6-5 for Amex) purely for readability. */
export function formatCardNumber(value) {
  const digits = digitsOnly(value)
  const brand = detectCardBrand(digits)

  if (brand === 'amex') {
    const limited = digits.slice(0, 15)
    return [limited.slice(0, 4), limited.slice(4, 10), limited.slice(10, 15)].filter(Boolean).join(' ')
  }

  return (digits.slice(0, 16).match(/.{1,4}/g) ?? []).join(' ')
}

export function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

/** Standard Luhn checksum — keeps obviously fake numbers out of the demo. */
export function isLuhnValid(cardNumber) {
  const digits = digitsOnly(cardNumber)
  if (digits.length < 12) return false

  let sum = 0
  let double = false

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }

  return sum % 10 === 0
}

export const cardNameRule = (value) =>
  isFilled(value) ? trimValue(value).length >= 2 || 'Enter the full name printed on the card.' : 'Name on card is required.'

export const cardNumberRule = (value) => {
  const digits = digitsOnly(value)
  if (!digits) return 'Card number is required.'
  const expected = detectCardBrand(digits) === 'amex' ? [15] : [16]
  if (!expected.includes(digits.length)) {
    return `Card number must be ${expected[0]} digits.`
  }
  return isLuhnValid(digits) || 'This card number is not valid. Try 4242 4242 4242 4242.'
}

export const expiryRule = (value) => {
  const raw = trimValue(value)
  if (!raw) return 'Expiration date is required.'

  const match = raw.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return 'Use the MM/YY format.'

  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return 'Month must be between 01 and 12.'

  const now = new Date()
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)
  return endOfMonth >= now || 'This card has expired.'
}

export const cvvRule = (brand) => (value) => {
  const digits = digitsOnly(value)
  if (!digits) return 'CVV is required.'
  const expected = CARD_BRANDS[brand]?.cvvLength ?? 3
  return digits.length === expected || `CVV must be ${expected} digits.`
}

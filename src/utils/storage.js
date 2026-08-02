/**
 * Thin, defensive localStorage wrapper.
 *
 * Every read is wrapped so a corrupted or hand-edited value can never crash the
 * app; a value that fails to parse is dropped and the caller gets its fallback.
 * Nothing else in the codebase touches window.localStorage directly.
 */

const PREFIX = 'elan.checkout.'

export const STORAGE_KEYS = {
  cart: `${PREFIX}cart.v1`,
  checkout: `${PREFIX}checkout.v1`,
  lastOrder: `${PREFIX}last-order.v1`,
}

function detectStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false
    const probe = `${PREFIX}__probe__`
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    // Private mode, disabled storage or a full quota — run in-memory instead.
    return false
  }
}

const isAvailable = detectStorage()

export function readJSON(key, fallback = null) {
  if (!isAvailable) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    return parsed === null || parsed === undefined ? fallback : parsed
  } catch {
    removeKey(key)
    return fallback
  }
}

export function writeJSON(key, value) {
  if (!isAvailable) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  if (!isAvailable) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* nothing useful to do here */
  }
}

export function clearElanStorage() {
  Object.values(STORAGE_KEYS).forEach(removeKey)
}

export const storageAvailable = isAvailable

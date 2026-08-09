import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

/**
 * Who is signed in, as far as this app is concerned.
 *
 * This app has no accounts of its own and never will — that is the Account
 * microfrontend's job. It only listens: `elan:user-logged-in` and
 * `elan:user-registered` bring a user in, `elan:user-logged-out` takes them
 * away, and `elan:profile-updated` fills in the rest.
 *
 * It exists so a shopper who already has an account does not have to type their
 * name, email, phone and address into checkout a second time.
 *
 * Stored in **sessionStorage**, deliberately, for two reasons: it mirrors where
 * the Account app keeps its own session, so the two cannot disagree after the
 * tab is closed; and a signed-in identity is not something to leave on a shared
 * machine the way a shopping bag can be.
 */
const SESSION_KEY = 'elan.checkout.session.v1'

function read() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' && parsed.id ? parsed : null
  } catch {
    return null
  }
}

/** The Account app carries one `fullName`; the shipping form wants two fields. */
function splitName(fullName) {
  const parts = String(fullName ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export const useSessionStore = defineStore('session', () => {
  const customer = ref(read())

  const isSignedIn = computed(() => Boolean(customer.value))

  /** From `elan:user-logged-in` / `elan:user-registered`. */
  function signIn(user) {
    if (!user?.id) return

    const { firstName, lastName } = splitName(user.fullName)

    customer.value = {
      id: String(user.id),
      firstName,
      lastName,
      email: String(user.email ?? ''),
      phone: String(user.phone ?? ''),
      // Only a saved address can supply this; a bare user object cannot.
      address: customer.value?.id === String(user.id) ? customer.value.address : null,
    }
  }

  /**
   * From `elan:profile-updated`, which carries the full customer profile —
   * including saved addresses, which the login event does not.
   */
  function applyProfile(profile) {
    if (!profile?.userId) return

    const saved = Array.isArray(profile.addresses) ? profile.addresses : []
    const preferred = saved.find((entry) => entry?.isDefault) ?? saved[0] ?? null

    customer.value = {
      id: String(profile.userId),
      firstName: String(profile.firstName ?? ''),
      lastName: String(profile.lastName ?? ''),
      email: String(profile.email ?? ''),
      phone: String(profile.phone ?? ''),
      address: preferred
        ? {
            country: String(preferred.country ?? ''),
            city: String(preferred.city ?? ''),
            street: String(preferred.street ?? ''),
            apartment: String(preferred.building ?? ''),
            postalCode: String(preferred.postalCode ?? ''),
            phone: String(preferred.phone ?? ''),
          }
        : null,
    }
  }

  function signOut() {
    customer.value = null
  }

  watch(
    customer,
    (value) => {
      try {
        if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value))
        else sessionStorage.removeItem(SESSION_KEY)
      } catch {
        // Private mode: the identity is still correct for this page.
      }
    },
    { deep: true },
  )

  return { customer, isSignedIn, signIn, applyProfile, signOut }
})

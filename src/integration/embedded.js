import { inject } from 'vue'

/**
 * Whether this app is running inside the ELAN shell rather than on its own.
 *
 * Provided as `true` by the custom-element build (see src/element.js) and left
 * undefined by the standalone build, so `useEmbedded()` answers false there
 * without either entry having to know about the other.
 *
 * It exists for one reason: the shell renders the header, the nav and the
 * footer for all three microfrontends, so this app must not render its own or
 * the composed page shows two of each.
 */
export const EMBEDDED = Symbol('elan:embedded')

export function useEmbedded() {
  return inject(EMBEDDED, false)
}

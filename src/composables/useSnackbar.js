import { reactive, readonly } from 'vue'

/**
 * Tiny app-wide snackbar service so any component can give feedback without
 * prop-drilling — and so the app never falls back to window.alert().
 */

const state = reactive({
  visible: false,
  message: '',
  color: 'primary',
  icon: 'mdi-information-outline',
  timeout: 3600,
})

let reopenTimer = null

function show(message, { color = 'primary', icon = 'mdi-information-outline', timeout = 3600 } = {}) {
  if (!message) return

  const apply = () => {
    state.message = message
    state.color = color
    state.icon = icon
    state.timeout = timeout
    state.visible = true
  }

  if (state.visible) {
    // Close first so a new message re-triggers the enter animation.
    state.visible = false
    clearTimeout(reopenTimer)
    reopenTimer = setTimeout(apply, 140)
    return
  }

  apply()
}

export function useSnackbar() {
  return {
    snackbar: readonly(state),
    state,
    show,
    success: (message) => show(message, { color: 'success', icon: 'mdi-check-circle-outline' }),
    error: (message) => show(message, { color: 'error', icon: 'mdi-alert-circle-outline', timeout: 4800 }),
    info: (message) => show(message, { color: 'primary', icon: 'mdi-information-outline' }),
    hide: () => {
      state.visible = false
    },
  }
}

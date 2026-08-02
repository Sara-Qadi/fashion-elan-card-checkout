import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import { ELAN_THEME_NAME, elanLightTheme } from '@/theme/elanTheme'

/**
 * Component defaults do most of the re-skinning work, so individual templates
 * stay free of repeated `variant` / `density` / `rounded` props.
 */
export default createVuetify({
  theme: {
    defaultTheme: ELAN_THEME_NAME,
    themes: {
      [ELAN_THEME_NAME]: elanLightTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  defaults: {
    VCard: {
      color: 'surface',
      elevation: 0,
    },
    VBtn: {
      color: 'primary',
      rounded: 'pill',
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      autoGrow: true,
      rows: 2,
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },
    VAlert: {
      variant: 'tonal',
      rounded: 'lg',
      density: 'comfortable',
    },
    VChip: {
      rounded: 'pill',
    },
    VCheckbox: {
      color: 'primary',
      hideDetails: 'auto',
    },
    VRadioGroup: {
      color: 'primary',
      hideDetails: 'auto',
    },
    VSnackbar: {
      rounded: 'lg',
      location: 'bottom',
    },
  },
})

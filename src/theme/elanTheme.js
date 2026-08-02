/**
 * ELAN design tokens — the single source of truth for the brand palette.
 *
 * This file is intentionally framework-agnostic (plain JS objects) so the other
 * Team 1 microfrontends (Catalog & Discovery, Account & Orders) can copy or
 * import the same values and stay visually consistent once the group picks an
 * integration method.
 */

export const elanTokens = {
  primary: '#7B1E3A',
  primaryDark: '#5E1229',
  primarySoft: '#F7E9EC',
  secondary: '#C8A27A',
  secondarySoft: '#F6EDE2',
  background: '#FFF9F6',
  surface: '#FFFFFF',
  text: '#211A1D',
  textMuted: '#6F6267',
  border: '#EDE0DB',
  error: '#BA1A1A',
  success: '#2F6A4F',
  warning: '#8A6116',
  info: '#3C5B78',
}

/** 8px spacing system. */
export const spacing = {
  unit: 8,
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
}

export const radii = {
  card: '16px',
  input: '12px',
  chip: '999px',
  thumbnail: '12px',
}

export const shadows = {
  soft: '0 1px 2px rgba(33, 26, 29, 0.04), 0 6px 20px rgba(33, 26, 29, 0.05)',
  lifted: '0 2px 6px rgba(33, 26, 29, 0.06), 0 14px 34px rgba(33, 26, 29, 0.09)',
}

export const typography = {
  fontFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif",
}

/** Vuetify theme definition built from the tokens above. */
export const elanLightTheme = {
  dark: false,
  colors: {
    primary: elanTokens.primary,
    'on-primary': '#FFFFFF',
    secondary: elanTokens.secondary,
    'on-secondary': '#2B1E12',
    background: elanTokens.background,
    'on-background': elanTokens.text,
    surface: elanTokens.surface,
    'on-surface': elanTokens.text,
    'surface-bright': elanTokens.surface,
    'surface-light': elanTokens.background,
    'surface-variant': elanTokens.textMuted,
    'on-surface-variant': '#FFFFFF',
    error: elanTokens.error,
    'on-error': '#FFFFFF',
    success: elanTokens.success,
    'on-success': '#FFFFFF',
    warning: elanTokens.warning,
    'on-warning': '#FFFFFF',
    info: elanTokens.info,
    'on-info': '#FFFFFF',
  },
  variables: {
    'border-color': elanTokens.text,
    'border-opacity': 0.1,
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.72,
    'disabled-opacity': 0.38,
  },
}

export const ELAN_THEME_NAME = 'elan'

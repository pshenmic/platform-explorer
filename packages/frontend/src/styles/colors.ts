/**
 * Chakra color map — values come from CSS tokens (styles/tokens/palette.css).
 * Prefer var(--pe-color-*) in new CSS; keep this object for Chakra components.
 */
export const colors = {
  brand: {
    normal: 'var(--pe-color-brand-normal)',
    'normal-rgb': 'var(--pe-color-brand-normal-rgb)',
    deep: 'var(--pe-color-brand-deep)',
    shaded: 'var(--pe-color-brand-shaded)',
    light: 'var(--pe-color-brand-light)',
    'light-rgb': 'var(--pe-color-brand-light-rgb)',
    pressed: 'var(--pe-color-brand-pressed)'
  },
  white: {
    50: 'var(--pe-color-white-50)'
  },
  red: {
    default: 'var(--pe-color-red-default)',
    'default-rgb': 'var(--pe-color-red-default-rgb)'
  },
  yellow: {
    default: 'var(--pe-color-yellow-default)'
  },
  green: {
    default: 'var(--pe-color-green-default)',
    'default-rgb': 'var(--pe-color-green-default-rgb)',
    label: 'var(--pe-color-green-label)',
    'label-rgb': 'var(--pe-color-green-label-rgb)',
    emeralds: 'var(--pe-color-green-emeralds)',
    'emeralds-rgb': 'var(--pe-color-green-emeralds-rgb)'
  },
  orange: {
    default: 'var(--pe-color-orange-default)',
    'default-rgb': 'var(--pe-color-orange-default-rgb)'
  },
  gray: {
    50: 'var(--pe-color-gray-50)',
    100: 'var(--pe-color-gray-100)',
    200: 'var(--pe-color-gray-200)',
    250: 'var(--pe-color-gray-250)',
    '250-rgb': 'var(--pe-color-gray-250-rgb)',
    300: 'var(--pe-color-gray-300)',
    400: 'var(--pe-color-gray-400)',
    500: 'var(--pe-color-gray-500)',
    525: 'var(--pe-color-gray-525)',
    550: 'var(--pe-color-gray-550)',
    600: 'var(--pe-color-gray-600)',
    650: 'var(--pe-color-gray-650)',
    675: 'var(--pe-color-gray-675)',
    '675-rgb': 'var(--pe-color-gray-675-rgb)',
    700: 'var(--pe-color-gray-700)',
    750: 'var(--pe-color-gray-750)',
    800: 'var(--pe-color-gray-800)',
    '800-rgb': 'var(--pe-color-gray-800-rgb)',
    900: 'var(--pe-color-gray-900)'
  }
}

export const badgeColors = {
  red: {
    bg: 'rgba(var(--pe-color-red-default-rgb), .2)',
    bgHover: '',
    text: 'var(--pe-color-red-default)'
  },
  green: {
    bg: 'rgba(var(--pe-color-green-label-rgb), .2)',
    bgHover: '',
    text: 'var(--pe-color-green-label)'
  },
  gray: {
    bg: 'rgba(255,255,255, .2)',
    bgHover: 'rgba(255,255,255, .3)',
    text: 'var(--pe-color-white-50)',
    border: 'var(--pe-color-gray-750)'
  },
  dimGray: {
    bg: 'var(--pe-color-gray-800)',
    bgHover: 'var(--pe-color-gray-700)',
    text: 'var(--pe-color-gray-250)'
  },
  blue: {
    bg: 'rgba(var(--pe-color-brand-normal-rgb), 0.2)',
    bgHover: 'rgba(var(--pe-color-brand-light-rgb), .2)',
    text: 'var(--pe-color-brand-light)'
  },
  yellow: {
    bg: 'rgba(244, 228, 88, 0.2)',
    bgHover: '',
    text: '#F4E458'
  },
  orange: {
    bg: 'rgba(var(--pe-color-orange-default-rgb), .2)',
    bgHover: '',
    text: 'var(--pe-color-orange-default)'
  },
  emerald: {
    bg: 'rgba(var(--pe-color-green-emeralds-rgb), .2)',
    bgHover: '',
    text: 'var(--pe-color-green-emeralds)'
  }
}

export const colors = {
  brand: {
    normal: '#008DE4',
    'normal-rgb': '0, 141, 228',
    deep: '#0E75B5',
    shaded: '#165278',
    light: '#2CBBFF',
    'light-rgb': '44, 187, 255',
    pressed: '#0493EB'
  },
  white: {
    50: '#FFFFFF'
  },
  red: {
    default: '#F45858',
    'default-rgb': '244, 88, 88'
  },
  yellow: {
    default: '#FFD205'
  },
  green: {
    default: '#1CC400',
    'default-rgb': '28, 196, 0',
    label: '#81F458',
    'label-rgb': '129, 244, 88',
    emeralds: '#58F4BC',
    'emeralds-rgb': '88, 244, 188'
  },
  orange: {
    default: '#f49a58',
    'default-rgb': '244, 154, 88'
  },
  gray: {
    50: '#f0f1f2',
    100: '#e0e3e5',
    200: '#c6cacd',
    250: '#93aab2',
    '250-rgb': '147, 170, 178',
    300: '#acb1b4',
    400: '#94999c',
    500: '#7b7f83',
    525: '#849099',
    550: '#52585d6b',
    600: '#62676a',
    650: '#232C30',
    675: '#21272C',
    '675-rgb': '33, 39, 44',
    700: '#494e51',
    750: '#39454C',
    800: '#2e393d',
    '800-rgb': '46, 57, 61',
    900: '#181d20'
  }
}

export const badgeColors = {
  red: {
    bg: `rgba(${colors.red['default-rgb']}, .2)`,
    bgHover: '',
    text: colors.red.default
  },
  green: {
    bg: `rgba(${colors.green['label-rgb']}, .2)`,
    bgHover: '',
    text: colors.green.label
  },
  gray: {
    bg: 'rgba(255,255,255, .2)',
    bgHover: 'rgba(255,255,255, .3)',
    text: '#fff'
  },
  dimGray: {
    bg: colors.gray[800],
    bgHover: colors.gray[700],
    text: colors.gray[250]
  },
  blue: {
    bg: 'rgba(0, 141, 228, 0.2)',
    bgHover: `rgba(${colors.brand['light-rgb']}, .2)`,
    text: colors.brand.light
  },
  yellow: {
    bg: 'rgba(244, 228, 88, 0.2)',
    bgHover: '',
    text: '#F4E458'
  },
  orange: {
    bg: `rgba(${colors.orange['default-rgb']}, .2)`,
    bgHover: '',
    text: colors.orange.default
  },
  emerald: {
    bg: `rgba(${colors.green['emeralds-rgb']}, .2)`,
    bgHover: '',
    text: colors.green.emeralds
  }
}

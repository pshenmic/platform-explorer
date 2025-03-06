import { badgeColors } from '../colors'

const Button = {
  baseStyle: {
    fontFamily: 'heading',
    textTransform: 'uppercase',
    borderRadius: '10px',
    letterSpacing: '0.4px',
    fontWeight: '700'
  },
  sizes: {
    xxs: {
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      padding: '0.438rem'
    },
    sm: {
      fontSize: '0.75rem'
    },
    md: {
      fontSize: '0.75rem'
    }
  },
  variants: {
    customGreen: {
      bg: 'green.default',
      color: '#fff',
      _hover: {
        bg: 'green.label'
      }
    },
    blue: {
      bg: badgeColors.blue.bg,
      color: badgeColors.blue.text,
      _hover: {
        bg: badgeColors.blue.bgHover
      }
    },
    gray: {
      bg: badgeColors.gray.bg,
      color: badgeColors.gray.text,
      _hover: {
        bg: badgeColors.gray.bgHover
      }
    }
  }
}

export default Button

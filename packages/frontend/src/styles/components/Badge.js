import { badgeColors } from '../colors'

const Badge = {
  baseStyle: props => {
    const { colorScheme } = props

    return {
      borderWidth: '0px',
      padding: '0 0.75rem',
      borderRadius: '999px',
      fontFamily: 'mono',
      fontSize: '0.625rem',
      fontWeight: '400',
      textTransform: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: '1.25rem',
      bg: badgeColors[colorScheme].bg || 'gray.500',
      color: badgeColors[colorScheme].text || 'white'
    }
  },
  sizes: {
    xs: {
      lineHeight: '1.125rem',
      padding: '0 0.5rem'
    }
  }
}

export default Badge

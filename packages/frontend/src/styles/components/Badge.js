import { badgeColors } from '../colors'

const Badge = {
  baseStyle: props => {
    const { colorScheme } = props

    return {
      borderWidth: '0px',
      padding: '0 12px',
      borderRadius: '999px',
      fontFamily: 'mono',
      fontSize: '0.625rem',
      fontWeight: '400',
      textTransform: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: '20px',
      bg: badgeColors[colorScheme].bg || 'gray.500',
      color: badgeColors[colorScheme].text || 'white'
    }
  }
}

export default Badge

import { Badge } from '@chakra-ui/react'

const TokenEmergencyActionBadge = ({ type, size = 'sm', ...props }) => {
  const colorScheme = {
    pause: 'red',
    resume: 'green',
    default: 'gray'
  }

  return (
    <Badge
      size={size}
      colorScheme={colorScheme?.[String(type).toLowerCase()]}
      {...props}
    >
      {type}
    </Badge>
  )
}

export default TokenEmergencyActionBadge

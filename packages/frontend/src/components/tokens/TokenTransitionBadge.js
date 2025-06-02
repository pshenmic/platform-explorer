import { Badge } from '@chakra-ui/react'
import { TokenTransitionEnum, TokenTransitionInfo } from '../../enums/tokenTransition'

const TokenTransitionBadge = ({ typeId, size = 'sm', ...props }) => {
  const transitionType = TokenTransitionEnum[typeId]
  const transitionInfo = TokenTransitionInfo[transitionType]

  if (!transitionType || !transitionInfo) {
    return (
      <Badge size={size} colorScheme="gray" {...props}>
        Unknown
      </Badge>
    )
  }

  return (
    <Badge
      size={size}
      colorScheme={transitionInfo.colorScheme}
      title={transitionInfo.description}
      {...props}
    >
      {transitionInfo.title}
    </Badge>
  )
}

export default TokenTransitionBadge

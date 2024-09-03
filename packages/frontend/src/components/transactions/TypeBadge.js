import { Badge } from '@chakra-ui/react'
import { getTransitionTypeString } from '../../util/index'
import { StateTransitionEnum } from '../../enums/state.transition.type'

function TypeBadge ({ type }) {
  const color = (() => {
    if (type === StateTransitionEnum.DATA_CONTRACT_CREATE) return 'blue'
    if (type === StateTransitionEnum.DATA_CONTRACT_UPDATE) return 'yellow'
    if (type === StateTransitionEnum.DOCUMENTS_BATCH) return 'gray'
    if (type === StateTransitionEnum.IDENTITY_CREATE) return 'blue'
    if (type === StateTransitionEnum.IDENTITY_TOP_UP) return 'emerald'
    if (type === StateTransitionEnum.IDENTITY_UPDATE) return 'yellow'
    if (type === StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL) return 'red'
    if (type === StateTransitionEnum.IDENTITY_CREDIT_TRANSFER) return 'orange'
  })()

  return (
    <Badge colorScheme={color}>
      {getTransitionTypeString(type)}
    </Badge>
  )
}

export default TypeBadge

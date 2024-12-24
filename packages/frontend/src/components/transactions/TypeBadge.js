import { Badge } from '@chakra-ui/react'
import { getTransitionTypeKeyById } from '../../util/index'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'

function TypeBadge ({ typeId, type, ...props }) {
  const TransitionTypeKey = typeof typeId === 'number' ? getTransitionTypeKeyById(typeId) : type

  return (
    <Tooltip
      title={TransactionTypesInfo?.[TransitionTypeKey]?.title}
      content={TransactionTypesInfo?.[TransitionTypeKey]?.description}
      placement={'top'}
    >
      <Badge
        colorScheme={TransactionTypesInfo?.[TransitionTypeKey]?.colorScheme}
        {...props}
      >
        {TransactionTypesInfo?.[TransitionTypeKey]?.title}
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge

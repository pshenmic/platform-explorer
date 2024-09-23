import { Badge } from '@chakra-ui/react'
import { getTransitionTypeStringById, getTransitionTypeKeyById } from '../../util/index'
import { TransactionTypesColors } from '../../enums/state.transition.type'

function TypeBadge ({ typeId }) {
  const TransitionTypeKey = getTransitionTypeKeyById(typeId)

  return (
    <Badge colorScheme={TransactionTypesColors[TransitionTypeKey]}>
      {getTransitionTypeStringById(typeId)}
    </Badge>
  )
}

export default TypeBadge

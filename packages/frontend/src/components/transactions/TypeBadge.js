import { Badge } from '@chakra-ui/react'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'

function TypeBadge ({ type, ...props }) {
  return (
    <Tooltip
      title={TransactionTypesInfo?.[type]?.title}
      content={TransactionTypesInfo?.[type]?.description}
      placement={'top'}
    >
      <Badge
        colorScheme={TransactionTypesInfo?.[type]?.colorScheme}
        {...props}
      >
        {TransactionTypesInfo?.[type]?.title}
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge

import { Badge } from '@chakra-ui/react'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'
import { getTransitionTypeKeyById } from '../../util'

function TypeBadge ({ type, ...props }) {
  const transitionType = getTransitionTypeKeyById(type)
  const TransferTypesTitle = {
    IDENTITY_TOP_UP: 'Credit Top Up',
    IDENTITY_CREDIT_WITHDRAWAL: 'Credit Withdrawal',
    IDENTITY_CREATE: 'Identity create',
    IDENTITY_CREDIT_TRANSFER: 'Credit Transfer'
  }

  return (
    <Tooltip
      title={TransferTypesTitle[transitionType]}
      content={TransactionTypesInfo?.[transitionType]?.description}
      placement={'top'}
    >
      <Badge
        colorScheme={TransactionTypesInfo?.[transitionType]?.colorScheme}
        {...props}
      >
        {TransferTypesTitle[transitionType]}
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge

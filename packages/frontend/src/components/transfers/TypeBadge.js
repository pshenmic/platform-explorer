import { Badge } from '@chakra-ui/react'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'

function TypeBadge ({ type, ...props }) {
  const TransferTypesTitle = {
    IDENTITY_TOP_UP: 'Credit Top Up',
    IDENTITY_CREDIT_WITHDRAWAL: 'Credit Withdrawal',
    IDENTITY_CREATE: 'Identity create',
    IDENTITY_CREDIT_TRANSFER: 'Credit Transfer'
  }

  return (
    <Tooltip
      title={TransferTypesTitle[type]}
      content={TransactionTypesInfo?.[type]?.description}
      placement={'top'}
    >
      <Badge
        colorScheme={TransactionTypesInfo?.[type]?.colorScheme}
        {...props}
      >
        {TransferTypesTitle[type]}
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge

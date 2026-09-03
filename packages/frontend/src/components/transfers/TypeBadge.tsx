import { Badge } from '@chakra-ui/react'
import type { BadgeProps } from '@chakra-ui/react'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'

const TransferTypesTitle: Record<string, string> = {
  IDENTITY_TOP_UP: 'Credit Top Up',
  IDENTITY_CREDIT_WITHDRAWAL: 'Credit Withdrawal',
  IDENTITY_CREATE: 'Identity create',
  IDENTITY_CREDIT_TRANSFER: 'Credit Transfer'
}

interface TypeBadgeProps extends BadgeProps {
  type: string
}

function TypeBadge({ type, ...props }: TypeBadgeProps) {
  const info = TransactionTypesInfo[type as keyof typeof TransactionTypesInfo]

  return (
    <Tooltip title={TransferTypesTitle[type]} content={info?.description} placement={'top'}>
      <Badge colorScheme={info?.colorScheme} {...props}>
        {TransferTypesTitle[type]}
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge

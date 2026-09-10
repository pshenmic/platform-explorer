import { Badge } from '@chakra-ui/react'
import type { BadgeProps } from '@chakra-ui/react'
import { BatchActions } from '../../enums/batchTypes'
import { Tooltip } from '../ui/Tooltips'

interface BatchTypeBadgeProps extends BadgeProps {
  batchType?: string | null
}

function BatchTypeBadge({ batchType, ...props }: BatchTypeBadgeProps) {
  const batchInfo = batchType ? BatchActions[batchType as keyof typeof BatchActions] : undefined

  if (!batchInfo) {
    return (
      <Badge colorScheme="gray" {...props}>
        <span className={'TransactionsListItem__TypeBadgeLabel'}>{batchType}</span>
      </Badge>
    )
  }

  return (
    <Tooltip title={batchInfo.title} content={batchInfo.description} placement={'top'}>
      <Badge colorScheme={batchInfo.colorScheme} {...props}>
        <span className={'TransactionsListItem__TypeBadgeLabel'}>{batchInfo.title}</span>
      </Badge>
    </Tooltip>
  )
}

export default BatchTypeBadge

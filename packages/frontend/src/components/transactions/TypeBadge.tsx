import { Badge } from '@chakra-ui/react'
import type { BadgeProps } from '@chakra-ui/react'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'

interface TypeBadgeProps extends BadgeProps {
  type?: string | null
}

function TypeBadge ({ type, ...props }: TypeBadgeProps) {
  const info = type
    ? TransactionTypesInfo[type as keyof typeof TransactionTypesInfo]
    : undefined

  return (
    <Tooltip
      title={info?.title}
      content={info?.description}
      placement={'top'}
    >
      <Badge
        colorScheme={info?.colorScheme}
        {...props}
      >
        <span className={'TransactionsListItem__TypeBadgeLabel'}>{info?.title}</span>
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge

import { Badge } from '@chakra-ui/react'
import type { BadgeProps } from '@chakra-ui/react'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'
import './TypeBadge.css'

interface TypeBadgeProps extends BadgeProps {
  type?: string | null
}

function TypeBadge({ type, className, ...props }: TypeBadgeProps) {
  const info = type ? TransactionTypesInfo[type as keyof typeof TransactionTypesInfo] : undefined

  return (
    <Tooltip title={info?.title} content={info?.description} placement={'top'}>
      <Badge
        className={`TypeBadge ${className || ''}`.trim()}
        colorScheme={info?.colorScheme}
        {...props}
      >
        <span className={'TypeBadge__Label'}>{info?.title}</span>
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge

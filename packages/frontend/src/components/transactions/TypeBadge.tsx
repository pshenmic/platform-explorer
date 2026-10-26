import { Badge } from '../ui/Badge'
import type { BadgeProps } from '../ui/Badge'
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
        colorScheme={info?.colorScheme ?? 'gray'}
        {...props}
      >
        <span className={'TypeBadge__Label'}>{info?.title ?? type ?? 'Unknown'}</span>
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge

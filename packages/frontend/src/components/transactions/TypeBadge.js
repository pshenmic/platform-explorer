import { Badge } from '@chakra-ui/react'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'
import './TypeBadge.scss'

function TypeBadge ({ type, className = '', ...props }) {
  return (
    <Tooltip
      title={TransactionTypesInfo?.[type]?.title}
      content={TransactionTypesInfo?.[type]?.description}
      placement={'top'}
    >
      <Badge
        className={`TypeBadge ${className}`.trim()}
        colorScheme={TransactionTypesInfo?.[type]?.colorScheme}
        {...props}
      >
        <span className={'TypeBadge__Label'}>{TransactionTypesInfo?.[type]?.title}</span>
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge

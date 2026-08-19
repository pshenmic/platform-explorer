import { Badge } from '@chakra-ui/react'
import { BatchActions } from '../../enums/batchTypes'
import { Tooltip } from '../ui/Tooltips'
import './TypeBadge.scss'

function BatchTypeBadge ({ batchType, className = '', ...props }) {
  const batchInfo = BatchActions?.[batchType]
  const badgeClass = `TypeBadge ${className}`.trim()

  if (!batchInfo) {
    return (
      <Badge className={badgeClass} colorScheme='gray' {...props}>
        <span className={'TypeBadge__Label'}>{batchType}</span>
      </Badge>
    )
  }

  return (
    <Tooltip
      title={batchInfo.title}
      content={batchInfo.description}
      placement={'top'}
    >
      <Badge className={badgeClass} colorScheme={batchInfo.colorScheme} {...props}>
        <span className={'TypeBadge__Label'}>{batchInfo.title}</span>
      </Badge>
    </Tooltip>
  )
}

export default BatchTypeBadge

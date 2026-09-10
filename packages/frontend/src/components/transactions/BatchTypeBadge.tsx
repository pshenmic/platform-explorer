import { Badge } from '@chakra-ui/react'
import { BatchActions } from '../../enums/batchTypes'
import { Tooltip } from '../ui/Tooltips'
import './TypeBadge.css'

function BatchTypeBadge({
  batchType,
  className = '',
  ...props
}: {
  batchType: string
  className?: string
  [key: string]: unknown
}) {
  const batchInfo = BatchActions?.[batchType as keyof typeof BatchActions]
  const badgeClass = `TypeBadge ${className}`.trim()

  if (!batchInfo) {
    return (
      <Badge className={badgeClass} colorScheme="gray" {...props}>
        <span className={'TypeBadge__Label'}>{batchType}</span>
      </Badge>
    )
  }

  return (
    <Tooltip title={batchInfo.title} content={batchInfo.description} placement={'top'}>
      <Badge className={badgeClass} colorScheme={batchInfo.colorScheme} {...props}>
        <span className={'TypeBadge__Label'}>{batchInfo.title}</span>
      </Badge>
    </Tooltip>
  )
}

export default BatchTypeBadge

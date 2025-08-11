import { Badge } from '@chakra-ui/react'
import { BatchActions } from '../../enums/batchTypes'
import { Tooltip } from '../ui/Tooltips'

function BatchTypeBadge ({ batchType, ...props }) {
  const batchInfo = BatchActions?.[batchType]

  if (!batchInfo) {
    return <Badge colorScheme='gray' {...props}>{batchType}</Badge>
  }

  return (
    <Tooltip
      title={batchInfo.title}
      content={batchInfo.description}
      placement={'top'}
    >
      <Badge colorScheme={batchInfo.colorScheme} {...props}>
        {batchInfo.title}
      </Badge>
    </Tooltip>
  )
}

export default BatchTypeBadge
